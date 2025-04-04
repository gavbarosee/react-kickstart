import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import { createPackageJson, createRsbuildConfig } from "./config.js";
import { setupRedux } from "../../shared/redux/index.js";

import {
  createSourceFiles,
  createDirectoryStructure,
  createHtmlFile,
} from "../../shared/file-generation.js";
import { setupStyling } from "../../shared/styling.js";
import { setupLinting } from "../../shared/linting.js";
import { setupTypeScript } from "../../shared/typescript.js";

export default async function generateRsbuildProject(
  projectPath,
  projectName,
  userChoices
) {
  log("Creating an Rsbuild React project...");

  createDirectoryStructure(projectPath, "rsbuild");

  createPackageJson(projectPath, projectName, userChoices);

  createHtmlFile(projectPath, projectName, userChoices, "rsbuild");

  createRsbuildConfig(projectPath, userChoices);

  createSourceFiles(projectPath, userChoices, "rsbuild");

  if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
    setupStyling(projectPath, userChoices, "rsbuild");
  }

  if (userChoices.linting) {
    setupLinting(projectPath, userChoices, "rsbuild");
  }

  if (userChoices.typescript) {
    setupTypeScript(projectPath, userChoices, "rsbuild");
  }

  if (userChoices.stateManagement === "redux") {
    setupRedux(projectPath, userChoices, "rsbuild");
  }

  ensureRsbuildSpecificFiles(projectPath, userChoices);

  return true;
}

function ensureRsbuildSpecificFiles(projectPath, userChoices) {
  const srcDir = path.join(projectPath, "src");

  if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
    const indexCssPath = path.join(srcDir, "index.css");

    if (!fs.existsSync(indexCssPath)) {
      const cssContent =
        userChoices.styling === "tailwind"
          ? "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
          : "body { margin: 0; font-family: sans-serif; }\n";

      fs.writeFileSync(indexCssPath, cssContent);
    }
  }

  if (userChoices.styling === "tailwind") {
    const postcssPath = path.join(projectPath, "postcss.config.js");
    const postcssContent = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    fs.writeFileSync(postcssPath, postcssContent);
  }
}
