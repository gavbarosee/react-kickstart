import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import {
  createPackageJson,
  createHtmlFile,
  createParcelConfig,
} from "./config.js";

import {
  createSourceFiles,
  createDirectoryStructure,
} from "../../shared/file-generation.js";
import { setupStyling } from "../../shared/styling.js";
import { setupLinting } from "../../shared/linting.js";
import { setupTypeScript } from "../../shared/typescript.js";

export default async function generateParcelProject(
  projectPath,
  projectName,
  userChoices
) {
  log("Creating a Parcel React project...");

  createDirectoryStructure(projectPath);
  createPackageJson(projectPath, projectName, userChoices);
  createHtmlFile(projectPath, projectName, userChoices);
  createParcelConfig(projectPath);
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
