import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import {
  createPackageJson,
  createHtmlFile,
  createRsbuildConfig,
} from "./config.js";
import { setupTypeScript } from "../../shared/typescript.js";
import {
  createSourceFiles,
  createDirectoryStructure,
} from "../../shared/file-generation.js";
import { setupStyling } from "../../shared/styling.js";
import { setupLinting } from "../../shared/linting.js";

export default async function generateRsbuildProject(
  projectPath,
  projectName,
  userChoices
) {
  log("Creating an Rsbuild React project...");

  createDirectoryStructure(projectPath);
  createPackageJson(projectPath, projectName, userChoices);
  createHtmlFile(projectPath, projectName);
  createRsbuildConfig(projectPath, userChoices);
  createSourceFiles(projectPath, userChoices);

  if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
    setupStyling(projectPath, userChoices);
  }

  if (userChoices.linting) {
    setupLinting(projectPath, userChoices);
  }

  if (userChoices.typescript) {
    setupTypeScript(projectPath, userChoices);
  }

  return true;
}
