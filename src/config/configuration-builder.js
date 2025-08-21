import fs from "fs-extra";
import path from "path";
import { PackageJsonBuilder } from "./package-json-builder.js";
import { createFileTemplateEngine } from "../templates/index.js";
import { CORE_UTILS } from "../utils/index.js";

/**
 * Main configuration builder that orchestrates all configuration file generation
 */
export class ConfigurationBuilder {
  constructor(framework) {
    this.framework = framework;
    this.packageJsonBuilder = new PackageJsonBuilder(framework);
    this.fileTemplateEngine = createFileTemplateEngine();
  }

  /**
   * Generate all configuration files for a project
   */
  async generateAllConfigs(projectPath, projectName, userChoices) {
    const configs = {};

    // Generate package.json
    configs.packageJson = this.generatePackageJson(
      projectPath,
      projectName,
      userChoices
    );

    // Generate framework-specific config files
    configs.frameworkConfig = await this.generateFrameworkConfig(
      projectPath,
      userChoices
    );

    // Generate additional config files based on features
    configs.additionalConfigs = await this.generateAdditionalConfigs(
      projectPath,
      userChoices
    );

    return configs;
  }

  /**
   * Generate package.json using the builder pattern
   */
  generatePackageJson(projectPath, projectName, userChoices) {
    return this.packageJsonBuilder
      .setBasicInfo(projectName)
      .setScripts({}, userChoices)
      .addCoreDependencies()
      .addFrameworkDependencies()
      .addTypeScriptDependencies(userChoices)
      .addLintingDependencies(userChoices)
      .addStylingDependencies(userChoices)
      .addRoutingDependencies(userChoices)
      .addStateManagementDependencies(userChoices)
      .addApiDependencies(userChoices)
      .addTestingDependencies(userChoices)
      .buildAndWrite(projectPath);
  }

  /**
   * Generate framework-specific configuration files
   */
  async generateFrameworkConfig(projectPath, userChoices) {
    switch (this.framework) {
      case "vite":
        return this.generateViteConfig(projectPath, userChoices);
      case "nextjs":
        return this.generateNextjsConfig(projectPath, userChoices);
      default:
        return null;
    }
  }

  /**
   * Generate Vite configuration
   *
   * Vite configuration characteristics:
   * - Fast development server with HMR (Hot Module Replacement)
   * - esbuild-based bundling for speed
   * - Plugin-based architecture for extensibility
   * - ES modules native support
   */
  generateViteConfig(projectPath, userChoices) {
    const configExt = CORE_UTILS.getConfigExtension(userChoices);

    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite Configuration
// - plugins: [react()] enables JSX transformation and Fast Refresh
// - server.open: Automatically opens browser during development
// - Uses esbuild for fast TypeScript/JSX compilation
export default defineConfig({
  plugins: [react()], // Enable React JSX transformation and Fast Refresh
  server: {
    open: true, // Auto-open browser on dev start for better DX
  }
});
`;

    const configPath = path.join(projectPath, `vite.config.${configExt}`);
    fs.writeFileSync(configPath, viteConfig);

    return {
      file: `vite.config.${configExt}`,
      content: viteConfig,
    };
  }

  /**
   * Generate Next.js configuration
   *
   * Next.js configuration characteristics:
   * - Full-stack React framework with SSR/SSG capabilities
   * - Built-in routing, API routes, and optimization
   * - Compiler optimizations for production
   * - Framework-specific feature toggles
   */
  generateNextjsConfig(projectPath, userChoices) {
    let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React Strict Mode for better development warnings
`;

    // Add styled-components config if needed
    // Next.js compiler can optimize styled-components at build time
    if (userChoices.styling === "styled-components") {
      nextConfig += `  compiler: {
    styledComponents: true, // Enable styled-components SWC transform for better performance
  },
`;
    }

    nextConfig += `};

module.exports = nextConfig;
`;

    const configPath = path.join(projectPath, "next.config.js");
    fs.writeFileSync(configPath, nextConfig);

    return {
      file: "next.config.js",
      content: nextConfig,
    };
  }

  /**
   * Generate additional configuration files based on features
   */
  async generateAdditionalConfigs(projectPath, userChoices) {
    const configs = {};

    // TypeScript config
    if (userChoices.typescript) {
      configs.typescript = this.generateTypeScriptConfig(
        projectPath,
        userChoices
      );
    }

    // JavaScript config for Next.js when not using TypeScript
    if (this.framework === "nextjs" && !userChoices.typescript) {
      configs.jsconfig = this.generateJsConfig(projectPath);
    }

    // Tailwind config
    if (userChoices.styling === "tailwind") {
      configs.tailwind = this.generateTailwindConfig(projectPath);
      configs.postcss = this.generatePostCssConfig(projectPath);
    }

    // Testing config
    if (userChoices.testing && userChoices.testing !== "none") {
      configs.testing = this.generateTestingConfig(projectPath, userChoices);
    }

    return configs;
  }

