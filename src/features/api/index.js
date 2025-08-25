import { createApiSetup } from "../../integrations/api-clients/index.js";

/**
 * Sets up API configuration based on user choice and framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupApi(projectPath, userChoices, framework) {
  const frameworkType = framework === "nextjs" ? "nextjs" : "standard";
  const apiSetup = createApiSetup(userChoices.api, frameworkType);
  apiSetup.setup(projectPath, userChoices);
}
