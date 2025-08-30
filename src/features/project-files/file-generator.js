// Source file generation for React projects
import fs from "fs-extra";
import path from "path";

import { createContentGenerator } from "../../templates/frameworks/index.js";
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

  const srcDir =
    framework === "nextjs" && userChoices.nextRouting === "app"
      ? path.join(projectPath, "app")
      : path.join(projectPath, "src");

  CORE_UTILS.ensureDirectory(srcDir);

  // Create entry point file if not using Next.js (which has its own routing)
  if (framework !== "nextjs") {
    createEntryPointFile(srcDir, fileExt, userChoices, framework);
  }

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
  const filename = framework === "vite" ? `main.${fileExt}` : `index.${fileExt}`;
  const generator = createContentGenerator(framework);
  const content = generator.generateEntryPoint(fileExt, userChoices);

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
  const isNextAppRouter = framework === "nextjs" && userChoices.nextRouting === "app";
  const routingType = isNextAppRouter ? "app" : null;

  const generator = createContentGenerator(framework, routingType);
  const content = generator.generateAppComponent(
    fileExt,
    userChoices.styling,
    userChoices,
  );

  const filename = isNextAppRouter ? `page.${fileExt}` : `App.${fileExt}`;
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
