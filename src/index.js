import path from "path";
import fs from "fs-extra";
import validateProjectName from "validate-npm-package-name";
import chalk from "chalk";
import { promptUser, getDefaultChoices } from "./prompts.js";
import generateProject from "./generators/index.js";
import { initGit } from "./utils/git.js";
import { openEditor } from "./utils/editor.js";
import { installDependencies } from "./utils/package-manager.js";
import { error, initSteps, nextStep, divider } from "./utils/logger.js";
import { showSummaryPrompt } from "./utils/summary.js";
import { generateCompletionSummary } from "./utils/completion.js";
import { startProject } from "./utils/start-project.js";

function cleanupProjectDirectory(projectPath, shouldCleanup = true) {
  if (!shouldCleanup) return;

  try {
    // don't delete if it's not the directory we just created or if it's a root-like path
    if (!projectPath || projectPath === "/" || projectPath === process.cwd()) {
      console.error(
        chalk.yellow(`\nSkipping cleanup for safety: ${projectPath}`)
      );
      return;
    }

    // extra safety: ensure the directory isn't too old (might not be user's generated one)
    const stats = fs.statSync(projectPath);
    const creationTime = new Date(stats.birthtime).getTime();
    const now = new Date().getTime();
    const fiveMinutesAgo = now - 5 * 60 * 1000; // 5 minutes in milliseconds

    if (creationTime < fiveMinutesAgo) {
      console.error(
        chalk.yellow(
          `\nSkipping cleanup of directory older than 5 minutes: ${projectPath}`
        )
      );
      return;
    }

    // Check if this directory contains files that would indicate it was created by our tool
    const isSafeToDelete = isDirectoryCreatedByTool(projectPath);

    if (!isSafeToDelete) {
      console.error(
        chalk.yellow(
          `\nSkipping cleanup as directory doesn't appear to be created by react-kickstart: ${projectPath}`
        )
      );
      return;
    }

    if (fs.existsSync(projectPath)) {
      fs.removeSync(projectPath);
      console.log(
        chalk.yellow(`\nCleaned up failed project at ${projectPath}`)
      );
    }
  } catch (cleanupErr) {
    console.error(
      chalk.red(`Failed to clean up directory: ${cleanupErr.message}`)
    );
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
  let projectPath = null;
  let shouldCleanup = false;

  try {
    projectPath = projectDirectory
      ? path.resolve(process.cwd(), projectDirectory)
      : process.cwd();

    const projectName = projectDirectory || path.basename(projectPath);

    const validationResult = validateProjectName(projectName);
    if (!validationResult.validForNewPackages) {
      error(`Invalid project name: ${projectName}`);
      [
        ...(validationResult.errors || []),
        ...(validationResult.warnings || []),
      ].forEach((msg) => {
        error(`  - ${msg}`);
      });
      process.exit(1);
    }

    const directoryExists = fs.existsSync(projectPath);

    if (directoryExists) {
      const files = fs.readdirSync(projectPath);
      if (files.length > 0) {
        error(`The directory ${chalk.green(projectPath)} is not empty.`);
        process.exit(1);
      }
    } else {
      // clean up project on error
      fs.mkdirSync(projectPath, { recursive: true });
      shouldCleanup = true;
    }

    try {
      const userChoices = options.yes
        ? getDefaultChoices()
        : await promptUser({ verbose: options.verbose });

      if (!options.yes && options.summary !== false) {
        divider();

        const confirmed = await showSummaryPrompt(
          projectPath,
          projectName,
          userChoices
        );

        if (!confirmed) {
          console.log(chalk.yellow("Setup canceled. No changes were made."));
          if (shouldCleanup) {
            cleanupProjectDirectory(projectPath, shouldCleanup);
          }
          process.exit(0);
        }
      }

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

      // STEP 2: install dependencies - pass framework info for better progress estimation
      nextStep("Installing dependencies");
      console.log();

      const installResult = await installDependencies(
        projectPath,
        userChoices.packageManager,
        userChoices.framework
      );

      if (!installResult.success) {
        error("Failed to install dependencies. Cleaning up...");
        cleanupProjectDirectory(projectPath, shouldCleanup);
        process.exit(1);
      }

      // STEP 3: additional setups
      nextStep("Finalizing project setup");
      console.log();

      if (userChoices.initGit) {
        await initGit(projectPath, userChoices);
      }

      if (userChoices.openEditor) {
        await openEditor(projectPath, userChoices.editor, userChoices);
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

      await startProject(projectPath, userChoices);
    } catch (err) {
      handleError(err, options.verbose, projectPath, shouldCleanup);
    }
  } catch (err) {
    handleError(err, options.verbose, projectPath, shouldCleanup);
  }
}

function handleError(err, verbose, projectPath, shouldCleanup) {
  error("An error occurred during project setup:");
  error(err.message || err);

  if (verbose) {
    console.error(err);
  }

  // clean up the project directory
  if (projectPath && shouldCleanup) {
    cleanupProjectDirectory(projectPath, shouldCleanup);
  }

  console.log();
  console.log(chalk.yellow("Need help? Open an issue:"));
  console.log("  https://github.com/gavbarosee/react-kickstart/issues/new");
  console.log();

  process.exit(1);
}
