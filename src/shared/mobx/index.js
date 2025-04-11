import { setupMobxStore } from "./standard.js";
import { setupNextjsMobxStore } from "./nextjs.js";

/**
 * Sets up MobX based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupMobx(projectPath, userChoices, framework) {
  if (userChoices.stateManagement !== "mobx") return;

  if (framework === "nextjs") {
    setupNextjsMobxStore(projectPath, userChoices);
  } else {
    setupMobxStore(projectPath, userChoices);
  }
}
