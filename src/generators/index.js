import ora from "ora";

import { createErrorHandler, ERROR_TYPES } from "../errors/index.js";
import { NextjsGenerator } from "../frameworks/nextjs/nextjs-generator.js";
import { ViteGenerator } from "../frameworks/vite/vite-generator.js";
import { CORE_UTILS } from "../utils/index.js";

export default async function generateProject(projectPath, projectName, userChoices) {
  const errorHandler = createErrorHandler();
  errorHandler.setContext({
    projectPath,
    projectName,
    framework: userChoices.framework,
  });

  const spinner = ora({ text: "", color: "yellow", spinner: "dots" }).start();

  return errorHandler.withErrorHandling(
    async () => {
      // Minimal mode: no structural/config details, just do the work
      spinner.stop();

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
      spinner.stop();
      return true;
    },
    {
      type: ERROR_TYPES.FILESYSTEM,
      shouldCleanup: true,
      verbose: true,
    },
  );
}
