import { setupZustandStore } from "./standard.js";
import { setupNextjsZustandStore } from "./nextjs.js";

/**
 * Sets up Zustand based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupZustand(projectPath, userChoices, framework) {
  if (userChoices.stateManagement !== "zustand") return;

  if (framework === "nextjs") {
    setupNextjsZustandStore(projectPath, userChoices);
  } else {
    setupZustandStore(projectPath, userChoices);
  }
}
