import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import { createPackageJson, createViteConfig } from "./config.js";
import { setupRedux } from "../../shared/redux/index.js";
import { setupZustand } from "../../shared/zustand/index.js";

import {
  createSourceFiles,
  createDirectoryStructure,
  createHtmlFile,
} from "../../shared/file-generation.js";
import { setupStyling } from "../../shared/styling.js";
import { setupLinting } from "../../shared/linting.js";
import { setupTypeScript } from "../../shared/typescript.js";

import { setupRouting } from "../../shared/routing/index.js";

export default async function generateViteProject(
  projectPath,
  projectName,
  userChoices
) {
  log("Creating a Vite React project...");

  createDirectoryStructure(projectPath, "vite");

  createPackageJson(projectPath, projectName, userChoices);

  createHtmlFile(projectPath, projectName, userChoices, "vite");

  createViteConfig(projectPath, userChoices);

  createSourceFiles(projectPath, userChoices, "vite");

  if (userChoices.routing && userChoices.routing !== "none") {
    setupRouting(projectPath, userChoices, "vite");
  }

  if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
    setupStyling(projectPath, userChoices, "vite");
  }

  if (userChoices.linting) {
    setupLinting(projectPath, userChoices, "vite");
  }

  if (userChoices.typescript) {
    setupTypeScript(projectPath, userChoices, "vite");
  }

  if (userChoices.stateManagement === "redux") {
    setupRedux(projectPath, userChoices, "vite");
  }
  if (userChoices.stateManagement === "zustand") {
    setupZustand(projectPath, userChoices, "vite");
  }

  ensureViteSpecificFiles(projectPath, userChoices);

  return true;
}

function ensureViteSpecificFiles(projectPath, userChoices) {
  createViteLogo(projectPath);
}

function createViteLogo(projectPath) {
  const publicDir = path.join(projectPath, "public");
  fs.ensureDirSync(publicDir);

  // Vite logo SVG
  const viteLogo = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <path fill="#646CFF" d="m128 0l126.4 224H1.6L128 0Z"/>
  <path fill="#FFF" d="M193.5 104.4H146L95.3 202.6h111.2l-13-98.2ZM127.9 38l-50.1 88.4h98.8L127.9 38Z"/>
</svg>`;

  fs.writeFileSync(path.join(publicDir, "vite.svg"), viteLogo);
}
