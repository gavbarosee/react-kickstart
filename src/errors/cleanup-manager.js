import chalk from "chalk";
import fs from "fs-extra";
import os from "os";
import path from "path";

/**
 * Manages project cleanup with safety checks and different cleanup strategies
 */
export class CleanupManager {
  constructor() {
    this.cleanupHistory = [];
  }

  /**
   * Main cleanup method with comprehensive safety checks
   */
  async cleanup(projectPath, options = {}) {
    const {
      reason = "unknown",
      force = false,
      verbose = false,
      maxAge = 5, // minutes
    } = options;

    if (!projectPath) {
      if (verbose) {
        console.log(chalk.yellow("No project path provided for cleanup"));
      }
      return { success: false, reason: "no_path" };
    }

    try {
      // Safety check 1: Prevent dangerous paths
      if (this.isDangerousPath(projectPath)) {
        console.error(
          chalk.red(`Refusing to clean up potentially dangerous path: ${projectPath}`),
        );
        return { success: false, reason: "dangerous_path" };
      }

      // Safety check 2: Check if path exists
      if (!fs.existsSync(projectPath)) {
        if (verbose) {
          console.log(chalk.yellow(`Cleanup target does not exist: ${projectPath}`));
        }
        return { success: true, reason: "already_missing" };
      }

      // Safety check 3: Age check (unless forced)
      if (!force && !this.isRecentlyCreated(projectPath, maxAge)) {
        console.error(
          chalk.yellow(
            `Skipping cleanup of directory older than ${maxAge} minutes: ${projectPath}`,
          ),
        );
        return { success: false, reason: "too_old" };
      }

      // Safety check 4: Verify it's our project (unless forced)
      if (!force && !this.isOurProject(projectPath)) {
        console.error(
          chalk.yellow(
            `Skipping cleanup as directory doesn't appear to be created by react-kickstart: ${projectPath}`,
          ),
        );
        return { success: false, reason: "not_our_project" };
      }

      // Perform cleanup
      const cleanupResult = await this.performCleanup(projectPath, options);

      // Record cleanup
      this.recordCleanup(projectPath, reason, cleanupResult);

      if (cleanupResult.success) {
        console.log(chalk.yellow(`Cleaned up project directory: ${projectPath}`));
      }

      return cleanupResult;
    } catch (error) {
      console.error(chalk.red(`Failed to clean up directory: ${error.message}`));
      return { success: false, reason: "cleanup_error", error };
    }
  }

  /**
   * Check if a path is dangerous to delete
   */
  isDangerousPath(projectPath) {
    const normalizedPath = path.resolve(projectPath);
    const cwd = process.cwd();
    const home = os.homedir();

    // Dangerous paths
    const dangerousPaths = [
      "/",
      "/usr",
      "/bin",
      "/etc",
      "/var",
      "/opt",
      "/boot",
      "/sys",
      "/proc",
      "/dev",
      home,
      cwd,
      path.dirname(cwd),
    ];

    return dangerousPaths.some(
      (dangerous) =>
        normalizedPath === path.resolve(dangerous) || normalizedPath.length < 10, // Very short paths are suspicious
    );
  }

  /**
   * Check if directory was recently created
   */
  isRecentlyCreated(projectPath, maxAgeMinutes) {
    try {
      const stats = fs.statSync(projectPath);
      const creationTime = new Date(stats.birthtime).getTime();
      const now = new Date().getTime();
      const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

      return now - creationTime <= maxAge;
    } catch (error) {
      // If we can't check age, err on the side of caution
      return false;
    }
  }

  /**
   * Check if directory appears to be our project
   */
  isOurProject(projectPath) {
    try {
      // Prefer explicit marker created during this run
      const markerPath = path.join(projectPath, ".react-kickstart.tmp");
      if (fs.existsSync(markerPath)) {
        return true;
      }

      // Check for package.json with React dependencies
      const packageJsonPath = path.join(projectPath, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJsonSync(packageJsonPath);

        // Check if scripts contain expected keys
        const hasExpectedScripts =
          packageJson.scripts &&
          (packageJson.scripts.dev ||
            packageJson.scripts.build ||
            packageJson.scripts.start);

        // Check if dependencies contain React
        const hasReactDep =
          packageJson.dependencies &&
          (packageJson.dependencies.react || packageJson.dependencies["react-dom"]);

        if (hasExpectedScripts && hasReactDep) {
          return true;
        }
      }

      // Check for framework-specific directories
      const srcExists = fs.existsSync(path.join(projectPath, "src"));
      const publicExists = fs.existsSync(path.join(projectPath, "public"));
      const appExists = fs.existsSync(path.join(projectPath, "app")); // Next.js app router
      const pagesExists = fs.existsSync(path.join(projectPath, "pages")); // Next.js pages router

      // Evidence of our generated structure
      return (srcExists && publicExists) || appExists || pagesExists;
    } catch (error) {
      // If we can't verify, err on the side of caution
      return false;
    }
  }

  /**
   * Perform the actual cleanup operation
   */
  async performCleanup(projectPath, options = {}) {
    const { verbose = false, strategy = "remove" } = options;

    try {
      switch (strategy) {
        case "remove":
          fs.removeSync(projectPath);
          break;
        case "empty":
          fs.emptyDirSync(projectPath);
          break;
        case "backup":
          await this.backupAndRemove(projectPath);
          break;
        default:
          throw new Error(`Unknown cleanup strategy: ${strategy}`);
      }

      return { success: true, strategy };
    } catch (error) {
      return { success: false, error: error.message, strategy };
    }
  }

  /**
   * Backup directory before removing (for safety)
   */
  async backupAndRemove(projectPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${projectPath}.backup.${timestamp}`;

    // Move to backup location
    fs.moveSync(projectPath, backupPath);

    console.log(chalk.cyan(`Project backed up to: ${backupPath}`));

    return { backupPath };
  }

  /**
   * Emergency cleanup for critical situations
   */
  async emergencyCleanup(projectPath) {
    return this.cleanup(projectPath, {
      reason: "emergency",
      force: true,
      strategy: "backup",
      verbose: true,
    });
  }

  /**
   * Record cleanup operation for auditing
   */
  recordCleanup(projectPath, reason, result) {
    const record = {
      timestamp: new Date().toISOString(),
      projectPath,
      reason,
      success: result.success,
      strategy: result.strategy,
    };

    this.cleanupHistory.push(record);

    // Keep only last 20 cleanup records
    if (this.cleanupHistory.length > 20) {
      this.cleanupHistory.shift();
    }
  }

  /**
   * Get cleanup statistics
   */
  getCleanupStats() {
    return {
      totalCleanups: this.cleanupHistory.length,
      successRate:
        this.cleanupHistory.length > 0
          ? this.cleanupHistory.filter((r) => r.success).length /
            this.cleanupHistory.length
          : 0,
      cleanupsByReason: this.cleanupHistory.reduce((acc, record) => {
        acc[record.reason] = (acc[record.reason] || 0) + 1;
        return acc;
      }, {}),
      recentCleanups: this.cleanupHistory.slice(-5),
    };
  }

  /**
   * Setup process cleanup handlers
   */
  setupCleanupHandlers(projectPath) {
    const cleanup = () => {
      this.cleanup(projectPath, {
        reason: "process_exit",
        verbose: true,
      });
    };

    // Handle various exit scenarios
    process.on("exit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("SIGUSR1", cleanup);
    process.on("SIGUSR2", cleanup);
  }
}
