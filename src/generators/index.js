import ora from "ora";
import { frameworkLog, stylingLog } from "../utils/logger.js";
import {
  stepSection,
  fileGenerationInfo,
  getProjectStructure,
  getConfigurationFiles,
} from "../utils/enhanced-logger.js";
import { ViteGenerator } from "./ViteGenerator.js";
import { NextjsGenerator } from "./NextjsGenerator.js";
import { createErrorHandler, ERROR_TYPES } from "../errors/index.js";

export default async function generateProject(
  projectPath,
  projectName,
  userChoices
) {
  const errorHandler = createErrorHandler();
  errorHandler.setContext({
    projectPath,
    projectName,
    framework: userChoices.framework,
  });

  const spinner = ora({
    text: "Generating project files...",
    color: "yellow",
    spinner: "dots",
  }).start();

  return errorHandler.withErrorHandling(
    async () => {
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

      // Create appropriate generator instance and run it
      let generator;
      switch (userChoices.framework) {
        case "vite":
          generator = new ViteGenerator();
          break;
        case "nextjs":
          generator = new NextjsGenerator();
          break;
        default:
          throw new Error(`Unsupported framework: ${userChoices.framework}`);
      }

      await generator.generate(projectPath, projectName, userChoices);
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
    },
    {
      type: ERROR_TYPES.FILESYSTEM,
      shouldCleanup: true,
      verbose: true,
    }
  );
}
