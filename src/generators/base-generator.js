import { UI_UTILS } from "../utils/index.js";
import { createDirectoryStructure } from "../lib/file-generation/index.js";
import { setupLinting } from "../lib/linting.js";
import { setupTypeScript } from "../lib/typescript.js";
import { setupRedux } from "../features/redux/index.js";
import { setupZustand } from "../features/zustand/index.js";
import { createErrorHandler, ERROR_TYPES } from "../errors/index.js";

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
        // Step 1: Log start
        this.logGenerationStart(userChoices);

        // Step 2: Create base structure
        await this.createBaseStructure(projectPath);

        // Step 3: Create package.json
        await this.createPackageConfiguration(
          projectPath,
          projectName,
          userChoices
        );

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
      }
    );
  }

  /**
   * Step 1: Log generation start
   */
  logGenerationStart(userChoices) {
    UI_UTILS.log(`Creating a ${this.frameworkName} React project...`);
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
    throw new Error(
      "createPackageConfiguration must be implemented by subclass"
    );
  }

  /**
   * Step 4: Create framework-specific configuration files - Must be implemented by subclasses
   */
  async createFrameworkConfiguration(projectPath, userChoices) {
    throw new Error(
      "createFrameworkConfiguration must be implemented by subclass"
    );
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
   * Step 7: Create framework-specific files - Must be implemented by subclasses
   */
  async createFrameworkSpecificFiles(projectPath, userChoices) {
    throw new Error(
      "createFrameworkSpecificFiles must be implemented by subclass"
    );
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
