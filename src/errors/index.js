// Export error handling classes
export { ErrorHandler } from "./error-handler.js";
export { CleanupManager } from "./cleanup-manager.js";
export { UserErrorReporter } from "./user-error-reporter.js";

// Error types constants
export const ERROR_TYPES = {
  VALIDATION: "validation",
  NETWORK: "network",
  PERMISSION: "permission",
  DEPENDENCY: "dependency",
  FILESYSTEM: "filesystem",
  PROCESS: "process",
  USER_CANCELLED: "user_cancelled",
  GENERAL: "general",
};

// Error severity levels
export const ERROR_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical",
};

// Import classes for factory functions
import { CleanupManager } from "./cleanup-manager.js";
import { ErrorHandler } from "./error-handler.js";
import { UserErrorReporter } from "./user-error-reporter.js";

// Factory function to create error handler
export function createErrorHandler() {
  return new ErrorHandler();
}

// Factory function to create cleanup manager
export function createCleanupManager() {
  return new CleanupManager();
}

// Factory function to create user error reporter
export function createUserErrorReporter() {
  return new UserErrorReporter();
}

// Utility functions for common error patterns
export function isNetworkError(error) {
  const errorMsg = (error.message || String(error)).toLowerCase();
  const networkKeywords = [
    "enotfound",
    "etimedout",
    "econnreset",
    "econnrefused",
    "network",
    "timeout",
    "fetch",
    "request failed",
  ];

  return networkKeywords.some((keyword) => errorMsg.includes(keyword));
}

export function isPermissionError(error) {
  const errorMsg = (error.message || String(error)).toLowerCase();
  return (
    errorMsg.includes("eacces") ||
    errorMsg.includes("permission") ||
    errorMsg.includes("eperm")
  );
}

export function isDependencyError(error) {
  const errorMsg = (error.message || String(error)).toLowerCase();
  return (
    errorMsg.includes("npm") ||
    errorMsg.includes("yarn") ||
    errorMsg.includes("package") ||
    errorMsg.includes("dependency") ||
    errorMsg.includes("eresolve")
  );
}

// Helper to classify errors automatically
export function classifyError(error) {
  if (isNetworkError(error)) return ERROR_TYPES.NETWORK;
  if (isPermissionError(error)) return ERROR_TYPES.PERMISSION;
  if (isDependencyError(error)) return ERROR_TYPES.DEPENDENCY;

  // Check error message for other patterns
  const errorMsg = (error.message || String(error)).toLowerCase();

  if (errorMsg.includes("validation") || errorMsg.includes("invalid")) {
    return ERROR_TYPES.VALIDATION;
  }

  if (
    errorMsg.includes("file") ||
    errorMsg.includes("directory") ||
    errorMsg.includes("enoent")
  ) {
    return ERROR_TYPES.FILESYSTEM;
  }

  if (
    errorMsg.includes("process") ||
    errorMsg.includes("spawn") ||
    errorMsg.includes("exit")
  ) {
    return ERROR_TYPES.PROCESS;
  }

  return ERROR_TYPES.GENERAL;
}
