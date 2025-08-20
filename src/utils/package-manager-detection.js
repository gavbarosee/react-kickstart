import execa from "execa";
import chalk from "chalk";
import { debug } from "./logger.js";
import { createErrorHandler, ERROR_TYPES } from "../errors/index.js";

/**
 * Detects available package managers and their versions
 * @param {Object} options - Detection options
 * @param {boolean} [options.verbose=false] - Enable verbose logging
 * @returns {Promise<Object.<string, PackageManagerInfo>>} - Map of package manager info
 */
export async function detectPackageManagers(options = {}) {
  const { verbose = false } = options;

  // start with default state - assume nothing is available
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
    // todo: add pnpm, bun, etc. in the future
  };

  debug("Detecting package managers...", verbose);

  await Promise.allSettled([
    detectNpm(managers, verbose),
    detectYarn(managers, verbose),
  ]);

  if (managers.yarn.available) {
    managers.yarn.recommended = true;
  } else if (managers.npm.available) {
    managers.npm.recommended = true;
  }

  // log detection results in verbose mode
  if (verbose) {
    Object.entries(managers).forEach(([name, info]) => {
      if (info.available) {
        debug(
          `Detected ${name} v${info.version}${
            info.recommended ? " (recommended)" : ""
          }`,
          true
        );
      } else {
        debug(`${name} not available: ${info.error || "Not installed"}`, true);
      }
    });
  }

  return managers;
}

async function detectNpm(managers, verbose) {
  try {
    // run npm --version to check availability
    const { stdout } = await execa("npm", ["--version"], {
      timeout: 3000, // 3 second timeout
    });

    const version = stdout.trim();

    // validate version format
    if (!version.match(/^\d+\.\d+\.\d+$/)) {
      throw new Error(`Invalid version format: ${version}`);
    }

    managers.npm.available = true;
    managers.npm.version = version;

    debug(`npm detected: v${version}`, verbose);
  } catch (err) {
    managers.npm.available = false;
    managers.npm.error = err.message || "Unknown error";

    // error handling based on error type
    if (err.code === "ENOENT") {
      debug("npm not found in PATH", verbose);
    } else if (err.code === "ETIMEDOUT") {
      debug("npm detection timed out", verbose);
    } else {
      debug(`npm detection error: ${err.message}`, verbose);
    }
  }
}

async function detectYarn(managers, verbose) {
  try {
    // run yarn --version to check availability
    const { stdout } = await execa("yarn", ["--version"], {
      timeout: 3000, // 3 second timeout
    });

    const version = stdout.trim();

    // validate version format (yarn can be x.y.z or just x.y)
    if (!version.match(/^\d+\.\d+(\.\d+)?$/)) {
      throw new Error(`Invalid version format: ${version}`);
    }

    managers.yarn.available = true;
    managers.yarn.version = version;

    debug(`yarn detected: v${version}`, verbose);
  } catch (err) {
    managers.yarn.available = false;
    managers.yarn.error = err.message || "Unknown error";

    if (err.code === "ENOENT") {
      debug("yarn not found in PATH", verbose);
    } else if (err.code === "ETIMEDOUT") {
      debug("yarn detection timed out", verbose);
    } else {
      debug(`yarn detection error: ${err.message}`, verbose);
    }
  }
}

export function formatPackageManagerChoices(managers) {
  const choices = [];

  // add npm choice if available
  if (managers.npm.available) {
    choices.push({
      name: `${chalk.green("📦 npm")}${
        managers.npm.recommended ? " " + chalk.gray("(recommended)") : ""
      }`,
      value: "npm",
      short: "npm",
    });
  }

  if (managers.yarn.available) {
    choices.push({
      name: `${chalk.blue("🧶 yarn")}${
        managers.yarn.recommended ? " " + chalk.gray("(recommended)") : ""
      }`,
      value: "yarn",
      short: "yarn",
    });
  }

  // if no package managers are available, add disabled options with installation instructions
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
        "Or install Yarn: https://yarnpkg.com/getting-started/install"
      )}`,
      value: null,
      disabled: true,
    });

    // add emergency fallback to npm
    choices.push({
      name: `${chalk.yellow("Try with npm anyway")}`,
      value: "npm",
    });
  }

  return choices;
}

/**
 * Gets default package manager based on detection results
 * @param {Object.<string, PackageManagerInfo>} managers - Detected package managers
 * @returns {string|null} - Default package manager or null if none available
 */
export function getDefaultPackageManager(managers) {
  // first try to get the recommended one
  const recommended = Object.entries(managers).find(
    ([_, info]) => info.available && info.recommended
  );

  if (recommended) {
    return recommended[0];
  }

  // otherwise, get the first available one
  const available = Object.entries(managers).find(
    ([_, info]) => info.available
  );

  if (available) {
    return available[0];
  }

  return null;
}
