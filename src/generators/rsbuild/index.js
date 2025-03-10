import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import {
  createPackageJson,
  createHtmlFile,
  createRsbuildConfig,
  setupLinting,
} from "./config.js";
import { createSourceFiles } from "./components.js";
import { setupStyling } from "./styling.js";
import { setupTypeScript } from "./typescript.js";

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

function createDirectoryStructure(projectPath) {
  const srcDir = path.join(projectPath, "src");
  fs.ensureDirSync(srcDir);
  fs.ensureDirSync(path.join(projectPath, "public"));
}
