import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

/**
 * Filesystem utilities - file/directory operations and analysis
 */

/**
 * Checks if a directory appears to have been created by our tool
 * @param {string} dirPath - Path to the directory to check
 * @returns {boolean} - Whether the directory appears to have been created by our tool
 */
export function isProjectCreatedByTool(dirPath) {
  try {
    // Check if package.json exists and has expected content
    const packageJsonPath = path.join(dirPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);

      // Check if scripts contain expected keys (like dev, build, etc.)
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
    const srcExists = fs.existsSync(path.join(dirPath, "src"));
    const publicExists = fs.existsSync(path.join(dirPath, "public"));
    const appExists = fs.existsSync(path.join(dirPath, "app")); // Next.js app router
    const pagesExists = fs.existsSync(path.join(dirPath, "pages")); // Next.js pages router

    // Evidence of our generated structure
    return (srcExists && publicExists) || appExists || pagesExists;
  } catch (error) {
    console.error(chalk.red(`Error checking directory contents: ${error.message}`));
    return false;
  }
}

/**
 * Count files recursively in a directory
 * @param {string} directory - Directory to count files in
 * @returns {Object} - Object with fileCount and totalSize
 */
export function countFilesRecursive(directory) {
  let fileCount = 0;
  let totalSize = 0;

  function countFiles(dir) {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          // Skip node_modules and .git directories
          if (item !== "node_modules" && item !== ".git") {
            countFiles(fullPath);
          }
        } else {
          fileCount++;
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Silently continue if we can't read a directory
    }
  }

  countFiles(directory);
  return { fileCount, totalSize };
}

/**
 * Get project file generation info
 * @param {string} projectPath - Path to the project
 */
export function getProjectFileInfo(projectPath) {
  try {
    if (!fs.existsSync(projectPath)) {
      return {
        error: `Project path '${projectPath}' doesn't exist`,
        fileCount: 0,
        totalSize: 0,
      };
    }

    const { fileCount, totalSize } = countFilesRecursive(projectPath);
    const sizeInKB = (totalSize / 1024).toFixed(0);

    return {
      fileCount,
      totalSize,
      sizeInKB,
      formattedSize: `${sizeInKB}KB`,
    };
  } catch (error) {
    return {
      error: `Error calculating project stats: ${error.message}`,
      fileCount: 0,
      totalSize: 0,
    };
  }
}

/**
 * Count packages from package.json
 * @param {string} packageJsonPath - Path to package.json
 * @returns {number} - Estimated total package count
 */
export function countPackages(packageJsonPath) {
  try {
    const packageData = fs.readJsonSync(packageJsonPath);
    const dependencies = Object.keys(packageData.dependencies || {}).length;
    const devDependencies = Object.keys(packageData.devDependencies || {}).length;
    const totalDirectDeps = dependencies + devDependencies;

    // Estimate total packages (including transitive dependencies)
    return Math.round(totalDirectDeps * 5);
  } catch (error) {
    return 25; // Default estimate
  }
}

/**
 * Safely read and parse JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Object|null} - Parsed JSON or null if error
 */
export function safeReadJson(filePath) {
  try {
    return fs.readJsonSync(filePath);
  } catch (error) {
    return null;
  }
}

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path
 */
export function ensureDir(dirPath) {
  try {
    fs.ensureDirSync(dirPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if file exists
 * @param {string} filePath - File path to check
 * @returns {boolean} - Whether file exists
 */
export function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}
