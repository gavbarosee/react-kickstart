import fs from "fs-extra";
import path from "path";
import { DependencyResolver } from "./dependency-resolver.js";

/**
 * Builder class for generating package.json files with framework-specific configurations
 */
export class PackageJsonBuilder {
  constructor(framework) {
    this.framework = framework;
    this.dependencyResolver = new DependencyResolver(framework);
    this.packageData = {
      dependencies: {},
      devDependencies: {},
    };
  }

  /**
   * Set basic package information
   */
  setBasicInfo(projectName, options = {}) {
    const defaults = this.getFrameworkDefaults();

    this.packageData = {
      ...this.packageData,
      name: projectName,
      version: options.version || defaults.version,
      private:
        options.private !== undefined ? options.private : defaults.private,
      ...defaults.packageFields,
    };

    return this;
  }

  /**
   * Set npm scripts based on framework
   */
  setScripts(customScripts = {}, userChoices = {}) {
    const defaultScripts = this.getFrameworkScripts();
    const testingScripts = this.getTestingScripts(userChoices.testing);
    const deploymentScripts = this.getDeploymentScripts(
      userChoices.deployment,
      userChoices.packageManager
    );

    this.packageData.scripts = {
      ...defaultScripts,
      ...testingScripts,
      ...deploymentScripts,
      ...customScripts,
    };

    return this;
  }

  /**
   * Add core React dependencies
   */
  addCoreDependencies() {
    const coreDeps = this.dependencyResolver.getCoreDependencies();
    this.packageData.dependencies = {
      ...this.packageData.dependencies,
      ...coreDeps,
    };

    return this;
  }

  /**
   * Add framework-specific dependencies
   */
  addFrameworkDependencies() {
    const frameworkDeps = this.dependencyResolver.getFrameworkDependencies();

    // Framework deps can go to dependencies or devDependencies based on framework
    if (this.framework === "vite") {
      this.packageData.devDependencies = {
        ...this.packageData.devDependencies,
        ...frameworkDeps,
      };
    } else {
      this.packageData.dependencies = {
        ...this.packageData.dependencies,
        ...frameworkDeps,
      };
    }

    return this;
  }

  /**
   * Add TypeScript dependencies if enabled
   */
  addTypeScriptDependencies(userChoices) {
    if (!userChoices.typescript) return this;

    const tsDeps = this.dependencyResolver.getTypeScriptDependencies();

    // Next.js puts TypeScript in dependencies, Vite puts in devDependencies
    if (this.framework === "nextjs") {
      this.packageData.dependencies = {
        ...this.packageData.dependencies,
        ...tsDeps,
      };
    } else {
      this.packageData.devDependencies = {
        ...this.packageData.devDependencies,
        ...tsDeps,
      };
    }

    return this;
  }

  /**
   * Add linting dependencies if enabled
   */
  addLintingDependencies(userChoices) {
    if (!userChoices.linting) return this;

    const lintingDeps = this.dependencyResolver.getLintingDependencies(
      userChoices.typescript
    );

    // Linting always goes to devDependencies for Vite, Next.js handles it internally mostly
    if (this.framework === "vite") {
      this.packageData.devDependencies = {
        ...this.packageData.devDependencies,
        ...lintingDeps,
      };
    }

    return this;
  }

  /**
   * Add styling dependencies based on choice
   */
  addStylingDependencies(userChoices) {
    if (!userChoices.styling || userChoices.styling === "css") return this;

    const stylingDeps = this.dependencyResolver.getStylingDependencies(
      userChoices.styling
    );

    // Styling dependencies placement varies by framework and styling type
    if (userChoices.styling === "tailwind") {
      if (this.framework === "nextjs") {
        this.packageData.dependencies = {
          ...this.packageData.dependencies,
          ...stylingDeps,
        };
      } else {
        this.packageData.devDependencies = {
          ...this.packageData.devDependencies,
          ...stylingDeps,
        };
      }
    } else if (userChoices.styling === "styled-components") {
      // styled-components library goes to dependencies
      this.packageData.dependencies = {
        ...this.packageData.dependencies,
        "styled-components": stylingDeps["styled-components"],
      };

      // babel plugin goes to devDependencies for Vite, dependencies for Next.js
      if (this.framework === "vite") {
        this.packageData.devDependencies = {
          ...this.packageData.devDependencies,
          "babel-plugin-styled-components":
            stylingDeps["babel-plugin-styled-components"],
        };
      } else {
        this.packageData.dependencies = {
          ...this.packageData.dependencies,
          "babel-plugin-styled-components":
            stylingDeps["babel-plugin-styled-components"],
        };
      }
    } else {
      // Other styling options go to dependencies
      this.packageData.dependencies = {
        ...this.packageData.dependencies,
        ...stylingDeps,
      };
    }

    return this;
  }

