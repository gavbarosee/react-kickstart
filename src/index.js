import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

import { createErrorHandler, ERROR_TYPES } from "./errors/index.js";
import generateProject from "./generators/index.js";
import { promptUser, getDefaultChoices, getFrameworkDefaults } from "./prompts.js";
import { CORE_UTILS, UI_UTILS, PROCESS_UTILS } from "./utils/index.js";

/**
 * Build userChoices object from CLI options when --yes flag is used
 */
function buildUserChoicesFromOptions(options) {
  const framework = options.framework || "vite";
  const baseDefaults = getFrameworkDefaults(framework);

  return {
    ...baseDefaults,
    // Override with explicit CLI options
    framework,
    typescript: options.typescript || false,
    styling: options.styling || "tailwind",
    stateManagement: options.state || "none",
    api: options.api || "none",
    testing: options.testing || "none",
    routing: options.routing || (framework === "vite" ? "none" : undefined),
    nextRouting: options.nextRouting || (framework === "nextjs" ? "app" : undefined),
    packageManager: options.packageManager || "npm",
    linting: options.linting !== false, // Default true unless --no-linting
    initGit: options.git !== false, // Default true unless --no-git
    openEditor: false, // Always false in CLI mode
    editor: "vscode",
    autoStart: options.autostart !== false, // Respect --no-autostart
  };
}

export async function createApp(projectDirectory, options = {}) {
  // Initialize error handler
  const errorHandler = createErrorHandler();
  errorHandler.setupGlobalHandlers();

  let projectPath = null;
  let shouldCleanup = false;

  return errorHandler.withErrorHandling(
    async () => {
      // Validate project directory input for security
      const dirValidation = CORE_UTILS.validateProjectDirectory(projectDirectory);
      if (!dirValidation.valid) {
        throw new Error(`Invalid project directory: ${dirValidation.error}`);
      }

      projectPath = dirValidation.sanitized
        ? path.resolve(process.cwd(), dirValidation.sanitized)
        : process.cwd();

      const projectName = dirValidation.sanitized || path.basename(projectPath);

      // Set error handler context
      errorHandler.setContext({
        projectPath,
        projectName,
        options,
      });

      // Validate project name
      const validationResult = CORE_UTILS.validateProjectName(projectName);
      if (!validationResult.valid) {
        const validationErrors = [
          ...(validationResult.errors || []),
          ...(validationResult.warnings || []),
        ];

        const errorMessage = `Invalid project name: ${projectName}\n${validationErrors
          .map((msg) => `  - ${msg}`)
          .join("\n")}`;
        throw new Error(errorMessage);
      }

      // More atomic directory handling to prevent race conditions
      try {
        // Ensure directory exists (creates if missing)
        await fs.ensureDir(projectPath);

        // Check directory contents AFTER ensuring it exists
        const files = await fs.readdir(projectPath);
        if (files.length > 0) {
          // Do not mark for cleanup if directory is not empty
          throw new Error(`The directory ${projectPath} is not empty.`);
        }

        // Directory exists and is empty → safe to mark for cleanup
        shouldCleanup = true;
        errorHandler.setContext({ shouldCleanup });

        // Write a temporary marker so cleanup is safe and scoped to this run only
        const markerPath = path.join(projectPath, ".react-kickstart.tmp");
        await fs.writeFile(markerPath, "temporary setup marker\n");
      } catch (error) {
        // If it's our "not empty" error, re-throw it
        if (error.message.includes("is not empty")) {
          throw error;
        }
        // For other errors (permission, etc), throw a more descriptive error
        throw new Error(
          `Cannot create or access directory ${projectPath}: ${error.message}`,
        );
      }

      // Get user choices
      const userChoices = options.yes
        ? buildUserChoicesFromOptions(options)
        : await promptUser({ verbose: options.verbose });

      // Show summary and get confirmation
      if (!options.yes && options.summary !== false) {
        UI_UTILS.divider();

        const confirmed = await UI_UTILS.showSummaryPrompt(
          projectPath,
          projectName,
          userChoices,
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
      UI_UTILS.divider();
      UI_UTILS.initSteps(3);

      // STEP 1: generate project files
      UI_UTILS.nextStep("Generating project files");
      console.log();

      if (userChoices.styling) {
        console.log(
          `Project configured with:\n  ${chalk.magenta("🎨")} ${
            userChoices.styling
          } styling`,
        );
      }

      await generateProject(projectPath, projectName, userChoices);

      // STEP 2: install dependencies (skippable via --skip-install)
      let installResult = { success: true, skipped: false };
      if (options.skipInstall) {
        console.log(chalk.yellow("Skipping dependency installation (--skip-install)."));
        installResult = { success: true, skipped: true };
      } else {
        UI_UTILS.nextStep("Installing dependencies");
        UI_UTILS.startProgress("Installing packages", { size: 26 });
        installResult = await errorHandler.withErrorHandling(
          () =>
            PROCESS_UTILS.installDependencies(
              projectPath,
              userChoices.packageManager,
              userChoices.framework,
            ),
          {
            type: ERROR_TYPES.DEPENDENCY,
            shouldCleanup,
            showRecovery: true,
          },
        );
        // finalize progress bar
        UI_UTILS.stopProgress(true);
        if (installResult.skipped) {
          console.log(
            chalk.yellow(
              "⚠️ Dependency installation was skipped. Some features may not work properly.",
            ),
          );
        } else if (!installResult.success) {
          throw new Error("Failed to install dependencies");
        }
      }

      // STEP 3: additional setups
      UI_UTILS.nextStep("Finalizing project setup");
      console.log();

      if (userChoices.initGit) {
        await errorHandler.withErrorHandling(
          () => PROCESS_UTILS.initGit(projectPath, userChoices),
          { type: ERROR_TYPES.PROCESS },
        );
      }

      if (userChoices.openEditor) {
        await errorHandler.withErrorHandling(
          () => PROCESS_UTILS.openEditor(projectPath, userChoices.editor, userChoices),
          { type: ERROR_TYPES.PROCESS },
        );
      }

      console.log(`  ✅ Project successfully set up`);
      console.log();

      UI_UTILS.divider();

      const completionSummary = UI_UTILS.generateCompletionSummary(
        projectPath,
        projectName,
        userChoices,
        installResult.vulnerabilities,
        installResult.packageCount,
      );
      console.log(completionSummary);

      // Only start the project if autostart is enabled
      if (options.autostart !== false && userChoices.autoStart !== false) {
        await errorHandler.withErrorHandling(
          () => PROCESS_UTILS.startProject(projectPath, userChoices),
          { type: ERROR_TYPES.PROCESS },
        );
      }

      // Cleanup temporary marker after successful setup to prevent accidental deletions
      try {
        const markerPath = path.join(projectPath, ".react-kickstart.tmp");
        if (await fs.pathExists(markerPath)) {
          await fs.remove(markerPath);
        }
      } catch (_) {}
    },
    {
      type: ERROR_TYPES.GENERAL,
      // Only clean up when we explicitly mark shouldCleanup during this run
      shouldCleanup: false,
      verbose: options.verbose,
      showRecovery: false,
    },
  );
}
