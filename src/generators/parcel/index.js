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

export default async function generateParcelProject(
  projectPath,
  projectName,
  userChoices
) {
  log("Creating a Parcel React project...");

  // Create base directory structure using shared module
  createDirectoryStructure(projectPath, "parcel");

  // Create package.json
  createPackageJson(projectPath, projectName, userChoices);

  // Create Parcel config (Parcel-specific)
  createParcelConfig(projectPath, userChoices);

  // Create HTML entry file using shared module
  createHtmlFile(projectPath, projectName, userChoices, "parcel");

  // Create source files using shared module
  createSourceFiles(projectPath, userChoices, "parcel");

  // Generate CSS files and Tailwind config using shared styling module
  if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
    setupStyling(projectPath, userChoices, "parcel");
  }

  // Setup linting using shared module
  if (userChoices.linting) {
    setupLinting(projectPath, userChoices, "parcel");
  }

  // Setup TypeScript using shared module
  if (userChoices.typescript) {
    setupTypeScript(projectPath, userChoices, "parcel");
  }

  // Handle any Parcel-specific files that aren't covered by shared modules
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
