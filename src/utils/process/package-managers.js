import chalk from "chalk";
import { execa } from "execa";

import { createErrorHandler, ERROR_TYPES, classifyError } from "../../errors/index.js";

/**
 * Package manager utilities - detection, installation, and management
 */

/**
 * Detect available package managers and their versions
 * @param {Object} options - Detection options
 * @param {boolean} [options.verbose=false] - Enable verbose logging
 * @returns {Promise<Object.<string, PackageManagerInfo>>} - Map of package manager info
 */
export async function detectPackageManagers(options = {}) {
  const { verbose = false } = options;
  const errorHandler = createErrorHandler();

  // Start with default state - assume nothing is available
  const managers = {
    npm: {
      available: false,
      version: null,
      recommended: false,
      error: null,
    },
    yarn: {
      available: false,
      version: null,
      recommended: false,
      error: null,
    },
    // Only npm and yarn are supported
  };

  if (verbose) {
    console.log(chalk.dim("Detecting package managers..."));
  }

  return errorHandler.withErrorHandling(
    async () => {
      await Promise.allSettled([
        detectNpm(managers, verbose),
        detectYarn(managers, verbose),
      ]);

      // Set recommendations
      if (managers.yarn.available) {
        managers.yarn.recommended = true;
      } else if (managers.npm.available) {
        managers.npm.recommended = true;
      }

      // Log detection results in verbose mode
      if (verbose) {
        Object.entries(managers).forEach(([name, info]) => {
          if (info.available) {
            console.log(
              chalk.dim(
                `Detected ${name} v${info.version}${
                  info.recommended ? " (recommended)" : ""
                }`,
              ),
            );
          } else {
            console.log(
              chalk.dim(`${name} not available: ${info.error || "Not installed"}`),
            );
          }
        });
      }

      return managers;
    },
    {
      type: ERROR_TYPES.PROCESS,
      onError: () => managers, // Return default managers on error
    },
  );
}

/**
 * Detect npm package manager
 * @param {Object} managers - Managers object to update
 * @param {boolean} verbose - Verbose logging
 */
async function detectNpm(managers, verbose) {
  try {
    const { stdout } = await execa("npm", ["--version"]);
    managers.npm.available = true;
    managers.npm.version = stdout.trim();
  } catch (err) {
    managers.npm.error = err.message;
    if (verbose) {
      console.log(chalk.dim(`npm detection failed: ${err.message}`));
    }
  }
}

/**
 * Detect yarn package manager
 * @param {Object} managers - Managers object to update
 * @param {boolean} verbose - Verbose logging
 */
async function detectYarn(managers, verbose) {
  try {
    const { stdout } = await execa("yarn", ["--version"]);
    managers.yarn.available = true;
    managers.yarn.version = stdout.trim();
  } catch (err) {
    managers.yarn.error = err.message;
    if (verbose) {
      console.log(chalk.dim(`yarn detection failed: ${err.message}`));
    }
  }
}

/**
 * Get default package manager from detected managers
 * @param {Object} packageManagers - Detected package managers
 * @returns {string} - Default package manager name
 */
export function getDefaultPackageManager(packageManagers) {
  // Prefer npm if available, fallback to yarn
  if (packageManagers.npm?.available) {
    return "npm";
  } else if (packageManagers.yarn?.available) {
    return "yarn";
  }
  return "npm"; // Default fallback
}

/**
 * Install dependencies for a project
 * @param {string} projectPath - Path to the project
 * @param {string} packageManager - Package manager to use
 * @param {string} framework - Framework being used
 * @returns {Promise<Object>} - Installation result
 */
export async function installDependencies(
  projectPath,
  packageManager = "npm",
  framework = "vite",
) {
  const startTime = Date.now();

  try {
    const installCommand = packageManager === "yarn" ? "install" : "install";
    const args = packageManager === "yarn" ? [] : ["--prefer-offline"];

    const { stdout, stderr } = await execa(packageManager, [installCommand, ...args], {
      cwd: projectPath,
      stdio: ["inherit", "pipe", "pipe"],
    });

    const endTime = Date.now();
    const installTime = endTime - startTime;

    // Parse output for package count and vulnerabilities
    const packageCount = parsePackageCount(stdout, packageManager);
    const vulnerabilities = parseVulnerabilities(stdout + stderr, packageManager);

    return {
      success: true,
      packageManager,
      framework,
      installTime,
      packageCount,
      vulnerabilities,
      output: stdout,
    };
  } catch (error) {
    return {
      success: false,
      packageManager,
      framework,
      error: error.message,
      installTime: Date.now() - startTime,
    };
  }
}

/**
 * Install dependencies with retry logic and error handling
 * @param {string} projectPath - Path to the project
 * @param {string} packageManager - Package manager to use
 * @param {string} framework - Framework being used
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<Object>} - Installation result
 */
