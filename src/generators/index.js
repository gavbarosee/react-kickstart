import ora from "ora";
import { log, frameworkLog, stylingLog } from "../utils/logger.js";
import generateViteProject from "./vite/index.js";
import generateNextjsProject from "./nextjs/index.js";
import generateRsbuildProject from "./rsbuild/index.js";
import generateParcelProject from "./parcel/index.js";

export default async function generateProject(
  projectPath,
  projectName,
  userChoices
) {
  // const spinner = ora("Generating project files...").start();
  const spinner = ora({
    text: "Generating project files...",
    color: "yellow",
    spinner: "dots",
  }).start();

  try {
    frameworkLog(`Creating a ${userChoices.framework} project...`);
    switch (userChoices.framework) {
      case "vite":
        await generateViteProject(projectPath, projectName, userChoices);
        break;
      case "nextjs":
        await generateNextjsProject(projectPath, projectName, userChoices);
        break;
      case "rsbuild":
        await generateRsbuildProject(projectPath, projectName, userChoices);
        break;
      case "parcel":
        await generateParcelProject(projectPath, projectName, userChoices);
        break;
      default:
        throw new Error(`Unsupported framework: ${userChoices.framework}`);
    }
    if (userChoices.styling) {
      stylingLog(`Configured with ${userChoices.styling} styling`);
    }

    spinner.succeed("Project files generated successfully!");
    return true;
  } catch (error) {
    spinner.fail(`Failed to generate project files: ${error.message}`);
    throw error;
  }
}
