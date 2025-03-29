// src/generators/nextjs/index.js
import fs from "fs-extra";
import path from "path";
import { log } from "../../utils/logger.js";
import { createPackageJson, createNextConfig } from "./config.js";
import { createAppRouterStructure } from "./app-router.js";
import { createPagesRouterStructure } from "./pages-router.js";

// Import shared modules
import { setupLinting } from "../../shared/linting.js";
import { setupTypeScript } from "../../shared/typescript.js";
import { createDirectoryStructure } from "../../shared/file-generation.js";

export default async function generateNextjsProject(
  projectPath,
  projectName,
  userChoices
) {
  log(
    `Creating a Next.js React project with ${userChoices.nextRouting} router...`
  );

  // Create package.json (Next.js specific)
  createPackageJson(projectPath, projectName, userChoices);

  // Create basic directory structure (using shared module)
  createDirectoryStructure(projectPath, "nextjs");

  // Create router-specific structure (Next.js specific)
  if (userChoices.nextRouting === "app") {
    createAppRouterStructure(projectPath, projectName, userChoices);
  } else {
    createPagesRouterStructure(projectPath, projectName, userChoices);
  }

  // Create Next.js config (Next.js specific)
  createNextConfig(projectPath, userChoices);

  // Setup linting (using shared module)
  if (userChoices.linting) {
    setupLinting(projectPath, userChoices, "nextjs");
  }

  // Setup TypeScript (using shared module)
  if (userChoices.typescript) {
    setupTypeScript(projectPath, userChoices, "nextjs");
  }

  return true;
}