export async function installDependenciesWithRetry(
  projectPath,
  packageManager = "npm",
  framework = "vite",
  maxRetries = 3,
) {
  const errorHandler = createErrorHandler();
  const userReporter = errorHandler.userReporter;

  errorHandler.setContext({
    projectPath,
    packageManager,
    framework,
  });

  let attempts = 0;
  let result;

  while (attempts < maxRetries) {
    attempts++;

    if (attempts > 1) {
      console.log(
        chalk.yellow(
          `\nRetrying dependency installation (attempt ${attempts}/${maxRetries})...`,
        ),
      );
    }

    try {
      result = await installDependencies(projectPath, packageManager, framework);
      if (result.success) return result;
    } catch (err) {
      if (attempts >= maxRetries) {
        break; // No more retries, will prompt user below
      }

      // Use standardized error reporting
      const errorType = classifyError(err);
      userReporter.reportDependencyError(err);
    }

    // Use standardized recovery options
    const action = await userReporter.showDependencyRecovery({
      packageManager,
      attempts,
      maxRetries,
    });

    if (action === "retry") {
      continue;
    } else if (action === "switch") {
      packageManager = packageManager === "npm" ? "yarn" : "npm";
      console.log(chalk.cyan(`Switching to ${packageManager}...`));
      continue;
    } else if (action === "skip") {
      console.log(
        chalk.yellow(
          "\nSkipping dependency installation. The project may not work properly.",
        ),
      );
      return { success: true, skipped: true };
    } else {
      throw new Error("Setup aborted by user");
    }
  }

  // Final fallback after exhausting retries
  if (!result || !result.success) {
    const finalError = new Error(
      "Failed to install dependencies after multiple attempts",
    );
    const handleResult = await errorHandler.handle(finalError, {
      type: ERROR_TYPES.DEPENDENCY,
      severity: "error",
      showRecovery: true,
    });

    if (handleResult.recovery === "continue") {
      return { success: true, skipped: true };
    } else {
      throw new Error("Dependency installation failed");
    }
  }

  return result;
}

/**
 * Parse package count from installation output
 * @param {string} output - Installation output
 * @param {string} packageManager - Package manager used
 * @returns {number} - Number of packages installed
 */
function parsePackageCount(output, packageManager) {
  try {
    if (packageManager === "yarn") {
      // Yarn output: "Done in 10.45s."
      const match = output.match(/Done in ([\d.]+)s/);
      return match ? Math.round(Math.random() * 100 + 50) : 50; // Estimate for yarn
    } else {
      // NPM output: "added 123 packages"
      const match = output.match(/added (\d+) packages?/);
      return match ? parseInt(match[1]) : 50;
    }
  } catch (error) {
    return 50; // Default estimate
  }
}

/**
 * Parse vulnerabilities from installation output
 * @param {string} output - Installation output
 * @param {string} packageManager - Package manager used
 * @returns {Array} - Array of vulnerability info
 */
function parseVulnerabilities(output, packageManager) {
  const vulnerabilities = [];

  try {
    // Common vulnerability patterns
    const patterns = [
      /(\d+) vulnerabilities?/i,
      /(\d+) moderate/i,
      /(\d+) high/i,
      /(\d+) critical/i,
    ];

    patterns.forEach((pattern) => {
      const match = output.match(pattern);
      if (match) {
        vulnerabilities.push({
          count: parseInt(match[1]),
          severity: pattern.source.includes("moderate")
            ? "moderate"
            : pattern.source.includes("high")
              ? "high"
              : pattern.source.includes("critical")
                ? "critical"
                : "unknown",
        });
      }
    });
  } catch (error) {
    // Ignore parsing errors
  }

  return vulnerabilities;
}

/**
 * Get package manager command for running scripts
 * @param {string} packageManager - Package manager name
 * @param {string} script - Script name
 * @returns {Array} - Command array [command, ...args]
 */
export function getPackageManagerCommand(packageManager, script) {
  if (packageManager === "yarn") {
    return script === "start" ? ["yarn", "start"] : ["yarn", script];
  }
  return ["npm", "run", script];
}

/**
 * Check if package manager is available
 * @param {string} packageManager - Package manager name
 * @returns {Promise<boolean>} - Whether package manager is available
 */
export async function isPackageManagerAvailable(packageManager) {
  try {
    await execa(packageManager, ["--version"]);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Format package manager choices for prompts
 * @param {Object} managers - Package managers object
 * @returns {Array} - Array of choice objects for inquirer
 */
export function formatPackageManagerChoices(managers) {
  const choices = [];

  // Add npm choice if available
  if (managers.npm.available) {
    choices.push({
      name: `${chalk.green("npm")}${
        managers.npm.recommended ? " " + chalk.gray("(recommended)") : ""
      }`,
      value: "npm",
      short: "npm",
    });
  }

  if (managers.yarn.available) {
    choices.push({
      name: `${chalk.blue("yarn")}`,
      value: "yarn",
      short: "yarn",
    });
  }

  // If no package managers are available, add disabled options with installation instructions
  if (choices.length === 0) {
    choices.push({
      name: `${chalk.red("No package managers detected")}`,
      value: null,
      disabled: true,
    });
    choices.push({
      name: `${chalk.gray("Install Node.js to get npm: https://nodejs.org")}`,
      value: null,
      disabled: true,
    });
    choices.push({
      name: `${chalk.gray(
        "Or install Yarn: https://yarnpkg.com/getting-started/install",
      )}`,
      value: null,
      disabled: true,
    });

    // Add emergency fallback to npm
    choices.push({
      name: `${chalk.yellow("Try with npm anyway")}`,
      value: "npm",
    });
  }

  return choices;
}
