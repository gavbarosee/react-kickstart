import chalk from "chalk";
import { CleanupManager } from "./CleanupManager.js";
import { UserErrorReporter } from "./UserErrorReporter.js";

/**
 * Centralized error handling system with consistent patterns
 */
export class ErrorHandler {
  constructor() {
    this.cleanupManager = new CleanupManager();
    this.userReporter = new UserErrorReporter();
    this.errorHistory = [];
    this.context = {};
  }

  /**
   * Set context for error handling (project info, etc.)
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Handle different types of errors with appropriate strategies
   */
  async handle(error, options = {}) {
    const {
      type = "general",
      severity = "error",
      shouldCleanup = false,
      showRecovery = true,
      verbose = false,
    } = options;

    // Record error for analysis
    this.recordError(error, type, severity);

    try {
      switch (type) {
        case "validation":
          return this.handleValidationError(error, options);
        case "network":
          return this.handleNetworkError(error, options);
        case "permission":
          return this.handlePermissionError(error, options);
        case "dependency":
          return this.handleDependencyError(error, options);
        case "filesystem":
          return this.handleFilesystemError(error, options);
        case "process":
          return this.handleProcessError(error, options);
        case "user_cancelled":
          return this.handleUserCancellation(error, options);
        default:
          return this.handleGeneralError(error, options);
      }
    } catch (handlerError) {
      // Fallback if error handling itself fails
      this.userReporter.reportCriticalError(handlerError);
      process.exit(1);
    }
  }

  /**
   * Handle validation errors (bad input, invalid names, etc.)
   */
  handleValidationError(error, options) {
    this.userReporter.reportValidationError(error);

    if (options.showRecovery) {
      this.userReporter.showValidationRecovery();
    }

    return { shouldExit: true, exitCode: 1 };
  }

  /**
   * Handle network-related errors
   */
  async handleNetworkError(error, options) {
    this.userReporter.reportNetworkError(error);

    if (options.showRecovery) {
      const recovery = await this.userReporter.showNetworkRecovery();
      return { shouldExit: false, recovery };
    }

    return { shouldExit: true, exitCode: 1 };
  }

  /**
   * Handle permission errors
   */
  async handlePermissionError(error, options) {
    this.userReporter.reportPermissionError(error);

    if (options.showRecovery) {
      const recovery = await this.userReporter.showPermissionRecovery();
      return { shouldExit: false, recovery };
    }

    return { shouldExit: true, exitCode: 1 };
  }

  /**
   * Handle dependency installation errors
   */
  async handleDependencyError(error, options) {
    this.userReporter.reportDependencyError(error);

    if (options.showRecovery) {
      const recovery = await this.userReporter.showDependencyRecovery(
        this.context
      );
      return { shouldExit: false, recovery };
    }

    return { shouldExit: true, exitCode: 1 };
  }

  /**
   * Handle filesystem errors
   */
  async handleFilesystemError(error, options) {
    this.userReporter.reportFilesystemError(error);

    // Always cleanup on filesystem errors
    if (this.context.projectPath) {
      await this.cleanupManager.cleanup(this.context.projectPath, {
        reason: "filesystem_error",
        verbose: options.verbose,
      });
    }

    return { shouldExit: true, exitCode: 1 };
  }

  /**
   * Handle process errors (subprocess failures, etc.)
   */
  async handleProcessError(error, options) {
    this.userReporter.reportProcessError(error);

    if (options.showRecovery) {
      const recovery = await this.userReporter.showProcessRecovery(
        this.context
      );
      return { shouldExit: false, recovery };
    }

    return { shouldExit: true, exitCode: 1 };
  }

  /**
   * Handle user cancellation gracefully
   */
  async handleUserCancellation(error, options) {
    this.userReporter.reportUserCancellation();

    // Cleanup if needed
    if (options.shouldCleanup && this.context.projectPath) {
      await this.cleanupManager.cleanup(this.context.projectPath, {
        reason: "user_cancelled",
        verbose: options.verbose,
      });
    }

    return { shouldExit: true, exitCode: 0 }; // Exit code 0 for user cancellation
  }

  /**
   * Handle general/unknown errors
   */
  async handleGeneralError(error, options) {
    this.userReporter.reportGeneralError(error, options.verbose);

    // Cleanup if requested
    if (options.shouldCleanup && this.context.projectPath) {
      await this.cleanupManager.cleanup(this.context.projectPath, {
        reason: "general_error",
        verbose: options.verbose,
      });
    }

    this.userReporter.showHelpInfo();

    return { shouldExit: true, exitCode: 1 };
  }

  /**
   * Record error for analysis and debugging
   */
  recordError(error, type, severity) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      type,
      severity,
      stack: error.stack,
      context: { ...this.context },
    };

    this.errorHistory.push(errorRecord);

    // Keep only last 10 errors to prevent memory bloat
    if (this.errorHistory.length > 10) {
      this.errorHistory.shift();
    }
  }

  /**
   * Get error analytics for debugging
   */
  getErrorSummary() {
    return {
      totalErrors: this.errorHistory.length,
      errorsByType: this.errorHistory.reduce((acc, err) => {
        acc[err.type] = (acc[err.type] || 0) + 1;
        return acc;
      }, {}),
      recentErrors: this.errorHistory.slice(-3),
    };
  }

  /**
   * Wrapper for handling async operations with error recovery
   */
  async withErrorHandling(operation, errorOptions = {}) {
    try {
      return await operation();
    } catch (error) {
      const result = await this.handle(error, errorOptions);

      if (result.shouldExit) {
        process.exit(result.exitCode);
      }

      return result;
    }
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Handle uncaught exceptions
    process.on("uncaughtException", async (error) => {
      console.error(chalk.red("\nUncaught Exception:"));
      await this.handle(error, {
        type: "process",
        severity: "critical",
        shouldCleanup: true,
        verbose: true,
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", async (reason) => {
      console.error(chalk.red("\nUnhandled Promise Rejection:"));
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      await this.handle(error, {
        type: "process",
        severity: "critical",
        shouldCleanup: true,
        verbose: true,
      });
      process.exit(1);
    });

    // Handle termination signals gracefully
    process.on("SIGINT", async () => {
      await this.handle(new Error("Process interrupted by user"), {
        type: "user_cancelled",
        shouldCleanup: true,
      });
    });

    process.on("SIGTERM", async () => {
      await this.handle(new Error("Process terminated"), {
        type: "user_cancelled",
        shouldCleanup: true,
      });
    });
  }
}