  /**
   * Generate TypeScript configuration
   *
   * Framework-specific configurations are necessary because:
   * - Next.js has built-in TypeScript compilation and requires specific settings
   * - Vite uses esbuild for TypeScript and has different optimization requirements
   * - Each framework has different JSX handling and module resolution needs
   */
  generateTypeScriptConfig(projectPath, userChoices) {
    let tsConfig;

    if (this.framework === "nextjs") {
      // Next.js TypeScript Configuration
      // - Uses "jsx": "preserve" because Next.js handles JSX transformation
      // - Uses "moduleResolution": "node" for compatibility with Next.js bundler
      // - Includes Next.js plugin for enhanced type checking
      // - Uses "noEmit": true because Next.js handles compilation
      // - Targets ES5 for broader browser compatibility in production
      tsConfig = {
        compilerOptions: {
          target: "es5", // Next.js handles modern browser targeting in production
          lib: ["dom", "dom.iterable", "es6"],
          allowJs: true, // Allow importing .js files in TypeScript project
          skipLibCheck: true, // Skip type checking of declaration files for faster builds
          strict: true, // Enable all strict type checking options
          forceConsistentCasingInFileNames: true, // Prevent case-insensitive imports
          noEmit: true, // Next.js handles compilation, TypeScript only for type checking
          esModuleInterop: true, // Enable ES module interoperability
          module: "esnext", // Use latest module syntax
          moduleResolution: "node", // Use Node.js module resolution for Next.js compatibility
          resolveJsonModule: true, // Allow importing JSON files
          isolatedModules: true, // Each file must be importable on its own
          jsx: "preserve", // Next.js handles JSX transformation internally
          incremental: true, // Enable incremental compilation for faster rebuilds
          plugins: [
            {
              name: "next", // Next.js TypeScript plugin for enhanced type checking
            },
          ],
          paths: {
            "@/*": ["./*"], // Enable absolute imports with @ alias
          },
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      };
    } else {
      // Vite TypeScript Configuration
      // - Uses "jsx": "react-jsx" for automatic JSX runtime (no need to import React)
      // - Uses "moduleResolution": "bundler" optimized for Vite's esbuild bundler
      // - Targets ES2020 for modern browsers (Vite handles legacy browser support via plugins)
      // - Enables stricter checks for better development experience
      // - Uses "allowImportingTsExtensions" for explicit .ts/.tsx imports
      tsConfig = {
        compilerOptions: {
          target: "ES2020", // Modern target since Vite handles transpilation for older browsers
          useDefineForClassFields: true, // Use standard class field behavior
          lib: ["ES2020", "DOM", "DOM.Iterable"], // Include modern JavaScript and DOM APIs
          module: "ESNext", // Use latest module syntax
          skipLibCheck: true, // Skip type checking of declaration files for faster builds
          moduleResolution: "bundler", // Optimized for Vite's esbuild bundler
          allowImportingTsExtensions: true, // Allow explicit .ts/.tsx imports
          resolveJsonModule: true, // Allow importing JSON files
          isolatedModules: true, // Each file must be importable on its own
          noEmit: true, // Vite handles compilation, TypeScript only for type checking
          jsx: "react-jsx", // Use automatic JSX runtime (no React import needed)
          strict: true, // Enable all strict type checking options
          noUnusedLocals: true, // Error on unused local variables
          noUnusedParameters: true, // Error on unused function parameters
          noFallthroughCasesInSwitch: true, // Error on fallthrough switch cases
        },
        include: ["src"],
        references: [{ path: "./tsconfig.node.json" }],
      };
    }

    const configPath = path.join(projectPath, "tsconfig.json");
    fs.writeFileSync(configPath, JSON.stringify(tsConfig, null, 2));

    return {
      file: "tsconfig.json",
      content: tsConfig,
    };
  }

  /**
   * Generate jsconfig.json for Next.js JavaScript projects
   */
  generateJsConfig(projectPath) {
    const jsConfig = {
      compilerOptions: {
        paths: {
          "@/*": ["./*"],
        },
      },
    };

    const configPath = path.join(projectPath, "jsconfig.json");
    fs.writeFileSync(configPath, JSON.stringify(jsConfig, null, 2));

    return {
      file: "jsconfig.json",
      content: jsConfig,
    };
  }

  /**
   * Generate Tailwind CSS configuration
   *
   * Uses CommonJS module.exports format for compatibility:
   * - Next.js: Native support and ecosystem standard
   * - Vite: Supports CommonJS config files (both formats work)
   * - Tooling: Most Tailwind tooling expects CommonJS format
   * - Content paths: Framework-specific file structure patterns
   */
  generateTailwindConfig(projectPath) {
    const contentPaths = this.getTailwindContentPaths();

    // Use CommonJS format for universal compatibility
    // Both Next.js and Vite support module.exports for config files
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ${contentPaths.map((path) => `"${path}"`).join(",\n    ")}
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

    const configPath = path.join(projectPath, "tailwind.config.js");
    fs.writeFileSync(configPath, tailwindConfig);

    return {
      file: "tailwind.config.js",
      content: tailwindConfig,
    };
  }

  /**
   * Generate PostCSS configuration for Tailwind
   *
   * Uses CommonJS module.exports format for compatibility:
   * - Next.js: Required by Next.js PostCSS integration
   * - Vite: Supports CommonJS config files (both formats work)
   * - PostCSS: Standard format expected by PostCSS tooling
   * - Plugin loading: Consistent module resolution across frameworks
   */
  generatePostCssConfig(projectPath) {
    // Use CommonJS format for universal compatibility
    // Next.js requires this format, and Vite supports it
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

    const configPath = path.join(projectPath, "postcss.config.js");
    fs.writeFileSync(configPath, postcssConfig);

    return {
      file: "postcss.config.js",
      content: postcssConfig,
    };
  }

  /**
   * Get Tailwind content paths based on framework
   *
   * Framework-specific content paths are needed because:
   * - File structure: Each framework organizes files differently
   * - Build integration: Different frameworks scan different directories
   * - Performance: Tailwind needs to know exactly where to look for class usage
   */
  getTailwindContentPaths() {
    switch (this.framework) {
      case "vite":
        // Vite Content Paths
        // - "./index.html": Vite projects have a root HTML file that may contain classes
        // - "./src/**/*": Standard single-page application structure
        // - Includes all JS/TS/JSX/TSX files for comprehensive class detection
        return ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"];
      case "nextjs":
        // Next.js Content Paths
        // - "./pages/**/*": Pages router structure (traditional Next.js)
        // - "./components/**/*": Common component directory structure
        // - "./app/**/*": App router structure (Next.js 13+)
        // - Includes .mdx files for Next.js MDX integration
        return [
          "./pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./components/**/*.{js,ts,jsx,tsx,mdx}",
          "./app/**/*.{js,ts,jsx,tsx,mdx}",
        ];
      default:
        // Fallback for other frameworks
        return ["./src/**/*.{js,ts,jsx,tsx}"];
    }
  }

  /**
   * Generate testing configuration files
   *
   * Framework-specific testing differences:
   * - Vitest: Optimized for Vite, uses esbuild, faster execution
   * - Jest: Better Next.js integration, more mature ecosystem
   * - Configuration: Different setup files and module resolution
   */
  generateTestingConfig(projectPath, userChoices) {
    const configs = {};

    if (userChoices.testing === "vitest") {
      configs.vitest = this.generateVitestConfig(projectPath, userChoices);
      configs.testSetup = this.generateTestSetupFile(projectPath, userChoices);
    } else if (userChoices.testing === "jest") {
      configs.jest = this.generateJestConfig(projectPath, userChoices);
      configs.testSetup = this.generateTestSetupFile(projectPath, userChoices);
    }

    return configs;
  }

  /**
   * Generate Vitest configuration
   *
   * Vitest is preferred for Vite projects because:
   * - Native ESM support and esbuild integration
   * - Shares Vite's configuration and plugins
   * - Faster test execution due to optimized bundling
   * - Better development experience with Vite
   */
  generateVitestConfig(projectPath, userChoices) {
    const configExt = CORE_UTILS.getConfigExtension(userChoices);
    const setupFile = `./src/test/setup.${
      userChoices.typescript ? "ts" : "js"
    }`;

    const vitestConfig = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['${setupFile}'],
    globals: true,
  },
});
`;

    const configPath = path.join(projectPath, `vitest.config.${configExt}`);
    fs.writeFileSync(configPath, vitestConfig);

    return {
      file: `vitest.config.${configExt}`,
      content: vitestConfig,
    };
  }

  /**
   * Generate Jest configuration
   *
   * Jest configuration differs by framework because:
   * - Next.js: Has built-in Jest integration with optimized settings
   * - Vite: Requires manual Babel configuration for JSX/TypeScript
   * - Module resolution: Different path mapping and import strategies
   */
  generateJestConfig(projectPath, userChoices) {
    const setupFile = `<rootDir>/src/test/setup.${
      userChoices.typescript ? "ts" : "js"
    }`;
    const isNextJs = this.framework === "nextjs";

    let jestConfig;

    if (isNextJs) {
      // Next.js Optimized Jest Configuration
      // - Uses next/jest for automatic configuration
      // - Handles Next.js-specific features (Image, Link, etc.)
      // - Optimized for server components and app router
      // - Automatic TypeScript and CSS module support
      jestConfig = `const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['${setupFile}'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
};

