/**
 * Consolidated utilities index - single entry point for all utility functions
 *
 * This provides a clean, organized way to import utilities throughout the application
 * using clearly named utility objects that immediately show their category.
 *
 * Usage examples:
 * import { CORE_UTILS, UI_UTILS, PROCESS_UTILS } from "../utils/index.js";
 *
 * const isValid = CORE_UTILS.validateProjectNameInput(name);
 * UI_UTILS.log("Starting project setup...");
 * const managers = await PROCESS_UTILS.detectPackageManagers();
 *
 * Or destructure specific functions:
 * import { CORE_UTILS: { validateProjectNameInput }, UI_UTILS: { log } } from "../utils/index.js";
 */

// Import all utilities from their respective modules
import * as filesystem from "./core/filesystem.js";
import * as validation from "./core/validation.js";
import * as projectAnalysis from "./core/project-analysis.js";
import * as dataFormatting from "./core/data-formatting.js";
import * as packageManagers from "./process/package-managers.js";
import * as uiLogging from "./ui/logging.js";
import * as git from "./git.js";
import * as editor from "./editor.js";
import * as startProject from "./start-project.js";
import * as summary from "./summary.js";
import * as completion from "./completion.js";

// ============================================================================
// 🔧 CORE_UTILS - Fundamental functions used throughout the application
// ============================================================================
export const CORE_UTILS = {
  // Filesystem utilities
  ...filesystem,

  // Validation utilities
  ...validation,

  // Project analysis utilities
  ...projectAnalysis,

  // Data formatting utilities
  ...dataFormatting,

  // Convenience aliases
  validateProjectName: validation.validateProjectNameInput,
  isDirectoryCreatedByTool: filesystem.isProjectCreatedByTool,
  fileGenerationInfo: filesystem.getProjectFileInfo,
  formatItem: dataFormatting.formatSummaryItem,
};

// ============================================================================
// ⚙️ PROCESS_UTILS - External command execution and process management
// ============================================================================
export const PROCESS_UTILS = {
  // Package manager utilities
  ...packageManagers,

  // Git utilities
  ...git,

  // Editor utilities
  ...editor,

  // Development server utilities
  ...startProject,

  // Convenience aliases
  installDependencies: packageManagers.installDependenciesWithRetry,
};

// ============================================================================
// 🎨 UI_UTILS - User interface and display functions
// ============================================================================
export const UI_UTILS = {
  // Logging and display utilities
  ...uiLogging,

  // Summary and completion utilities
  ...summary,
  ...completion,
};

// ============================================================================
// 🔄 BACKWARD COMPATIBILITY - Individual exports for existing code
// ============================================================================
// Export everything individually for backward compatibility with existing imports
export * from "./core/filesystem.js";
export * from "./core/validation.js";
export * from "./core/project-analysis.js";
export * from "./core/data-formatting.js";
export * from "./process/package-managers.js";
export * from "./ui/logging.js";
export * from "./git.js";
export * from "./editor.js";
export * from "./start-project.js";
export * from "./summary.js";
export * from "./completion.js";

// Convenience aliases
export { validateProjectNameInput as validateProjectName } from "./core/validation.js";
export { isProjectCreatedByTool as isDirectoryCreatedByTool } from "./core/filesystem.js";
export { getProjectFileInfo as fileGenerationInfo } from "./core/filesystem.js";
export { formatSummaryItem as formatItem } from "./core/data-formatting.js";
export { installDependenciesWithRetry as installDependencies } from "./process/package-managers.js";
