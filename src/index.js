const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const { promptUser } = require("./prompts");
const { generateProject } = require("./generators");
const { installDependencies } = require("./utils/package-manager");

async function createApp(projectDirectory, options = {}) {
  // if no project directory is provided, use current directory
  const projectPath = projectDirectory
    ? path.resolve(process.cwd(), projectDirectory)
    : process.cwd();

  const projectName = projectDirectory || path.basename(projectPath);

  // check if directory exists and is empty then proceed
  if (fs.existsSync(projectPath)) {
    const files = fs.readdirSync(projectPath);
    if (files.length > 0) {
      console.error(`The directory ${chalk.green(projectPath)} is not empty.`);
      process.exit(1);
    }
  } else {
    fs.mkdirSync(projectPath, { recursive: true });
  }

  console.log(`Creating a new React app in ${chalk.green(projectPath)}`);

  try {
    // get user preferences
    const userChoices = options.yes ? getDefaultChoices() : await promptUser();

    // generate project files
    await generateProject(projectPath, projectName, userChoices);

    // install dependencies
    await installDependencies(projectPath, userChoices.packageManager);

    console.log();
    console.log(
      `${chalk.green("Success!")} Created ${chalk.cyan(
        projectName
      )} at ${chalk.cyan(projectPath)}`
    );
    console.log();
    console.log("Inside that directory, you can run several commands:");
    console.log();

    const pmRun = userChoices.packageManager === "yarn" ? "yarn" : "npm run";

    console.log(`  ${chalk.cyan(`${pmRun} dev`)}`);
    console.log("    Starts the development server.");
    console.log();
    console.log(`  ${chalk.cyan(`${pmRun} build`)}`);
    console.log("    Bundles the app for production.");
    console.log();
  } catch (err) {
    console.error("An error occurred during project setup:");
    console.error(err.message || err);
    process.exit(1);
  }
}

function getDefaultChoices() {
  return {
    packageManager: "npm",
    framework: "vite",
  };
}

module.exports = createApp;
