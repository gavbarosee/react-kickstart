import path from "path";
import validateProjectName from "validate-npm-package-name";

/**
 * Validation utilities - input validation and verification functions
 */

/**
 * Validate project name using npm package name rules
 * @param {string} projectName - Project name to validate
 * @returns {Object} - Validation result with errors/warnings
 */
export function validateProjectNameInput(projectName) {
  const result = validateProjectName(projectName);

  return {
    valid: result.validForNewPackages,
    errors: result.errors || [],
    warnings: result.warnings || [],
    name: projectName,
  };
}

/**
 * Validate directory path
 * @param {string} dirPath - Directory path to validate
 * @returns {Object} - Validation result
 */
export function validateDirectoryPath(dirPath) {
  if (!dirPath) {
    return { valid: false, error: "Directory path is required" };
  }

  if (typeof dirPath !== "string") {
    return { valid: false, error: "Directory path must be a string" };
  }

  if (dirPath.length === 0) {
    return { valid: false, error: "Directory path cannot be empty" };
  }

  // Check for dangerous paths
  const dangerousPaths = ["/", "/usr", "/bin", "/etc", "/var", "/opt"];
  if (dangerousPaths.includes(dirPath)) {
    return { valid: false, error: "Cannot use system directory" };
  }

  return { valid: true };
}

/**
 * Validate and sanitize project directory name for security
 * @param {string} projectDir - Project directory name to validate
 * @returns {Object} - Validation result with sanitized name
 */
export function validateProjectDirectory(projectDir) {
  if (!projectDir) {
    return { valid: true, sanitized: null }; // Allow null/undefined for current directory
  }

  if (typeof projectDir !== "string") {
    return { valid: false, error: "Project directory must be a string" };
  }

  // Normalize Unicode to prevent Unicode normalization attacks
  const normalized = projectDir.normalize("NFC");

  // Check for null bytes
  if (normalized.includes("\0")) {
    return {
      valid: false,
      error: "Project directory cannot contain null bytes",
    };
  }

  // Check for path traversal attempts
  if (
    normalized.includes("..") ||
    normalized.includes("./") ||
    normalized.includes(".\\")
  ) {
    return {
      valid: false,
      error: "Project directory cannot contain path traversal sequences (../, .\\)",
    };
  }

  // Check for absolute paths
  if (path.isAbsolute(normalized)) {
    return { valid: false, error: "Project directory must be a relative path" };
  }

  // Check for dangerous characters
  const dangerousChars = /[<>:"|?*\x00-\x1f]/;
  if (dangerousChars.test(normalized)) {
    return {
      valid: false,
      error: "Project directory contains invalid characters",
    };
  }

  // Check for reserved names on Windows
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];
  const upperName = normalized.toUpperCase();
  if (
    reservedNames.includes(upperName) ||
    reservedNames.some((name) => upperName.startsWith(name + "."))
  ) {
    return {
      valid: false,
      error: "Project directory cannot use reserved system names",
    };
  }

  // Check length (reasonable limit)
  if (normalized.length > 255) {
    return {
      valid: false,
      error: "Project directory name is too long (max 255 characters)",
    };
  }

  // Don't allow names starting/ending with spaces or dots
  if (
    normalized.startsWith(" ") ||
    normalized.endsWith(" ") ||
    normalized.startsWith(".") ||
    normalized.endsWith(".")
  ) {
    return {
      valid: false,
      error: "Project directory cannot start or end with spaces or dots",
    };
  }

  return { valid: true, sanitized: normalized };
}

/**
 * Validate user choices object
 * @param {Object} userChoices - User configuration choices
 * @returns {Object} - Validation result
 */
