import fs from "fs-extra";
import path from "path";

/**
 * Sets up ESLint and Prettier configuration for a React project
 *
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used (vite, nextjs, rsbuild, parcel)
 * @returns {void}
 */
export function setupLinting(projectPath, userChoices, framework = "vite") {
  if (!userChoices.linting) return;

  // Base ESLint configuration
  const eslintConfig = {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:prettier/recommended",
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: ["react", "prettier"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": ["error", { singleQuote: true }],
    },
  };

  // Add Next.js specific configuration
  if (framework === "nextjs") {
    eslintConfig.extends.unshift("next/core-web-vitals");
  }

  // Add TypeScript configuration if needed
  if (userChoices.typescript) {
    eslintConfig.extends.push("plugin:@typescript-eslint/recommended");
    eslintConfig.parser = "@typescript-eslint/parser";
    eslintConfig.plugins.push("@typescript-eslint");
  }

  // Write ESLint configuration
  fs.writeFileSync(
    path.join(projectPath, ".eslintrc.json"),
    JSON.stringify(eslintConfig, null, 2)
  );

  // Standard Prettier configuration
  const prettierConfig = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: "es5",
  };

  // Write Prettier configuration
  fs.writeFileSync(
    path.join(projectPath, ".prettierrc"),
    JSON.stringify(prettierConfig, null, 2)
  );

  // For Next.js, update package.json with additional devDependencies
  if (framework === "nextjs") {
    updateNextjsPackageJson(projectPath, userChoices);
  }
}

/**
 * Updates package.json with Next.js specific ESLint dependencies
 */
function updateNextjsPackageJson(projectPath, userChoices) {
  try {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Add ESLint related dev dependencies
    packageJson.devDependencies = {
      ...(packageJson.devDependencies || {}),
      "eslint-config-prettier": "^9.0.0",
      "eslint-plugin-prettier": "^5.0.1",
      prettier: "^3.1.0",
    };

    // Add TypeScript ESLint dependencies if needed
    if (userChoices.typescript) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "@typescript-eslint/eslint-plugin": "^6.13.1",
        "@typescript-eslint/parser": "^6.13.1",
      };
    }

    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.error("Error updating Next.js package.json:", error);
  }
}
