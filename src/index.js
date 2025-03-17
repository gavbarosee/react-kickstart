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

export async function createApp(projectDirectory, options = {}) {
  try {
    // if no project directory is provided, use current directory
    const projectPath = projectDirectory
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

    if (fs.existsSync(projectPath)) {
      const files = fs.readdirSync(projectPath);
      if (files.length > 0) {
        error(`The directory ${chalk.green(projectPath)} is not empty.`);
        process.exit(1);
      }
    } else {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    try {
      // use step-by-step prompting system when not using --yes flag
      const userChoices = options.yes
        ? getDefaultChoices()
        : await promptUser();

      // add summary and confirmation step (skip if --no-summary or -y flag is used)
      if (!options.yes && options.summary !== false) {
        divider();

        // show summary and ask for confirmation
        const confirmed = await showSummaryPrompt(
          projectPath,
          projectName,
          userChoices
        );

        // exit if user does not confirm
        if (!confirmed) {
          console.log(chalk.yellow("Setup canceled. No changes were made."));
          process.exit(0);
        }
      }

      divider();
      // display steps during prompting
      initSteps(3);

      // STEP 1: generate project files
      nextStep("Generating project files");
      await generateProject(projectPath, projectName, userChoices);

      // STEP 2: install dependencies
      nextStep("Installing dependencies");
      const installResult = await installDependencies(
        projectPath,
        userChoices.packageManager
      );

      // STEP 3: additional setups
      nextStep("Finalizing project setup");
      if (userChoices.initGit) {
        await initGit(projectPath);
      }

      // open in editor if selected
      if (userChoices.openEditor) {
        await openEditor(projectPath, userChoices.editor);
      }

      divider();

      const completionSummary = generateCompletionSummary(
        projectPath,
        projectName,
        userChoices,
        installResult.vulnerabilities
      );
      console.log(completionSummary);

      if (userChoices.autoStart) {
        await startProject(projectPath, userChoices);
      }
    } catch (err) {
      handleError(err, options.verbose);
    }
  } catch (err) {
    handleError(err, options.verbose);
  }
}

function handleError(err, verbose) {
  error("An error occurred during project setup:");
  error(err.message || err);

  if (verbose) {
    console.error(err);
  }

  console.log();
  console.log(chalk.yellow("Need help? Open an issue:"));
  console.log("  https://github.com/gavbarosee/react-kickstart/issues/new");
  console.log();

  process.exit(1);
}
