import chalk from "chalk";
import figures from "figures";
import inquirer from "inquirer";
import symbols from "log-symbols";

/**
 * Provides consistent, user-friendly error messaging and recovery options
 */
export class UserErrorReporter {
  constructor() {
    this.errorCounts = {};
  }

  /**
   * Report validation errors with helpful context
   */
  reportValidationError(error) {
    console.error();
    console.error(chalk.red(`${symbols.error} Invalid Configuration`));
    console.error(chalk.red(`${error.message || error}`));
    console.error();
  }

  /**
   * Show validation error recovery options
   */
  showValidationRecovery() {
    console.log(chalk.cyan("Please check your input and try again."));
    console.log(chalk.cyan("Make sure project names are valid npm package names."));
    console.error();
  }

  /**
   * Report network-related errors with context
   */
  reportNetworkError(error) {
    console.error();
    console.error(chalk.red(`${symbols.error} Network Error`));
    console.error(chalk.red(`${error.message || error}`));

    if (this.isNetworkError(error)) {
      console.error();
      console.error(chalk.yellow("This appears to be a network connectivity issue."));
      console.error(
        chalk.yellow("Please check your internet connection and try again."),
      );
    }

    console.error();
  }

  /**
   * Show network error recovery options
   */
  async showNetworkRecovery() {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "How would you like to proceed?",
        choices: [
          { name: "Retry the operation", value: "retry" },
          { name: "Continue without network operations", value: "skip" },
          { name: "Exit and try again later", value: "exit" },
        ],
      },
    ]);

    return action;
  }

  /**
   * Report permission errors with context
   */
  reportPermissionError(error) {
    console.error();
    console.error(chalk.red(`${symbols.error} Permission Error`));
    console.error(chalk.red(`${error.message || error}`));
    console.error();
    console.error(chalk.yellow("This appears to be a file system permissions issue."));
    console.error(
      chalk.yellow(
        "You might need elevated privileges or different directory permissions.",
      ),
    );
    console.error();
  }

  /**
   * Show permission error recovery options
   */
  async showPermissionRecovery() {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "How would you like to resolve this?",
        choices: [
          {
            name: "Try running with elevated privileges (sudo)",
            value: "sudo",
          },
          { name: "Choose a different directory", value: "different_dir" },
          { name: "Exit and fix permissions manually", value: "exit" },
        ],
      },
    ]);

    return action;
  }

  /**
   * Report dependency installation errors
   */
  reportDependencyError(error) {
    console.error();
    console.error(chalk.red(`${symbols.error} Dependency Installation Failed`));
    console.error(chalk.red(`${error.message || error}`));

    this.showDependencyErrorContext(error);
    console.error();
  }

  /**
   * Show context-specific guidance for dependency errors
   */
  showDependencyErrorContext(error) {
    const errorMsg = error.message || String(error);

    if (errorMsg.includes("ENOTFOUND") || errorMsg.includes("ETIMEDOUT")) {
      console.error(chalk.cyan("→ Network connectivity issue detected"));
      console.error(chalk.cyan("  Check your internet connection and proxy settings"));
    } else if (errorMsg.includes("ENOENT")) {
      console.error(chalk.cyan("→ Package manager not found"));
      console.error(
        chalk.cyan("  Make sure npm or yarn is installed and in your PATH"),
      );
    } else if (errorMsg.includes("EACCES") || errorMsg.includes("permission")) {
      console.error(chalk.cyan("→ Permission issue detected"));
      console.error(chalk.cyan("  You might need to run with elevated privileges"));
    } else if (errorMsg.includes("ERESOLVE") || errorMsg.includes("peer dep")) {
      console.error(chalk.cyan("→ Dependency conflict detected"));
      console.error(chalk.cyan("  There may be version conflicts between packages"));
    } else if (errorMsg.includes("E404") || errorMsg.includes("not found")) {
      console.error(chalk.cyan("→ Package not found"));
      console.error(
        chalk.cyan("  One or more packages may not exist or be accessible"),
      );
    }
  }

  /**
   * Show dependency error recovery options
   */
  async showDependencyRecovery(context = {}) {
    const { packageManager = "npm" } = context;

    const choices = [
      { name: "Retry installation", value: "retry" },
      {
        name: `Switch to ${packageManager === "npm" ? "yarn" : "npm"}`,
        value: "switch",
      },
      { name: "Skip dependency installation", value: "skip" },
      { name: "Exit and fix manually", value: "exit" },
    ];

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "How would you like to proceed?",
        choices,
      },
    ]);

    return action;
  }

  /**
   * Report filesystem errors
   */
  reportFilesystemError(error) {
    console.error();
    console.error(chalk.red(`${symbols.error} File System Error`));
    console.error(chalk.red(`${error.message || error}`));
    console.error();
    console.error(chalk.yellow("A file system operation failed."));
    console.error(
      chalk.yellow("This could be due to permissions, disk space, or file locks."),
    );
    console.error();
  }

  /**
   * Report process errors (subprocess failures)
   */
  reportProcessError(error) {
    console.error();
    console.error(chalk.red(`${symbols.error} Process Error`));
    console.error(chalk.red(`${error.message || error}`));
    console.error();
  }

  /**
   * Show process error recovery options
   */
  async showProcessRecovery(context = {}) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "How would you like to proceed?",
        choices: [
          { name: "Retry the operation", value: "retry" },
          { name: "Continue with manual setup", value: "manual" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    return action;
  }

  /**
   * Report user cancellation gracefully
   */
  reportUserCancellation() {
    console.log();
    console.log(
      chalk.yellow(`${figures.warning} Cancelled by user (CTRL-C). Cleaning up…`),
    );
    console.log();
  }

  /**
   * Report general/unknown errors
   */
  reportGeneralError(error, verbose = false) {
    console.error();
    console.error(chalk.red(`${symbols.error} An unexpected error occurred`));
    console.error(chalk.red(`${error.message || error}`));

    if (verbose && error.stack) {
      console.error();
      console.error(chalk.gray("Stack trace:"));
      console.error(chalk.gray(error.stack));
    }

    console.error();
  }

  /**
   * Report critical errors that shouldn't happen
   */
  reportCriticalError(error) {
    console.error();
    console.error(chalk.bgRed.white(" CRITICAL ERROR "));
    console.error(chalk.red(`${error.message || error}`));
    console.error();
    console.error(chalk.yellow("This is an unexpected internal error."));
    console.error(chalk.yellow("Please report this issue with the details above."));
    console.error();
    this.showHelpInfo();
  }

  /**
   * Show help information and links
   */
  showHelpInfo() {
    console.log(chalk.cyan("Need help?"));
    console.log(
      chalk.blue(
        "  • Documentation: https://github.com/gavbarosee/react-kickstart#readme",
      ),
    );
    console.log(
      chalk.blue(
        "  • Report issues: https://github.com/gavbarosee/react-kickstart/issues/new",
      ),
    );
    console.log(
      chalk.blue(
        "  • Discussions: https://github.com/gavbarosee/react-kickstart/discussions",
      ),
    );
    console.log();
  }

  /**
   * Show recovery suggestions based on error type
   */
  showRecoverySuggestions(errorType) {
    console.log(chalk.cyan("Recovery suggestions:"));

    switch (errorType) {
      case "network":
        console.log(chalk.blue("  • Check your internet connection"));
        console.log(
          chalk.blue("  • Verify proxy settings if behind a corporate firewall"),
        );
        console.log(chalk.blue("  • Try again in a few minutes"));
        break;
      case "permission":
        console.log(chalk.blue("  • Try running with elevated privileges"));
        console.log(chalk.blue("  • Check directory permissions"));
        console.log(chalk.blue("  • Choose a different directory"));
        break;
      case "dependency":
        console.log(chalk.blue("  • Clear npm/yarn cache and try again"));
        console.log(chalk.blue("  • Switch to a different package manager"));
        console.log(chalk.blue("  • Check if all required tools are installed"));
        break;
      default:
        console.log(chalk.blue("  • Try running the command again"));
        console.log(chalk.blue("  • Check the documentation for troubleshooting"));
        console.log(chalk.blue("  • Report the issue if it persists"));
    }

    console.log();
  }

  /**
   * Show success recovery message
   */
  showSuccessRecovery(message) {
    console.log();
    console.log(chalk.green(`${symbols.success} ${message}`));
    console.log();
  }

  /**
   * Check if error is network-related
   */
  isNetworkError(error) {
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

  /**
   * Track error frequency for analytics
   */
  trackError(errorType) {
    this.errorCounts[errorType] = (this.errorCounts[errorType] || 0) + 1;
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return {
      totalErrors: Object.values(this.errorCounts).reduce(
        (sum, count) => sum + count,
        0,
      ),
      errorsByType: { ...this.errorCounts },
      mostCommonError:
        Object.entries(this.errorCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
    };
  }

  /**
   * Format error message with consistent styling
   */
  formatError(title, message, suggestions = []) {
    console.error();
    console.error(chalk.red(`${symbols.error} ${title}`));
    console.error(chalk.red(message));

    if (suggestions.length > 0) {
      console.error();
      console.error(chalk.cyan("Suggestions:"));
      suggestions.forEach((suggestion) => {
        console.error(chalk.blue(`  • ${suggestion}`));
      });
    }

    console.error();
  }
}
