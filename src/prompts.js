import { PromptFlow } from "./prompts/prompt-flow.js";
import { PROCESS_UTILS } from "./utils/index.js";

export async function promptUser(options = {}) {
  const { verbose = false } = options;

  // Detect available package managers
  const packageManagers = await PROCESS_UTILS.detectPackageManagers({
    verbose,
  });
  const defaultPackageManager = PROCESS_UTILS.getDefaultPackageManager(packageManagers);

  // Create and run the prompt flow
  const promptFlow = new PromptFlow(packageManagers, defaultPackageManager);
  const answers = await promptFlow.run();

  return answers;
}

export function getDefaultChoices() {
  return {
    packageManager: "npm",
    framework: "vite",
    typescript: false,
    linting: true,
    styling: "tailwind",
    routing: "none",
    initGit: true,
    openEditor: false,
    editor: "vscode",
    autoStart: true,
  };
}

/**
 * Get framework-specific default choices
 * @param {string} framework - The framework to use (vite, nextjs)
 * @returns {Object} Default choices configured for the specified framework
 */
export function getFrameworkDefaults(framework) {
  const baseDefaults = getDefaultChoices();

  switch (framework) {
    case "nextjs":
      return {
        ...baseDefaults,
        framework: "nextjs",
        nextRouting: "app", // Default to App Router for Next.js
        routing: "nextjs", // Enable Next.js routing
      };
    case "vite":
    default:
      return {
        ...baseDefaults,
        framework: "vite",
      };
  }
}
