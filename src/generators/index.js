import ora from "ora";
import { log } from "../utils/logger.js";
import generateViteProject from "./vite/index.js";
import generateNextjsProject from "./nextjs.js";
import generateRsbuildProject from "./rsbuild/index.js";
import generateParcelProject from "./parcel/index.js";

export default async function generateProject(
  projectPath,
  projectName,
  userChoices
) {
  const spinner = ora("Generating project files...").start();
  try {
    log(`Creating a ${userChoices.framework} project...`);
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
    spinner.succeed("Project files generated successfully!");
    return true;
  } catch (error) {
    spinner.fail(`Failed to generate project files: ${error.message}`);
    throw error;
  }
}
