import fs from "fs-extra";
import path from "path";

import { getConfigExtension, getComponentExtension } from "./file-extensions.js";

/**
 * Project analysis utilities - analyze and categorize project components
 */

/**
 * Categorize dependencies from package.json
 * @param {string} packageJsonPath - Path to package.json
 * @returns {Object} - Categorized dependencies
 */
export function categorizeDependencies(packageJsonPath) {
  try {
    const packageData = fs.readJsonSync(packageJsonPath);
    const dependencies = packageData.dependencies || {};
    const devDependencies = packageData.devDependencies || {};

    // Categories for dependencies
    const categories = {
      "React ecosystem": [],
      "UI frameworks": [],
      "Build tools": [],
      "Dev tools": [],
      Routing: [],
      "State management": [],
      Testing: [],
      Others: [],
    };

    // Helper to categorize a dependency
    function categorize(name, version) {
      const dep = `${name}@${version}`;

      // React ecosystem
      if (["react", "react-dom", "@types/react", "@types/react-dom"].includes(name)) {
        categories["React ecosystem"].push(dep);
      }
      // UI frameworks
      else if (
        [
          "tailwindcss",
          "styled-components",
          "@emotion/react",
          "@emotion/styled",
        ].includes(name)
      ) {
        categories["UI frameworks"].push(dep);
      }
      // Build tools
      else if (
        [
          "vite",
          "next",
          "webpack",
          "parcel",
          "rollup",
          "@vitejs/plugin-react",
        ].includes(name)
      ) {
        categories["Build tools"].push(dep);
      }
      // Dev tools
      else if (
        ["eslint", "prettier", "typescript", "@types/node"].includes(name) ||
        name.startsWith("eslint-") ||
        name.startsWith("@typescript-eslint/")
      ) {
        categories["Dev tools"].push(dep);
      }
      // Routing
      else if (["react-router-dom", "@reach/router", "next/router"].includes(name)) {
        categories["Routing"].push(dep);
      }
      // State management
      else if (
        ["@reduxjs/toolkit", "react-redux", "zustand", "jotai", "valtio"].includes(name)
      ) {
        categories["State management"].push(dep);
      }
      // Testing
      else if (
        [
          "vitest",
          "jest",
          "@testing-library/react",
          "@testing-library/jest-dom",
          "cypress",
        ].includes(name)
      ) {
        categories["Testing"].push(dep);
      }
      // Others
      else {
        categories["Others"].push(dep);
      }
    }

    // Categorize all dependencies
    Object.entries(dependencies).forEach(([name, version]) => {
      categorize(name, version, false);
    });

    Object.entries(devDependencies).forEach(([name, version]) => {
      categorize(name, version, true);
    });

    // Remove empty categories
    Object.keys(categories).forEach((key) => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  } catch (error) {
    return { error: `Failed to categorize dependencies: ${error.message}` };
  }
}

/**
 * Get project structure for display
 * @param {string} framework - Framework name
 * @returns {Array} - Project structure items
 */
export function getProjectStructure(framework, typescript = false) {
  const baseStructure = [
    { label: "src/", description: "Source code directory" },
    { label: "public/", description: "Static assets" },
    { label: "package.json", description: "Project configuration" },
    { label: "README.md", description: "Project documentation" },
  ];

  const componentExt = getComponentExtension({ typescript });
  const configExt = getConfigExtension({ typescript });

  const frameworkStructure = {
    vite: [
      { label: "index.html", description: "Entry HTML file" },
      { label: `src/main.${componentExt}`, description: "Application entry point" },
      { label: `src/App.${componentExt}`, description: "Main component" },
      { label: `vite.config.${configExt}`, description: "Vite configuration" },
    ],
    nextjs: [
      { label: "next.config.js", description: "Next.js configuration" },
      { label: "app/", description: "App router directory" },
      { label: "pages/", description: "Pages router directory" },
    ],
  };

  return [...baseStructure, ...(frameworkStructure[framework] || [])];
}

/**
 * Get configuration files based on framework and options
 * @param {string} framework - Framework name
 * @param {boolean} typescript - Whether TypeScript is enabled
 * @param {string} styling - Styling solution
 * @param {boolean} linting - Whether linting is enabled
 * @param {string} stateManagement - State management solution
 * @returns {Array} - Configuration file items
 */
export function getConfigurationFiles(
  framework,
  typescript,
  styling,
  linting,
  stateManagement,
  testing,
) {
  const configs = [];

  // Framework configuration
  if (framework === "vite") {
    configs.push({
      label: `vite.config.${getConfigExtension({ typescript })}`,
      description: "React plugin, aliases, build options",
    });
  } else if (framework === "nextjs") {
    configs.push({
      label: "next.config.js",
      description: "Next.js configuration",
    });
  }

  // TypeScript configuration
  if (typescript) {
    configs.push({
      label: "tsconfig.json",
      description: "TypeScript configuration",
    });
  }

  // Styling configuration
  if (styling === "tailwind") {
    configs.push({
      label: "tailwind.config.js",
      description: "Tailwind CSS configuration",
    });
    configs.push({
      label: "postcss.config.js",
      description: "PostCSS configuration",
    });
  }

  // Linting configuration
  if (linting) {
    configs.push({
      label: ".eslintrc.json",
      description: "ESLint rules and configuration",
    });
    if (typescript) {
      configs.push({
        label: ".eslintrc.json",
        description: "TypeScript-specific ESLint rules",
      });
    }

    // Prettier configuration
    configs.push({
      label: ".prettierrc",
      description: "Prettier formatting configuration",
    });
  }

  // State management
  if (stateManagement === "redux") {
    configs.push({
      label: "src/store/",
      description: "Redux store configuration",
    });
  } else if (stateManagement === "zustand") {
    configs.push({
      label: "src/stores/",
      description: "Zustand store files",
    });
  }

  // Testing configuration
  if (testing && testing !== "none") {
    if (testing === "vitest") {
      configs.push({
        label: `vitest.config.${getConfigExtension({ typescript })}`,
        description: "Vitest testing configuration",
      });
    } else if (testing === "jest") {
      configs.push({
        label: "jest.config.js",
        description: "Jest testing configuration",
      });
    }
    configs.push({
      label: `src/test/setup.${typescript ? "ts" : "js"}`,
      description: "Testing environment setup",
    });
  }

  return configs;
}

/**
 * Analyze project for completion summary
 * @param {string} projectPath - Project directory path
 * @param {Object} userChoices - User configuration choices
 * @returns {Object} - Project analysis results
 */
export function analyzeProject(projectPath, userChoices) {
  const analysis = {
    framework: userChoices.framework,
    typescript: userChoices.typescript,
    styling: userChoices.styling,
    routing: userChoices.routing,
    stateManagement: userChoices.stateManagement,
    linting: userChoices.linting,
    git: userChoices.initGit,
    editor: userChoices.openEditor ? userChoices.editor : null,
  };

  try {
    // Get package.json info
    const packageJsonPath = path.join(projectPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageData = fs.readJsonSync(packageJsonPath);
      analysis.projectName = packageData.name;
      analysis.dependencies = categorizeDependencies(packageJsonPath);
    }

    // Check for specific files
    analysis.files = {
      hasTypeScript: fs.existsSync(path.join(projectPath, "tsconfig.json")),
      hasTailwind: fs.existsSync(path.join(projectPath, "tailwind.config.js")),
      hasESLint: fs.existsSync(path.join(projectPath, ".eslintrc.js")),
      hasGit: fs.existsSync(path.join(projectPath, ".git")),
    };
  } catch (error) {
    analysis.error = `Failed to analyze project: ${error.message}`;
  }

  return analysis;
}

/**
 * Get framework-specific information
 * @param {string} framework - Framework name
 * @returns {Object} - Framework info
 */
export function getFrameworkInfo(framework) {
  const frameworkData = {
    vite: {
      name: "Vite",
      description: "Fast dev server, optimized builds",
      port: 5173,
      devCommand: "dev",
      buildCommand: "build",
      docs: "https://vitejs.dev/",
    },
    nextjs: {
      name: "Next.js",
      description: "SSR, full-stack framework",
      port: 3000,
      devCommand: "dev",
      buildCommand: "build",
      docs: "https://nextjs.org/docs",
    },
  };

  return (
    frameworkData[framework] || {
      name: framework,
      description: "Unknown framework",
      port: 3000,
      devCommand: "dev",
      buildCommand: "build",
    }
  );
}

/**
 * Get styling solution information
 * @param {string} styling - Styling solution name
 * @returns {Object} - Styling info
 */
export function getStylingInfo(styling) {
  const stylingData = {
    css: {
      name: "CSS",
      description: "Plain CSS files",
    },
    tailwind: {
      name: "Tailwind CSS",
      description: "Utility-first CSS framework",
      docs: "https://tailwindcss.com/docs",
    },
    "styled-components": {
      name: "Styled Components",
      description: "CSS-in-JS styling",
      docs: "https://styled-components.com/docs",
    },
  };

  return (
    stylingData[styling] || {
      name: styling,
      description: "Custom styling solution",
    }
  );
}

/**
 * Get state management information
 * @param {string} stateManagement - State management solution name
 * @returns {Object} - State management info
 */
export function getStateManagementInfo(stateManagement) {
  const stateData = {
    none: {
      name: "React State",
      description: "Built-in React state management",
    },
    redux: {
      name: "Redux Toolkit",
      description: "Predictable state container",
      docs: "https://redux-toolkit.js.org/",
    },
    zustand: {
      name: "Zustand",
      description: "Small, fast state management",
      docs: "https://zustand-demo.pmnd.rs/",
    },
  };

  return (
    stateData[stateManagement] || {
      name: stateManagement,
      description: "Custom state management solution",
    }
  );
}
