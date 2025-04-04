import { setupReduxToolkit } from "./standard.js";
import { setupNextjsReduxToolkit } from "./nextjs.js";

/**
 * Sets up Redux Toolkit based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupRedux(projectPath, userChoices, framework) {
  if (userChoices.stateManagement !== "redux") return;

  if (framework === "nextjs") {
    setupNextjsReduxToolkit(projectPath, userChoices);
  } else {
    setupReduxToolkit(projectPath, userChoices);
  }
}
