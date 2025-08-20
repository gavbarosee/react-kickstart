import path from "path";
import fs from "fs-extra";
import validateProjectName from "validate-npm-package-name";
import chalk from "chalk";
import { promptUser, getDefaultChoices } from "./prompts.js";
import generateProject from "./generators/index.js";
import { initGit } from "./utils/git.js";
import { openEditor } from "./utils/editor.js";
import { installDependenciesWithRetry } from "./utils/package-manager.js";
import { error, initSteps, nextStep, divider } from "./utils/logger.js";
import { showSummaryPrompt } from "./utils/summary.js";
import { generateCompletionSummary } from "./utils/completion.js";
import { startProject } from "./utils/start-project.js";
import { createErrorHandler, ERROR_TYPES } from "./errors/index.js";

// Legacy cleanup function - now replaced by CleanupManager in error handling system
// This function is kept for any remaining backward compatibility but should not be used
function cleanupProjectDirectory(projectPath, shouldCleanup = true) {
  console.warn(
    "cleanupProjectDirectory is deprecated. Use CleanupManager from error handling system instead."
  );
  // Fallback to basic cleanup for any edge cases
  if (shouldCleanup && projectPath && fs.existsSync(projectPath)) {
    try {
      fs.removeSync(projectPath);
    } catch (err) {
      console.error(`Cleanup failed: ${err.message}`);
    }
  }
}

/**
 * Checks if a directory appears to have been created by our tool.
 * @param {string} dirPath - Path to the directory to check
 * @returns {boolean} - Whether the directory appears to have been created by our tool
 */
function isDirectoryCreatedByTool(dirPath) {
  try {
    // check if package.json exists and has expected content
    const packageJsonPath = path.join(dirPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);

      // check if scripts contain expected keys (like dev, build, etc.)
      const hasExpectedScripts =
        packageJson.scripts &&
        (packageJson.scripts.dev ||
          packageJson.scripts.build ||
          packageJson.scripts.start);

      // check if dependencies contain React
      const hasReactDep =
        packageJson.dependencies &&
        (packageJson.dependencies.react ||
          packageJson.dependencies["react-dom"]);

      if (hasExpectedScripts && hasReactDep) {
        return true;
      }
    }

    // alternatively, check for the presence of certain directories that our tool would create
    const srcExists = fs.existsSync(path.join(dirPath, "src"));
    const publicExists = fs.existsSync(path.join(dirPath, "public"));

    // check for framework-specific directories
    const appExists = fs.existsSync(path.join(dirPath, "app")); // Next.js app router
    const pagesExists = fs.existsSync(path.join(dirPath, "pages")); // Next.js pages router

    // if we find evidence of our generated structure, it's likely our tool created it
    if ((srcExists && publicExists) || appExists || pagesExists) {
      return true;
    }

    // not enough evidence to confidently say this directory was created by our tool
    return false;
  } catch (err) {
    // if we can't check the directory contents, err on the side of caution
    console.error(
      chalk.red(`Error checking directory contents: ${err.message}`)
    );
    return false;
  }
}
export async function createApp(projectDirectory, options = {}) {
  // Initialize error handler
  const errorHandler = createErrorHandler();
  errorHandler.setupGlobalHandlers();

  let projectPath = null;
  let shouldCleanup = false;

  return errorHandler.withErrorHandling(
    async () => {
      projectPath = projectDirectory
        ? path.resolve(process.cwd(), projectDirectory)
        : process.cwd();

      const projectName = projectDirectory || path.basename(projectPath);

      // Set error handler context
      errorHandler.setContext({
        projectPath,
        projectName,
        options,
      });

      // Validate project name
      const validationResult = validateProjectName(projectName);
      if (!validationResult.validForNewPackages) {
        const validationErrors = [
          ...(validationResult.errors || []),
          ...(validationResult.warnings || []),
        ];

        const errorMessage = `Invalid project name: ${projectName}\n${validationErrors
          .map((msg) => `  - ${msg}`)
          .join("\n")}`;
        throw new Error(errorMessage);
      }

      const directoryExists = fs.existsSync(projectPath);

      if (directoryExists) {
        const files = fs.readdirSync(projectPath);
        if (files.length > 0) {
          throw new Error(`The directory ${projectPath} is not empty.`);
        }
      } else {
        // Mark for cleanup on error
        fs.mkdirSync(projectPath, { recursive: true });
        shouldCleanup = true;

        // Update error handler context with cleanup flag
        errorHandler.setContext({ shouldCleanup });
      }

      // Get user choices
      const userChoices = options.yes
        ? getDefaultChoices()
        : await promptUser({ verbose: options.verbose });

      // Show summary and get confirmation
      if (!options.yes && options.summary !== false) {
        divider();

        const confirmed = await showSummaryPrompt(
          projectPath,
          projectName,
          userChoices
        );

        if (!confirmed) {
          await errorHandler.handle(new Error("User cancelled setup"), {
            type: ERROR_TYPES.USER_CANCELLED,
            shouldCleanup,
          });
          return;
        }
      }

      // Start project generation
      divider();
      initSteps(3);

      // STEP 1: generate project files
      nextStep("Generating project files");
      console.log();

      if (userChoices.styling) {
        console.log(
          `Project configured with:\n  ${chalk.magenta("🎨")} ${
            userChoices.styling
          } styling`
        );
      }

      await generateProject(projectPath, projectName, userChoices);

      // STEP 2: install dependencies
      nextStep("Installing dependencies");
      console.log();

      const installResult = await errorHandler.withErrorHandling(
        () =>
          installDependenciesWithRetry(
            projectPath,
            userChoices.packageManager,
            userChoices.framework
          ),
        {
          type: ERROR_TYPES.DEPENDENCY,
          shouldCleanup,
          showRecovery: true,
        }
      );

      if (installResult.skipped) {
        console.log(
          chalk.yellow(
            "⚠️ Dependency installation was skipped. Some features may not work properly."
          )
        );
      } else if (!installResult.success) {
        throw new Error("Failed to install dependencies");
      }

      // STEP 3: additional setups
      nextStep("Finalizing project setup");
      console.log();

      if (userChoices.initGit) {
        await errorHandler.withErrorHandling(
          () => initGit(projectPath, userChoices),
          { type: ERROR_TYPES.PROCESS }
        );
      }

      if (userChoices.openEditor) {
        await errorHandler.withErrorHandling(
          () => openEditor(projectPath, userChoices.editor, userChoices),
          { type: ERROR_TYPES.PROCESS }
        );
      }

      console.log(`  ✅ Project successfully set up`);
      console.log();

      divider();

      const completionSummary = generateCompletionSummary(
        projectPath,
        projectName,
        userChoices,
        installResult.vulnerabilities,
        installResult.packageCount
      );
      console.log(completionSummary);

      await errorHandler.withErrorHandling(
        () => startProject(projectPath, userChoices),
        { type: ERROR_TYPES.PROCESS }
      );
    },
    {
      type: ERROR_TYPES.GENERAL,
      shouldCleanup: true,
      verbose: options.verbose,
    }
  );
}
