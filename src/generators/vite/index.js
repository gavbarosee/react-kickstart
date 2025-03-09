import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import {
  createPackageJson,
  createHtmlFile,
  createViteConfig,
  setupLinting,
} from "./config.js";
import { createSourceFiles } from "./components.js";
import { setupStyling } from "./styling.js";
import { setupTypeScript } from "./typescript.js";

export default async function generateViteProject(
  projectPath,
  projectName,
  userChoices
) {
  log("Creating a Vite React project...");

  createDirectoryStructure(projectPath); // src, public etc
  createPackageJson(projectPath, projectName, userChoices); // with dev deps based on user choices
  createHtmlFile(projectPath, projectName, userChoices);
  createViteConfig(projectPath, userChoices); // basic vite config
  createSourceFiles(projectPath, userChoices); // App + entry point file

  // styled-components doesn't require setting up i.e config files etc hence those 2 here
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
