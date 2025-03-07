const path = require("path");
const fs = require("fs-extra");
const validateProjectName = require("validate-npm-package-name");
const chalk = require("chalk");
const { promptUser } = require("./prompts");
const { generateProject } = require("./generators");
const { initGit } = require("./utils/git");
const { openEditor } = require("./utils/editor");
const { installDependencies } = require("./utils/package-manager");
const { error, success, section, bullet } = require("./utils/logger");

async function createApp(projectDirectory, options = {}) {
  try {
    // if no project directory is provided, use current directory
    const projectPath = projectDirectory
      ? path.resolve(process.cwd(), projectDirectory)
      : process.cwd();

    const projectName = projectDirectory || path.basename(projectPath);

    // validate project name
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

    // check if directory exists and is empty
    if (fs.existsSync(projectPath)) {
      const files = fs.readdirSync(projectPath);
      if (files.length > 0) {
        error(`The directory ${chalk.green(projectPath)} is not empty.`);
        process.exit(1);
      }
    } else {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    section(`Creating a new React app in ${chalk.green(projectPath)}`);

    try {
      // get user preferences
      const userChoices = options.yes
        ? getDefaultChoices()
        : await promptUser();

      // generate project files
      await generateProject(projectPath, projectName, userChoices);

      // install dependencies using selected package manager
      await installDependencies(projectPath, userChoices.packageManager);

      // init git if selected
      if (userChoices.initGit) {
        await initGit(projectPath);
      }

      // open in editor if selected
      if (userChoices.openEditor) {
        await openEditor(projectPath, userChoices.editor);
      }

      // success case
      console.log();
      success(
        `Created ${chalk.cyan(projectName)} at ${chalk.cyan(projectPath)}`
      );
      section("What's next?");

      const pmRun = userChoices.packageManager === "yarn" ? "yarn" : "npm run";

      // show the correct dev command based on the framework
      let devCommand;
      if (userChoices.framework === "parcel") {
        devCommand =
          userChoices.packageManager === "yarn" ? "yarn start" : "npm start";
        bullet(`Start the development server: ${chalk.cyan(devCommand)}`);
      } else {
        devCommand = `${pmRun} dev`;
        bullet(`Start the development server: ${chalk.cyan(devCommand)}`);
      }

      bullet(`Build for production: ${chalk.cyan(`${pmRun} build`)}`);

      console.log();
      console.log("Get started by typing:");
      console.log();

      if (projectDirectory) {
        console.log(`  ${chalk.cyan("cd")} ${projectDirectory}`);
      }

      console.log(`  ${chalk.cyan(devCommand)}`);
      console.log();
      console.log(chalk.green("Happy hacking! 🚀"));
    } catch (err) {
      handleError(err, options.verbose);
    }
  } catch (err) {
    handleError(err, options.verbose);
  }
}

function getDefaultChoices() {
  return {
    packageManager: "npm",
    framework: "vite",
    typescript: false,
    linting: true,
    styling: "tailwind",
    initGit: true,
    openEditor: false,
    editor: "vscode",
  };
}

function handleError(err, verbose) {
  error("An error occurred during project setup:");
  error(err.message || err);

  if (verbose) {
    console.error(err);
  }

  console.log();
  console.log(chalk.yellow("Need help? Open an issue:"));
  console.log("  https://github.com/yourusername/react-kickstart/issues/new");
  console.log();

  process.exit(1);
}

module.exports = createApp;
