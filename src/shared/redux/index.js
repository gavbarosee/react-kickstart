import { createReduxSetup } from "../state-management/index.js";

/**
 * Sets up Redux Toolkit based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupRedux(projectPath, userChoices, framework) {
  const frameworkType = framework === "nextjs" ? "nextjs" : "standard";
  const reduxSetup = createReduxSetup(frameworkType);
  reduxSetup.setup(projectPath, userChoices);
}
