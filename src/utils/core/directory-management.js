import fs from "fs-extra";
import path from "path";

/**
 * Directory management utilities for project setup
 * Eliminates duplication of fs.ensureDirSync() patterns across the codebase
 */

/**
 * Create project directories and return path mapping
 * @param {string} projectPath - Root project path
 * @param {Array|Object} directories - Array of directory names or object with key-value paths
 * @returns {Object} Object mapping directory names to full paths
 */
export function createProjectDirectories(projectPath, directories) {
  const paths = {};

  if (Array.isArray(directories)) {
    // Handle array of directory names
    directories.forEach((dir) => {
      const fullPath = path.join(projectPath, dir);
      fs.ensureDirSync(fullPath);
      paths[dir] = fullPath;
    });
  } else if (typeof directories === "object") {
    // Handle object with key-value pairs
    Object.entries(directories).forEach(([key, dirPath]) => {
      const fullPath = path.isAbsolute(dirPath)
        ? dirPath
        : path.join(projectPath, dirPath);
      fs.ensureDirSync(fullPath);
      paths[key] = fullPath;
    });
  }

  return paths;
}

/**
 * Create a single directory and return its path
 * @param {string} projectPath - Root project path
 * @param {string} directory - Directory name/path relative to project
 * @returns {string} Full path to created directory
 */
export function createProjectDirectory(projectPath, directory) {
  const fullPath = path.join(projectPath, directory);
  fs.ensureDirSync(fullPath);
  return fullPath;
}

/**
 * Create nested directories with explicit structure
 * Useful for complex hierarchies where order matters
 * @param {string} projectPath - Root project path
 * @param {Object} structure - Nested object representing directory structure
 * @returns {Object} Flattened object with all created paths
 */
export function createNestedDirectories(projectPath, structure) {
  const paths = {};

  function createLevel(currentPath, currentStructure, pathPrefix = "") {
    Object.entries(currentStructure).forEach(([key, value]) => {
      const fullPath = path.join(currentPath, key);
      fs.ensureDirSync(fullPath);

      const pathKey = pathPrefix ? `${pathPrefix}.${key}` : key;
      paths[pathKey] = fullPath;

      if (typeof value === "object" && value !== null) {
        createLevel(fullPath, value, pathKey);
      }
    });
  }

  createLevel(projectPath, structure);
  return paths;
}

/**
 * Common project directory structures for different frameworks
 */
export const DIRECTORY_STRUCTURES = {
  vite: {
    base: ["src", "public"],
    withRouting: ["src", "src/pages", "src/components", "public"],
    withState: ["src", "src/store", "src/components", "public"],
    complete: ["src", "src/pages", "src/components", "src/store", "public"],
  },

  nextjs: {
    base: ["public"],
    app: ["app", "public"],
    pages: ["pages", "pages/api", "styles", "public"],
    appWithState: ["app", "lib", "lib/features", "components", "public"],
    pagesWithState: ["pages", "pages/api", "styles", "components", "public"],
  },

  common: {
    basic: ["src", "public"],
    development: [".vscode"],
    testing: ["__tests__", "src/__tests__"],
  },
};

/**
 * Create standard framework directories
 * @param {string} projectPath - Root project path
 * @param {string} framework - Framework name ('vite', 'nextjs')
 * @param {Object} options - Setup options
 * @returns {Object} Created directory paths
 */
export function createFrameworkDirectories(
  projectPath,
  framework,
  options = {}
) {
  const { routing, stateManagement, nextRouting } = options;

  let structure;

  if (framework === "vite") {
    if (routing && stateManagement) {
      structure = DIRECTORY_STRUCTURES.vite.complete;
    } else if (routing) {
      structure = DIRECTORY_STRUCTURES.vite.withRouting;
    } else if (stateManagement) {
      structure = DIRECTORY_STRUCTURES.vite.withState;
    } else {
      structure = DIRECTORY_STRUCTURES.vite.base;
    }
  } else if (framework === "nextjs") {
    if (nextRouting === "app") {
      structure = stateManagement
        ? DIRECTORY_STRUCTURES.nextjs.appWithState
        : DIRECTORY_STRUCTURES.nextjs.app;
    } else {
      structure = stateManagement
        ? DIRECTORY_STRUCTURES.nextjs.pagesWithState
        : DIRECTORY_STRUCTURES.nextjs.pages;
    }
  } else {
    structure = DIRECTORY_STRUCTURES.common.basic;
  }

  return createProjectDirectories(projectPath, structure);
}

/**
 * Create state management directories
 * @param {string} projectPath - Root project path
 * @param {string} framework - Framework type ('standard' or 'nextjs')
 * @param {string} stateManager - State manager type ('redux' or 'zustand')
 * @returns {Object} Created directory paths
 */
export function createStateManagementDirectories(
  projectPath,
  framework,
  stateManager
) {
  if (framework === "nextjs") {
    return createProjectDirectories(projectPath, {
      lib: "lib",
      features: "lib/features",
      counter: "lib/features/counter",
      components: "components",
    });
  } else {
    // Standard frameworks
    const srcDir = path.join(projectPath, "src");
    return createProjectDirectories(projectPath, {
      src: "src",
      store: "src/store",
      components: "src/components",
    });
  }
}

/**
 * Create API directories for Next.js
 * @param {string} projectPath - Root project path
 * @param {string} routingType - 'app' or 'pages'
 * @returns {Object} Created directory paths
 */
export function createApiDirectories(projectPath, routingType) {
  if (routingType === "app") {
    return createProjectDirectories(projectPath, {
      api: "app/api",
      hello: "app/api/hello",
    });
  } else {
    return createProjectDirectories(projectPath, {
      api: "pages/api",
    });
  }
}

/**
 * Ensure a directory exists (utility wrapper around fs.ensureDirSync)
 * @param {string} dirPath - Full path to directory
 * @returns {string} The directory path
 */
export function ensureDirectory(dirPath) {
  fs.ensureDirSync(dirPath);
  return dirPath;
}

/**
 * Create multiple unrelated directories
 * @param {Array<string>} directories - Array of full directory paths
 * @returns {Array<string>} Array of created directory paths
 */
export function ensureDirectories(directories) {
  return directories.map((dir) => {
    fs.ensureDirSync(dir);
    return dir;
  });
}
