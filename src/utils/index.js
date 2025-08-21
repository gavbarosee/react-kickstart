/**
 * Consolidated utilities index - single entry point for all utility functions
 *
 * This provides a clean, organized way to import utilities throughout the application
 * using clearly named utility objects that immediately show their category.

 */

// Import all utilities from their respective modules
import * as filesystem from "./core/filesystem.js";
import * as validation from "./core/validation.js";
import * as projectAnalysis from "./core/project-analysis.js";
import * as dataFormatting from "./core/data-formatting.js";
import * as fileExtensions from "./core/file-extensions.js";
import * as directoryManagement from "./core/directory-management.js";
import * as packageManagers from "./process/package-managers.js";
import * as uiLogging from "./ui/logging.js";
import * as git from "./process/git.js";
import * as editor from "./process/editor.js";
import * as startProject from "./process/start-project.js";
import * as summary from "./ui/summary.js";
import * as completion from "./ui/completion.js";

// ============================================================================
// CORE_UTILS - Fundamental functions used throughout the application
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

  // File extension utilities
  ...fileExtensions,

  // Directory management utilities
  ...directoryManagement,

  // Convenience aliases
  validateProjectName: validation.validateProjectNameInput,
  validateProjectDirectory: validation.validateProjectDirectory,
  validateUserChoices: validation.validateUserChoices,
  validateChoiceCombinations: validation.validateChoiceCombinations,
  isDirectoryCreatedByTool: filesystem.isProjectCreatedByTool,
  fileGenerationInfo: filesystem.getProjectFileInfo,
  formatItem: dataFormatting.formatSummaryItem,
};

// ============================================================================
// PROCESS_UTILS - External command execution and process management
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
// UI_UTILS - User interface and display functions
// ============================================================================
export const UI_UTILS = {
  // Logging and display utilities
  ...uiLogging,

  // Summary and completion utilities
  ...summary,
  ...completion,
};