  /**
   * Add routing dependencies if enabled
   */
  addRoutingDependencies(userChoices) {
    if (!userChoices.routing || userChoices.routing === "none") return this;

    const routingDeps = this.dependencyResolver.getRoutingDependencies(
      userChoices.routing
    );
    this.packageData.dependencies = {
      ...this.packageData.dependencies,
      ...routingDeps,
    };

    return this;
  }

  /**
   * Add state management dependencies if enabled
   */
  addStateManagementDependencies(userChoices) {
    if (!userChoices.stateManagement || userChoices.stateManagement === "none")
      return this;

    const stateDeps = this.dependencyResolver.getStateManagementDependencies(
      userChoices.stateManagement
    );
    this.packageData.dependencies = {
      ...this.packageData.dependencies,
      ...stateDeps,
    };

    return this;
  }

  /**
   * Add API dependencies if enabled
   */
  addApiDependencies(userChoices) {
    if (!userChoices.api || userChoices.api === "none") return this;

    const apiDeps = this.dependencyResolver.getApiDependencies(userChoices.api);
    this.packageData.dependencies = {
      ...this.packageData.dependencies,
      ...apiDeps,
    };

    return this;
  }

  /**
   * Add testing dependencies if enabled
   */
  addTestingDependencies(userChoices) {
    if (!userChoices.testing || userChoices.testing === "none") return this;

    const testingDeps = this.dependencyResolver.getTestingDependencies(
      userChoices.testing
    );
    this.packageData.devDependencies = {
      ...this.packageData.devDependencies,
      ...testingDeps,
    };

    return this;
  }

  /**
   * Add deployment CLI dependencies if enabled
   */
  addDeploymentDependencies(userChoices) {
    if (!userChoices.deployment || userChoices.deployment === "none")
      return this;

    const deploymentDeps = this.dependencyResolver.getDeploymentDependencies(
      userChoices.deployment
    );
    this.packageData.devDependencies = {
      ...this.packageData.devDependencies,
      ...deploymentDeps,
    };

    return this;
  }

  /**
   * Build the complete package.json
   */
  build() {
    return {
      ...this.packageData,
    };
  }

  /**
   * Build and write package.json to file
   */
  buildAndWrite(projectPath) {
    const packageJson = this.build();
    fs.writeFileSync(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
    return packageJson;
  }

  /**
   * Get framework-specific defaults
   */
  getFrameworkDefaults() {
    switch (this.framework) {
      case "vite":
        return {
          version: "0.0.0",
          private: true,
          packageFields: {
            type: "module",
          },
        };
      case "nextjs":
        return {
          version: "0.1.0",
          private: true,
          packageFields: {},
        };
      default:
        return {
          version: "1.0.0",
          private: true,
          packageFields: {},
        };
    }
  }

  /**
   * Get testing scripts based on testing framework
   */
  getTestingScripts(testingFramework) {
    if (!testingFramework || testingFramework === "none") {
      return {};
    }

    switch (testingFramework) {
      case "vitest":
        return {
          test: "vitest",
          "test:ui": "vitest --ui",
          "test:run": "vitest run",
          "test:coverage": "vitest run --coverage",
        };
      case "jest":
        return {
          test: "jest",
          "test:watch": "jest --watch",
          "test:coverage": "jest --coverage",
        };
      default:
        return {};
    }
  }

  /**
   * Get deployment scripts based on deployment platform
   */
  getDeploymentScripts(deploymentPlatform, packageManager = "npm") {
    if (!deploymentPlatform || deploymentPlatform === "none") {
      return {};
    }

    // Get the correct build command for the package manager
    const buildCommand = this.getBuildCommand(packageManager);

    // Get the correct build output directory for the framework
    const buildDir = this.getBuildDirectory();

    switch (deploymentPlatform) {
      case "vercel":
        return {
          "vercel:preview": `${buildCommand} && vercel`,
          "vercel:deploy": `${buildCommand} && vercel --prod`,
        };
      case "netlify":
        return {
          "netlify:preview": `${buildCommand} && netlify deploy --dir=${buildDir}`,
          "netlify:deploy": `${buildCommand} && netlify deploy --dir=${buildDir} --prod`,
        };
      default:
        return {};
    }
  }

  /**
   * Get the correct build command for different package managers
   */
  getBuildCommand(packageManager) {
    switch (packageManager) {
      case "yarn":
        return "yarn build";
      case "npm":
      default:
        return "npm run build";
    }
  }

  /**
   * Get the correct build output directory for the framework
   */
  getBuildDirectory() {
    switch (this.framework) {
      case "vite":
        return "dist";
      case "nextjs":
        return "out"; // For static export (Netlify)
      default:
        return "dist";
    }
  }

  /**
   * Get framework-specific scripts
   */
  getFrameworkScripts() {
    switch (this.framework) {
      case "vite":
        return {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        };
      case "nextjs":
        return {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint",
        };
      default:
        return {
          start: "node index.js",
          test: 'echo "Error: no test specified" && exit 1',
        };
    }
  }
}