module.exports = createJestConfig(customJestConfig);
`;
    } else {
      // Vite Jest Configuration
      // - Requires manual Babel configuration for JSX/TypeScript transformation
      // - Uses explicit module resolution mapping for @ alias
      // - Requires babel-jest for transforming modern JavaScript/TypeScript
      // - Manual test pattern matching for src/ directory structure
      const moduleFileExtensions = userChoices.typescript
        ? ["js", "jsx", "ts", "tsx", "json"]
        : ["js", "jsx", "json"];

      jestConfig = `module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['${setupFile}'],
  moduleFileExtensions: ${JSON.stringify(moduleFileExtensions)},
  transform: {
    '^.+\\\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
`;
    }

    const configPath = path.join(projectPath, "jest.config.js");
    fs.writeFileSync(configPath, jestConfig);

    return {
      file: "jest.config.js",
      content: jestConfig,
    };
  }

  /**
   * Generate test setup file
   */
  generateTestSetupFile(projectPath, userChoices) {
    const isTypeScript = userChoices.typescript;
    const fileExt = isTypeScript ? "ts" : "js";

    const setupContent = `import '@testing-library/jest-dom';

// Global test setup
// Add any global test configuration here
`;

    // Ensure test directory exists
    const testDir = path.join(projectPath, "src", "test");
    fs.ensureDirSync(testDir);

    const setupPath = path.join(testDir, `setup.${fileExt}`);
    fs.writeFileSync(setupPath, setupContent);

    return {
      file: `src/test/setup.${fileExt}`,
      content: setupContent,
    };
  }

  /**
   * Validate configuration compatibility
   * Ensures that generated configs work with both frameworks
   */
  validateConfigurationCompatibility(userChoices) {
    const issues = [];

    // Validate Tailwind configuration
    if (userChoices.styling === "tailwind") {
      const contentPaths = this.getTailwindContentPaths();
      if (contentPaths.length === 0) {
        issues.push(
          "Tailwind content paths are empty - no classes will be detected"
        );
      }

      // Ensure content paths are framework-appropriate
      if (
        this.framework === "nextjs" &&
        !contentPaths.some(
          (path) => path.includes("./pages") || path.includes("./app")
        )
      ) {
        issues.push(
          "Next.js Tailwind config missing pages/app directory paths"
        );
      }

      if (
        this.framework === "vite" &&
        !contentPaths.some((path) => path.includes("./src"))
      ) {
        issues.push("Vite Tailwind config missing src directory path");
      }
    }

    // Validate PostCSS configuration when using Tailwind
    if (userChoices.styling === "tailwind") {
      // Both frameworks now use CommonJS format, which is compatible
      // No validation issues expected with the standardized format
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get a summary of all configurations that will be generated
   */
  getConfigurationSummary(userChoices) {
    const configs = ["package.json"];

    // Framework config
    if (this.framework === "vite") {
      configs.push(`vite.config.${CORE_UTILS.getConfigExtension(userChoices)}`);
    } else if (this.framework === "nextjs") {
      configs.push("next.config.js");
    }

    // TypeScript
    if (userChoices.typescript) {
      configs.push("tsconfig.json");
    } else if (this.framework === "nextjs") {
      configs.push("jsconfig.json");
    }

    // Tailwind (standardized CommonJS format for both frameworks)
    if (userChoices.styling === "tailwind") {
      configs.push("tailwind.config.js", "postcss.config.js");
    }

    // Testing
    if (userChoices.testing && userChoices.testing !== "none") {
      if (userChoices.testing === "vitest") {
        configs.push(
          `vitest.config.${CORE_UTILS.getConfigExtension(userChoices)}`
        );
      } else if (userChoices.testing === "jest") {
        configs.push("jest.config.js");
      }
      configs.push(`src/test/setup.${userChoices.typescript ? "ts" : "js"}`);
    }

    return configs;
  }
}
