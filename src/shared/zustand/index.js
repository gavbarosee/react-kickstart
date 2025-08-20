import { createZustandSetup } from "../state-management/index.js";

/**
 * Sets up Zustand based on the framework
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function setupZustand(projectPath, userChoices, framework) {
  const frameworkType = framework === "nextjs" ? "nextjs" : "standard";
  const zustandSetup = createZustandSetup(frameworkType);
  zustandSetup.setup(projectPath, userChoices);
}
