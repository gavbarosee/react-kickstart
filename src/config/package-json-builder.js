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
  setScripts(customScripts = {}) {
    const defaultScripts = this.getFrameworkScripts();
    this.packageData.scripts = {
      ...defaultScripts,
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
    } else {
      // styled-components always go to dependencies
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
