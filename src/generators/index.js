import ora from "ora";
import { frameworkLog, stylingLog } from "../utils/logger.js";
import {
  stepSection,
  fileGenerationInfo,
  getProjectStructure,
  getConfigurationFiles,
} from "../utils/enhanced-logger.js";
import generateViteProject from "./vite/index.js";
import generateNextjsProject from "./nextjs/index.js";

export default async function generateProject(
  projectPath,
  projectName,
  userChoices
) {
  const spinner = ora({
    text: "Generating project files...",
    color: "yellow",
    spinner: "dots",
  }).start();

  try {
    frameworkLog(`Creating a ${userChoices.framework} project...`);

    // project structure information
    spinner.stop();
    console.log();

    // directory structure information
    stepSection(
      "📋",
      "Creating project structure:",
      getProjectStructure(userChoices.framework)
    );

    // display configuration files information
    stepSection(
      "🛠️",
      "Setting up configuration:",
      getConfigurationFiles(
        userChoices.framework,
        userChoices.typescript,
        userChoices.styling,
        userChoices.linting,
        userChoices.stateManagement
      )
    );

    spinner.text = "Processing...";
    spinner.start();

    switch (userChoices.framework) {
      case "vite":
        await generateViteProject(projectPath, projectName, userChoices);
        break;
      case "nextjs":
        await generateNextjsProject(projectPath, projectName, userChoices);
        break;
      default:
        throw new Error(`Unsupported framework: ${userChoices.framework}`);
    }
    if (userChoices.styling) {
      stylingLog(`Configured with ${userChoices.styling} styling`);
    }

    spinner.stop();
    fileGenerationInfo(projectPath);

    console.log(
      `  ✅ Project files successfully generated [${userChoices.framework}]`
    );
    console.log();
    return true;
  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail(`Failed to generate project files: ${error.message}`);
    }
    throw error;
  }
}
