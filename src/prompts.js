import { PromptFlow } from "./prompts/PromptFlow.js";
import {
  detectPackageManagers,
  getDefaultPackageManager,
} from "./utils/package-manager-detection.js";

export async function promptUser(options = {}) {
  const { verbose = false } = options;

  // Detect available package managers
  const packageManagers = await detectPackageManagers({ verbose });
  const defaultPackageManager = getDefaultPackageManager(packageManagers);

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
