/**
 * File extension utilities for handling TypeScript/JavaScript variations
 * Eliminates duplication of userChoices.typescript ? "ts" : "js" patterns
 */

/**
 * Get appropriate file extension based on user choices and file type
 * @param {Object} userChoices - User configuration options
 * @param {string} type - Type of file ('script', 'component', 'config')
 * @returns {string} Appropriate file extension
 */
export function getFileExtension(userChoices, type = "script") {
  const isTypeScript = userChoices.typescript;

  switch (type) {
    case "component":
      return isTypeScript ? "tsx" : "jsx";
    case "script":
    case "config":
    case "api":
      return isTypeScript ? "ts" : "js";
    default:
      // Default to script extension for unknown types
      return isTypeScript ? "ts" : "js";
  }
}

/**
 * Get script file extension (.ts or .js)
 * @param {Object} userChoices - User configuration options
 * @returns {string} Script file extension
 */
export function getScriptExtension(userChoices) {
  return getFileExtension(userChoices, "script");
}

/**
 * Get component file extension (.tsx or .jsx)
 * @param {Object} userChoices - User configuration options
 * @returns {string} Component file extension
 */
export function getComponentExtension(userChoices) {
  return getFileExtension(userChoices, "component");
}

/**
 * Get config file extension (.ts or .js)
 * @param {Object} userChoices - User configuration options
 * @returns {string} Config file extension
 */
export function getConfigExtension(userChoices) {
  return getFileExtension(userChoices, "config");
}

/**
 * Get API route file extension (.ts or .js)
 * @param {Object} userChoices - User configuration options
 * @returns {string} API route file extension
 */
export function getApiExtension(userChoices) {
  return getFileExtension(userChoices, "api");
}

/**
 * Get extensions object with both script and component extensions
 * Useful when you need both types in the same function
 * @param {Object} userChoices - User configuration options
 * @returns {Object} Object with script and component extensions
 */
export function getExtensions(userChoices) {
  return {
    script: getScriptExtension(userChoices),
    component: getComponentExtension(userChoices),
    config: getConfigExtension(userChoices),
    api: getApiExtension(userChoices),
  };
}
