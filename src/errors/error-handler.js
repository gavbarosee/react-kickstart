import chalk from "chalk";
import { CleanupManager } from "./cleanup-manager.js";
import { UserErrorReporter } from "./user-error-reporter.js";

/**
 * Centralized error handling system with consistent patterns
 */
export class ErrorHandler {
  constructor() {
    this.cleanupManager = new CleanupManager();
    this.userReporter = new UserErrorReporter();
    this.errorHistory = [];
    this.context = {};
    this.errorConfigs = this.initializeErrorConfigs();
  }

  /**
   * Initialize error type configurations
   */
  initializeErrorConfigs() {
    return {
      validation: {
        reportMethod: "reportValidationError",
        recoveryMethod: "showValidationRecovery",
        exitCode: 1,
        allowRecovery: true,
        requiresCleanup: false,
        passContext: false,
      },
      network: {
        reportMethod: "reportNetworkError",
        recoveryMethod: "showNetworkRecovery",
        exitCode: 1,
        allowRecovery: true,
        requiresCleanup: false,
        passContext: false,
      },
      permission: {
        reportMethod: "reportPermissionError",
        recoveryMethod: "showPermissionRecovery",
        exitCode: 1,
        allowRecovery: true,
        requiresCleanup: false,
        passContext: false,
      },
      dependency: {
        reportMethod: "reportDependencyError",
        recoveryMethod: "showDependencyRecovery",
        exitCode: 1,
        allowRecovery: true,
        requiresCleanup: false,
        passContext: true,
      },
      process: {
        reportMethod: "reportProcessError",
        recoveryMethod: "showProcessRecovery",
        exitCode: 1,
        allowRecovery: true,
        requiresCleanup: false,
        passContext: true,
      },
      filesystem: {
        reportMethod: "reportFilesystemError",
        recoveryMethod: null,
        exitCode: 1,
        allowRecovery: false,
        requiresCleanup: true,
        passContext: false,
      },
      user_cancelled: {
        reportMethod: "reportUserCancellation",
        recoveryMethod: null,
        exitCode: 0,
        allowRecovery: false,
        requiresCleanup: "conditional", // Based on options.shouldCleanup
        passContext: false,
        skipErrorParam: true, // reportUserCancellation doesn't take error param
      },
      general: {
        reportMethod: "reportGeneralError",
        recoveryMethod: null,
        exitCode: 1,
        allowRecovery: false,
        requiresCleanup: "conditional",
        passContext: false,
        passVerbose: true,
        showHelp: true,
      },
    };
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
   * Consolidated error handling method that eliminates duplication
   * This method handles the common patterns shared by all error types
   */
  async handleTypedError(error, type, options) {
    const config = this.errorConfigs[type] || this.errorConfigs.general;

    // Step 1: Report the error
    await this.reportError(error, config, options);

    // Step 2: Handle cleanup if required
    await this.handleCleanupIfRequired(config, options);

    // Step 3: Handle recovery if allowed and requested
    if (config.allowRecovery && options.showRecovery && config.recoveryMethod) {
      const recovery = await this.handleRecovery(config, options);
      return { shouldExit: false, recovery };
    }

    // Step 4: Show additional help if configured
    if (config.showHelp) {
      this.userReporter.showHelpInfo();
    }

    return { shouldExit: true, exitCode: config.exitCode };
  }

  /**
   * Report error using the appropriate reporter method
   */
  async reportError(error, config, options) {
    const reportMethod = this.userReporter[config.reportMethod];
    if (!reportMethod) {
      throw new Error(`Reporter method '${config.reportMethod}' not found`);
    }

    // Build arguments based on configuration
    const args = [];
    if (!config.skipErrorParam) {
      args.push(error);
    }
    if (config.passVerbose) {
      args.push(options.verbose);
    }

    // Handle both sync and async reporter methods
    const result = reportMethod.call(this.userReporter, ...args);
    if (result && typeof result.then === "function") {
      await result;
    }
  }

  /**
   * Handle cleanup operations if required by error type
   */
  async handleCleanupIfRequired(config, options) {
    const shouldCleanup =
      config.requiresCleanup === true ||
      (config.requiresCleanup === "conditional" && options.shouldCleanup);

    if (shouldCleanup && this.context.projectPath) {
      // Generate cleanup reason from report method name
      let reason = config.reportMethod
        .replace("report", "")
        .replace("Error", "")
        .replace("UserCancellation", "user_cancelled")
        .replace("General", "general")
        .toLowerCase();

      // Handle edge cases
      if (reason === "usercancellation") reason = "user_cancelled";
      if (reason === "") reason = "general"; // fallback

      await this.cleanupManager.cleanup(this.context.projectPath, {
        reason: `${reason}_error`,
        verbose: options.verbose,
      });
    }
  }

  /**
   * Handle recovery operations
   */
  async handleRecovery(config, options) {
    const recoveryMethod = this.userReporter[config.recoveryMethod];
    if (!recoveryMethod) {
      throw new Error(`Recovery method '${config.recoveryMethod}' not found`);
    }

    const args = config.passContext ? [this.context] : [];
    const result = recoveryMethod.call(this.userReporter, ...args);

    // Handle both sync and async recovery methods
    if (result && typeof result.then === "function") {
      return await result;
    }
    return result;
  }

  /**
   * Handle validation errors (bad input, invalid names, etc.)
   */
  async handleValidationError(error, options) {
    return this.handleTypedError(error, "validation", options);
  }

  /**
   * Handle network-related errors
   */
  async handleNetworkError(error, options) {
    return this.handleTypedError(error, "network", options);
  }

  /**
   * Handle permission errors
   */
  async handlePermissionError(error, options) {
    return this.handleTypedError(error, "permission", options);
  }

  /**
   * Handle dependency installation errors
   */
  async handleDependencyError(error, options) {
    return this.handleTypedError(error, "dependency", options);
  }

  /**
   * Handle filesystem errors
   */
  async handleFilesystemError(error, options) {
    return this.handleTypedError(error, "filesystem", options);
  }

  /**
   * Handle process errors (subprocess failures, etc.)
   */
  async handleProcessError(error, options) {
    return this.handleTypedError(error, "process", options);
  }

  /**
   * Handle user cancellation gracefully
   */
  async handleUserCancellation(error, options) {
    return this.handleTypedError(error, "user_cancelled", options);
  }

  /**
   * Handle general/unknown errors
   */
  async handleGeneralError(error, options) {
    return this.handleTypedError(error, "general", options);
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