export function validateUserChoices(userChoices) {
  const errors = [];
  const warnings = [];

  if (!userChoices || typeof userChoices !== "object") {
    errors.push("User choices must be an object");
    return { valid: false, errors, warnings };
  }

  // Validate framework
  const validFrameworks = ["vite", "nextjs"];
  if (!validFrameworks.includes(userChoices.framework)) {
    errors.push(
      `Invalid framework: ${
        userChoices.framework
      }. Must be one of: ${validFrameworks.join(", ")}`,
    );
  }

  // Validate package manager
  const validPackageManagers = ["npm", "yarn"];
  if (!validPackageManagers.includes(userChoices.packageManager)) {
    errors.push(
      `Invalid package manager: ${
        userChoices.packageManager
      }. Must be one of: ${validPackageManagers.join(", ")}`,
    );
  }

  // Validate styling
  const validStyling = ["css", "tailwind", "styled-components"];
  if (!validStyling.includes(userChoices.styling)) {
    errors.push(
      `Invalid styling option: ${
        userChoices.styling
      }. Must be one of: ${validStyling.join(", ")}`,
    );
  }

  // Validate routing (only applies to frameworks that show the routing step)
  const validRouting = ["none", "react-router"];
  if (userChoices.routing && !validRouting.includes(userChoices.routing)) {
    errors.push(
      `Invalid routing option: ${
        userChoices.routing
      }. Must be one of: ${validRouting.join(", ")}`,
    );
  }

  // Validate editor
  const validEditors = ["vscode", "cursor"];
  if (userChoices.openEditor && !validEditors.includes(userChoices.editor)) {
    warnings.push(
      `Unknown editor: ${
        userChoices.editor
      }. Supported editors: ${validEditors.join(", ")}`,
    );
  }

  // Note: No need to check for Next.js + routing conflicts since the routing step
  // uses shouldShow() to prevent Next.js users from selecting routing options

  // Add comprehensive conflict validation
  const conflictWarnings = validateChoiceCombinations(userChoices);
  warnings.push(...conflictWarnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate choice combinations and return warnings for potentially conflicting options
 * @param {Object} userChoices - User configuration choices
 * @returns {Array<string>} - Array of warning messages
 */
export function validateChoiceCombinations(userChoices) {
  const warnings = [];

  // 1. Styling conflicts: Tailwind + styled-components
  if (userChoices.styling === "styled-components") {
    warnings.push(
      "⚠️  Using styled-components with component-scoped styles. Consider if you need global styling as well.",
    );
  }

  // 2. API + State Management redundancy warnings
  if (userChoices.api && userChoices.api.includes("react-query")) {
    if (userChoices.stateManagement === "redux") {
      warnings.push(
        "⚠️  React Query + Redux detected. React Query handles server state very well - you might not need Redux for server data. Consider using Redux only for client-side state.",
      );
    }
    if (userChoices.stateManagement === "zustand") {
      warnings.push(
        "⚠️  React Query + Zustand detected. React Query handles server state - consider using Zustand primarily for client-side application state.",
      );
    }
  }

  // 3. Testing framework + framework optimization warnings
  if (userChoices.testing === "jest" && userChoices.framework === "vite") {
    warnings.push(
      "⚠️  Using Jest with Vite. Vitest is optimized for Vite and provides better performance and zero-config setup.",
    );
  }
  if (userChoices.testing === "vitest" && userChoices.framework === "nextjs") {
    warnings.push(
      "⚠️  Using Vitest with Next.js. Jest is better integrated with Next.js and has built-in optimizations.",
    );
  }

  // 4. TypeScript + linting combination advice
  if (userChoices.typescript && !userChoices.linting) {
    warnings.push(
      "⚠️  TypeScript without ESLint detected. ESLint with TypeScript rules helps catch additional issues beyond type checking.",
    );
  }

  // 5. Framework-specific styling considerations
  if (
    userChoices.framework === "nextjs" &&
    userChoices.styling === "styled-components"
  ) {
    // This is actually handled well by Next.js, so just informational
    warnings.push(
      "ℹ️  Next.js + styled-components: SSR support is automatically configured.",
    );
  }

  // 6. Complex setup warning
  const complexFeatures = [
    userChoices.typescript,
    userChoices.linting,
    userChoices.stateManagement && userChoices.stateManagement !== "none",
    userChoices.api && userChoices.api !== "none",
    userChoices.testing && userChoices.testing !== "none",
    userChoices.styling !== "css",
  ].filter(Boolean).length;

  if (complexFeatures >= 5) {
    warnings.push(
      "ℹ️  You've selected many advanced features. This creates a powerful setup but may increase complexity for beginners.",
    );
  }

  // 7. Minimal setup suggestion
  if (complexFeatures <= 2 && !userChoices.typescript) {
    warnings.push(
      "ℹ️  Simple setup detected. Consider adding TypeScript and ESLint for better development experience.",
    );
  }

  return warnings;
}

/**
 * Validate editor choice
 * @param {string} editor - Editor name
 * @returns {boolean} - Whether editor is supported
 */
export function isValidEditor(editor) {
  const validEditors = ["vscode", "cursor"];
  return validEditors.includes(editor);
}

/**
 * Validate framework choice
 * @param {string} framework - Framework name
 * @returns {boolean} - Whether framework is supported
 */
export function isValidFramework(framework) {
  const validFrameworks = ["vite", "nextjs"];
  return validFrameworks.includes(framework);
}

/**
 * Validate package manager choice
 * @param {string} packageManager - Package manager name
 * @returns {boolean} - Whether package manager is supported
 */
export function isValidPackageManager(packageManager) {
  const validPackageManagers = ["npm", "yarn"];
  return validPackageManagers.includes(packageManager);
}

/**
 * Get validation error message for project name
 * @param {Object} validationResult - Result from validateProjectNameInput
 * @returns {string} - Formatted error message
 */
export function getProjectNameErrorMessage(validationResult) {
  if (validationResult.valid) {
    return "";
  }

  const allIssues = [...validationResult.errors, ...validationResult.warnings];

  return `Invalid project name: ${validationResult.name}\n${allIssues
    .map((msg) => `  - ${msg}`)
    .join("\n")}`;
}
