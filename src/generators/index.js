import ora from "ora";

import { createErrorHandler, ERROR_TYPES } from "../errors/index.js";
import { NextjsGenerator } from "../frameworks/nextjs/nextjs-generator.js";
import { ViteGenerator } from "../frameworks/vite/vite-generator.js";
import { CORE_UTILS, UI_UTILS } from "../utils/index.js";

export default async function generateProject(projectPath, projectName, userChoices) {
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
      UI_UTILS.frameworkLog(`Creating a ${userChoices.framework} project...`);

      // project structure information
      spinner.stop();
      console.log();

      // directory structure information
      UI_UTILS.stepSection(
        "📋",
        "Creating project structure:",
        CORE_UTILS.getProjectStructure(userChoices.framework),
      );

      // display configuration files information
      UI_UTILS.stepSection(
        "🛠️",
        "Setting up configuration:",
        CORE_UTILS.getConfigurationFiles(
          userChoices.framework,
          userChoices.typescript,
          userChoices.styling,
          userChoices.linting,
          userChoices.stateManagement,
          userChoices.testing,
        ),
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
        UI_UTILS.stylingLog(`Configured with ${userChoices.styling} styling`);
      }

      spinner.stop();
      CORE_UTILS.fileGenerationInfo(projectPath);

      console.log(
        `  ✅ Project files successfully generated [${userChoices.framework}]`,
      );
      console.log();
      return true;
    },
    {
      type: ERROR_TYPES.FILESYSTEM,
      shouldCleanup: true,
      verbose: true,
    },
  );
}
