import { createErrorHandler, ERROR_TYPES } from "../errors/index.js";
import { NextjsGenerator } from "./frameworks/nextjs/nextjs-generator.js";
import { ViteGenerator } from "./frameworks/vite/vite-generator.js";

export default async function generateProject(projectPath, projectName, userChoices) {
  const errorHandler = createErrorHandler();
  errorHandler.setContext({
    projectPath,
    projectName,
    framework: userChoices.framework,
  });

  return errorHandler.withErrorHandling(
    async () => {
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
      return true;
    },
    {
      type: ERROR_TYPES.FILESYSTEM,
      shouldCleanup: true,
      verbose: true,
    },
  );
}
