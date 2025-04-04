import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import { createPackageJson, createParcelConfig } from "./config.js";

import {
  createSourceFiles,
  createDirectoryStructure,
  createHtmlFile,
} from "../../shared/file-generation.js";
import { setupStyling } from "../../shared/styling.js";
import { setupLinting } from "../../shared/linting.js";
import { setupTypeScript } from "../../shared/typescript.js";
import { setupRedux } from "../../shared/redux/index.js";

export default async function generateParcelProject(
  projectPath,
  projectName,
  userChoices
) {
  log("Creating a Parcel React project...");

  createDirectoryStructure(projectPath, "parcel");

  createPackageJson(projectPath, projectName, userChoices);

  createParcelConfig(projectPath, userChoices);

  createHtmlFile(projectPath, projectName, userChoices, "parcel");

  createSourceFiles(projectPath, userChoices, "parcel");

  if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
    setupStyling(projectPath, userChoices, "parcel");
  }

  if (userChoices.linting) {
    setupLinting(projectPath, userChoices, "parcel");
  }

  if (userChoices.typescript) {
    setupTypeScript(projectPath, userChoices, "parcel");
  }

  if (userChoices.stateManagement === "redux") {
    setupRedux(projectPath, userChoices, "parcel");
  }

  ensureParcelSpecificFiles(projectPath, userChoices);

  return true;
}

function ensureParcelSpecificFiles(projectPath, userChoices) {
  const srcDir = path.join(projectPath, "src");

  if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
    const stylesPath = path.join(srcDir, "styles.css");

    if (!fs.existsSync(stylesPath)) {
      const cssContent =
        userChoices.styling === "tailwind"
          ? "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
          : "body { margin: 0; font-family: sans-serif; }\n";

      fs.writeFileSync(stylesPath, cssContent);
    }
  }

  ensureParcelSourceField(projectPath);
}

function ensureParcelSourceField(projectPath) {
  try {
    const packageJsonPath = path.join(projectPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) return;

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    if (!packageJson.source) {
      packageJson.source = "src/index.html";
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  } catch (error) {
    console.error("Error updating Parcel package.json:", error);
  }
}
