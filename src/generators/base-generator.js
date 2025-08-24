import fs from "fs-extra";
import path from "path";

import { createErrorHandler, ERROR_TYPES } from "../errors/index.js";
import { setupApi } from "../features/api/index.js";
import { setupRedux } from "../features/redux/index.js";
import { setupZustand } from "../features/zustand/index.js";
import { createDirectoryStructure } from "../lib/file-generation/index.js";
import { setupLinting } from "../lib/linting.js";
import { TestingSetup } from "../lib/testing/index.js";
import { setupTypeScript } from "../lib/typescript.js";
import { UI_UTILS } from "../utils/index.js";

/**
 * Abstract base class for all project generators
 * Implements the Template Method pattern to eliminate duplication
 */
export class BaseGenerator {
  constructor(frameworkName) {
    this.frameworkName = frameworkName;
    this.errorHandler = createErrorHandler();
  }

  /**
   * Main generation method - Template Method pattern
   * This defines the skeleton of the generation algorithm
   */
  async generate(projectPath, projectName, userChoices) {
    this.errorHandler.setContext({
      projectPath,
      projectName,
      framework: this.frameworkName,
      userChoices,
    });

    return this.errorHandler.withErrorHandling(
      async () => {
        // Step 2: Create base structure
        await this.createBaseStructure(projectPath);

        // Step 3: Create package.json
        await this.createPackageConfiguration(projectPath, projectName, userChoices);

        // Step 4: Create framework-specific config files
        await this.createFrameworkConfiguration(projectPath, userChoices);

        // Step 5: Create project files (source, routing, etc.)
        await this.createProjectFiles(projectPath, projectName, userChoices);

        // Step 6: Setup optional features
        await this.setupOptionalFeatures(projectPath, userChoices);

        // Step 7: Create framework-specific files
        await this.createFrameworkSpecificFiles(projectPath, userChoices);

        return true;
      },
      {
        type: ERROR_TYPES.FILESYSTEM,
        shouldCleanup: true,
      },
    );
  }

  /**
   * Step 2: Create base directory structure
   */
  async createBaseStructure(projectPath) {
    createDirectoryStructure(projectPath, this.frameworkName);
  }

  /**
   * Step 3: Create package.json - Must be implemented by subclasses
   */
  async createPackageConfiguration(projectPath, projectName, userChoices) {
    throw new Error("createPackageConfiguration must be implemented by subclass");
  }

  /**
   * Step 4: Create framework-specific configuration files - Must be implemented by subclasses
   */
  async createFrameworkConfiguration(projectPath, userChoices) {
    throw new Error("createFrameworkConfiguration must be implemented by subclass");
  }

  /**
   * Step 5: Create project files (source, routing, etc.) - Must be implemented by subclasses
   */
  async createProjectFiles(projectPath, projectName, userChoices) {
    throw new Error("createProjectFiles must be implemented by subclass");
  }

  /**
   * Step 6: Setup optional features (common across all frameworks)
   */
  async setupOptionalFeatures(projectPath, userChoices) {
    // Linting setup
    if (userChoices.linting) {
      setupLinting(projectPath, userChoices, this.frameworkName);
    }

    // TypeScript setup
    if (userChoices.typescript) {
      setupTypeScript(projectPath, userChoices, this.frameworkName);
    }

    // State management setup
    await this.setupStateManagement(projectPath, userChoices);

    // API setup
    await this.setupApi(projectPath, userChoices);

    // Testing setup
    await this.setupTesting(projectPath, userChoices);

    // Deployment setup
    await this.setupDeployment(projectPath, userChoices);
  }

  /**
   * Setup state management (common logic)
   */
  async setupStateManagement(projectPath, userChoices) {
    if (userChoices.stateManagement === "redux") {
      setupRedux(projectPath, userChoices, this.frameworkName);
    } else if (userChoices.stateManagement === "zustand") {
      setupZustand(projectPath, userChoices, this.frameworkName);
    }
  }

  /**
   * Setup API configuration (common logic)
   */
  async setupApi(projectPath, userChoices) {
    if (userChoices.api && userChoices.api !== "none") {
      setupApi(projectPath, userChoices, this.frameworkName);
    }
  }

  /**
   * Setup testing configuration (common logic)
   */
  async setupTesting(projectPath, userChoices) {
    if (userChoices.testing && userChoices.testing !== "none") {
      const testingSetup = new TestingSetup(projectPath, userChoices);
      await testingSetup.generateExampleTests();
    }
  }

  /**
   * Setup deployment configuration (common logic)
   */
  async setupDeployment(projectPath, userChoices) {
    if (userChoices.deployment && userChoices.deployment !== "none") {
      await this.createDeploymentConfiguration(projectPath, userChoices);
    }
  }

  /**
   * Create deployment configuration files
   */
  async createDeploymentConfiguration(projectPath, userChoices) {
    const { deployment, framework } = userChoices;

    try {
      if (deployment === "vercel") {
        await this.createVercelConfiguration(projectPath, framework);
      } else if (deployment === "netlify") {
        await this.createNetlifyConfiguration(projectPath, framework, userChoices);
      }
    } catch (error) {
      UI_UTILS.error(`Failed to create deployment configuration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Vercel configuration
   */
  async createVercelConfiguration(projectPath, framework) {
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: "package.json",
          use: framework === "nextjs" ? "@vercel/next" : "@vercel/static-build",
        },
      ],
    };

    // Add framework-specific settings
    if (framework === "vite") {
      vercelConfig.buildCommand = "npm run build";
      vercelConfig.outputDirectory = "dist";
    }

    // Add default region for better performance
    if (framework === "nextjs") {
      vercelConfig.regions = ["iad1"]; // US East - good default
    }

    const configPath = path.join(projectPath, "vercel.json");
    await fs.writeFile(configPath, JSON.stringify(vercelConfig, null, 2));
  }

  /**
   * Create Netlify configuration
   */
  async createNetlifyConfiguration(projectPath, framework, userChoices) {
    let netlifyConfig = `# Netlify configuration
[build]
  publish = "${framework === "nextjs" ? "out" : "dist"}"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

    // Add framework-specific settings
    if (framework === "nextjs") {
      netlifyConfig += `
[[plugins]]
  package = "@netlify/plugin-nextjs"
`;

      // Create next.config.js for static export
      await this.createNextjsStaticConfig(projectPath, userChoices);
    }

    const configPath = path.join(projectPath, "netlify.toml");
    await fs.writeFile(configPath, netlifyConfig);
  }

  /**
   * Create Next.js static export configuration for Netlify
   */
  async createNextjsStaticConfig(projectPath, userChoices) {
    const config = {
      output: "export",
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
    };

    // Add TypeScript config if enabled
    if (userChoices.typescript) {
      config.typescript = {
        ignoreBuildErrors: false,
      };
    }

    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = ${JSON.stringify(config, null, 2)};

module.exports = nextConfig;
`;

    const configPath = path.join(projectPath, "next.config.js");
    await fs.writeFile(configPath, nextConfig);
  }

  /**
   * Step 7: Create framework-specific files - Must be implemented by subclasses
   */
  async createFrameworkSpecificFiles(projectPath, userChoices) {
    throw new Error("createFrameworkSpecificFiles must be implemented by subclass");
  }

  /**
   * Utility method to check if a feature should be enabled
   */
  isFeatureEnabled(userChoices, feature) {
    return userChoices[feature] && userChoices[feature] !== "none";
  }

  /**
   * Utility method for conditional feature setup
   */
  async setupFeatureIf(condition, setupFunction, ...args) {
    if (condition) {
      await setupFunction(...args);
    }
  }
}
