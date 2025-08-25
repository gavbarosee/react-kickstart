// src/shared/file-generation.js
import fs from "fs-extra";
import path from "path";

import { createContentGenerator } from "../../generators/content/index.js";
import { createFileTemplateEngine } from "../../templates/index.js";
import { CORE_UTILS } from "../../utils/index.js";

/**
 * Creates the source files for a React project
 *
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used (vite, nextjs)
 * @returns {void}
 */
export function createSourceFiles(projectPath, userChoices, framework = "vite") {
  const fileExt = CORE_UTILS.getComponentExtension(userChoices);

  // Determine source directory based on framework
  const srcDir =
    framework === "nextjs" && userChoices.nextRouting === "app"
      ? path.join(projectPath, "app")
      : path.join(projectPath, "src");

  // Ensure the directory exists
  CORE_UTILS.ensureDirectory(srcDir);

  // Create entry point file if not using Next.js (which has its own routing)
  if (framework !== "nextjs") {
    createEntryPointFile(srcDir, fileExt, userChoices, framework);
  }

  // Create main component file
  createAppComponent(srcDir, fileExt, userChoices, framework);
}

/**
 * Creates the entry point file (main.jsx/tsx or index.jsx/tsx)
 *
 * @param {string} srcDir - Path to the source directory
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
function createEntryPointFile(srcDir, fileExt, userChoices, framework) {
  // Get the appropriate filename based on framework
  const filename = framework === "vite" ? `main.${fileExt}` : `index.${fileExt}`;

  // Generate content using strategy pattern
  const generator = createContentGenerator(framework);
  const content = generator.generateEntryPoint(fileExt, userChoices);

  // Write the file
  fs.writeFileSync(path.join(srcDir, filename), content);
}

/**
 * Creates the main App component file
 *
 * @param {string} srcDir - Path to the source directory
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
function createAppComponent(srcDir, fileExt, userChoices, framework) {
  // Check if this is a Next.js app router component
  const isNextAppRouter = framework === "nextjs" && userChoices.nextRouting === "app";

  // Get routing type for content generator
  const routingType = isNextAppRouter ? "app" : null;

  // Generate content using strategy pattern
  const generator = createContentGenerator(framework, routingType);
  const content = generator.generateAppComponent(
    fileExt,
    userChoices.styling,
    userChoices,
  );

  // Determine the filename based on the framework
  const filename = isNextAppRouter ? `page.${fileExt}` : `App.${fileExt}`;

  // Write the file
  fs.writeFileSync(path.join(srcDir, filename), content);
}

/**
 * Creates an HTML file for the project (for frameworks that need it)
 *
 * @param {string} projectPath - Path to the project root
 * @param {string} projectName - Name of the project
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export async function createHtmlFile(
  projectPath,
  projectName,
  userChoices,
  framework = "vite",
) {
  // Skip for Next.js since it doesn't need a direct HTML file
  if (framework === "nextjs") return;

  const fileTemplateEngine = createFileTemplateEngine();
  const htmlPath = path.join(projectPath, "index.html");

  const options = {
    framework,
    typescript: userChoices.typescript,
    entryPoint: framework === "vite" ? "main" : "index",
  };

  await fileTemplateEngine.generateHtmlFile(htmlPath, projectName, options);
}

/**
 * Creates the directory structure for a project
 *
 * @param {string} projectPath - Path to the project root
 * @param {string} framework - The framework being used
 * @returns {void}
 */
export function createDirectoryStructure(projectPath, framework = "vite") {
  const options = { framework };
  return CORE_UTILS.createFrameworkDirectories(projectPath, framework, options);
}
