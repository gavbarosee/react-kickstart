import {
  getCoreDependencies,
  getTypescriptDependencies,
  getTailwindDependencies,
  getStyledComponentsDependencies,
  getLintingDependencies,
  getRoutingDependencies,
  getReduxDependencies,
  getZustandDependencies,
  getAxiosDependencies,
  getReactQueryDependencies,
  getAxiosReactQueryDependencies,
  getFetchReactQueryDependencies,
  frameworks,
  styling,
} from "./dependencies.js";

/**
 * Resolves and manages dependencies for different frameworks and features
 */
export class DependencyResolver {
  constructor(framework) {
    this.framework = framework;
  }

  /**
   * Get core React dependencies
   */
  getCoreDependencies() {
    return getCoreDependencies();
  }

  /**
   * Get framework-specific dependencies
   */
  getFrameworkDependencies() {
    switch (this.framework) {
      case "vite":
        return {
          "@vitejs/plugin-react": frameworks.vite.pluginReact,
          vite: frameworks.vite.vite,
        };
      case "nextjs":
        return {
          next: frameworks.nextjs.next,
        };
      default:
        return {};
    }
  }

  /**
   * Get TypeScript dependencies with framework-specific handling
   */
  getTypeScriptDependencies() {
    // Next.js includes @types/node as a regular dependency
    if (this.framework === "nextjs") {
      return getTypescriptDependencies(false); // false = include as regular dependencies
    } else {
      return getTypescriptDependencies(true); // true = include as dev dependencies
    }
  }

  /**
   * Get linting dependencies
   */
  getLintingDependencies(includeTypeScript = false) {
    return getLintingDependencies(includeTypeScript);
  }

  /**
   * Get styling dependencies based on choice
   */
  getStylingDependencies(stylingChoice) {
    switch (stylingChoice) {
      case "tailwind":
        // Framework affects whether these are dev or regular dependencies
        const isDevDependency = this.framework !== "nextjs";
        return getTailwindDependencies(isDevDependency);

      case "styled-components":
        const deps = getStyledComponentsDependencies();

        // Next.js needs the babel plugin for styled-components
        if (this.framework === "nextjs") {
          deps["babel-plugin-styled-components"] =
            styling.babelPluginStyledComponents;
        }

        return deps;

      case "css":
      default:
        return {};
    }
  }

  /**
   * Get routing dependencies
   */
  getRoutingDependencies(routingChoice) {
    return getRoutingDependencies(routingChoice);
  }

  /**
   * Get state management dependencies
   */
  getStateManagementDependencies(stateChoice) {
    switch (stateChoice) {
      case "redux":
        return getReduxDependencies();
      case "zustand":
        return getZustandDependencies();
      default:
        return {};
    }
  }

  /**
   * Get API dependencies based on user choice
   */
  getApiDependencies(apiChoice) {
    switch (apiChoice) {
      case "axios-react-query":
        return getAxiosReactQueryDependencies();
      case "axios-only":
        return getAxiosDependencies();
      case "fetch-react-query":
        return getFetchReactQueryDependencies();
      case "fetch-only":
        return {}; // No dependencies needed for native fetch
      default:
        return {};
    }
  }

  /**
   * Get all dependencies for a complete feature set
   */
  getAllDependencies(userChoices) {
    const allDeps = {
      dependencies: {},
      devDependencies: {},
    };

    // Core dependencies
    const coreDeps = this.getCoreDependencies();
    allDeps.dependencies = { ...allDeps.dependencies, ...coreDeps };

    // Framework dependencies
    const frameworkDeps = this.getFrameworkDependencies();
    if (this.framework === "vite") {
      allDeps.devDependencies = {
        ...allDeps.devDependencies,
        ...frameworkDeps,
      };
    } else {
      allDeps.dependencies = { ...allDeps.dependencies, ...frameworkDeps };
    }

    // TypeScript
    if (userChoices.typescript) {
      const tsDeps = this.getTypeScriptDependencies();
      if (this.framework === "nextjs") {
        allDeps.dependencies = { ...allDeps.dependencies, ...tsDeps };
      } else {
        allDeps.devDependencies = { ...allDeps.devDependencies, ...tsDeps };
      }
    }

    // Linting
    if (userChoices.linting && this.framework === "vite") {
      const lintingDeps = this.getLintingDependencies(userChoices.typescript);
      allDeps.devDependencies = { ...allDeps.devDependencies, ...lintingDeps };
    }

    // Styling
    if (userChoices.styling && userChoices.styling !== "css") {
      const stylingDeps = this.getStylingDependencies(userChoices.styling);

      if (userChoices.styling === "tailwind" && this.framework === "nextjs") {
        allDeps.dependencies = { ...allDeps.dependencies, ...stylingDeps };
      } else if (userChoices.styling === "tailwind") {
        allDeps.devDependencies = {
          ...allDeps.devDependencies,
          ...stylingDeps,
        };
      } else {
        allDeps.dependencies = { ...allDeps.dependencies, ...stylingDeps };
      }
    }

    // Routing
    if (userChoices.routing && userChoices.routing !== "none") {
      const routingDeps = this.getRoutingDependencies(userChoices.routing);
      allDeps.dependencies = { ...allDeps.dependencies, ...routingDeps };
    }

    // State management
    if (userChoices.stateManagement && userChoices.stateManagement !== "none") {
      const stateDeps = this.getStateManagementDependencies(
        userChoices.stateManagement
      );
      allDeps.dependencies = { ...allDeps.dependencies, ...stateDeps };
    }

    // API dependencies
    if (userChoices.api && userChoices.api !== "none") {
      const apiDeps = this.getApiDependencies(userChoices.api);
      allDeps.dependencies = { ...allDeps.dependencies, ...apiDeps };
    }

    return allDeps;
  }

  /**
   * Validate that all required dependencies are available
   */
  validateDependencies(userChoices) {
    const issues = [];

    // Check for conflicts or missing dependencies
    if (
      userChoices.styling === "tailwind" &&
      userChoices.framework === "vite" &&
      !userChoices.postcss
    ) {
      // This is fine, just noting the pattern
    }

    if (userChoices.typescript && !userChoices.linting) {
      issues.push(
        "TypeScript is enabled but linting is disabled. Consider enabling linting for better TypeScript support."
      );
    }

    return issues;
  }
}
