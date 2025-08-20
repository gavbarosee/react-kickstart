import { ReduxSetup } from "./ReduxSetup.js";
import { ZustandSetup } from "./ZustandSetup.js";

/**
 * Factory functions for creating state management setup instances
 */
export function createReduxSetup(framework) {
  return new ReduxSetup(framework);
}

export function createZustandSetup(framework) {
  return new ZustandSetup(framework);
}

/**
 * Main setup function that delegates to appropriate implementation
 */
export function setupStateManagement(projectPath, userChoices, framework) {
  if (userChoices.stateManagement === "redux") {
    const reduxSetup = createReduxSetup(framework);
    reduxSetup.setup(projectPath, userChoices);
  } else if (userChoices.stateManagement === "zustand") {
    const zustandSetup = createZustandSetup(framework);
    zustandSetup.setup(projectPath, userChoices);
  }
}

// Export the classes for direct use if needed
export { ReduxSetup, ZustandSetup };
export { BaseStateSetup } from "./BaseStateSetup.js";
