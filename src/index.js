const path = require("path");
const fs = require("fs-extra");
const { promptUser } = require("./prompts");

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
      console.error(`The directory ${projectPath} is not empty.`);
      process.exit(1);
    }
  } else {
    fs.mkdirSync(projectPath, { recursive: true });
  }

  console.log(`Creating a new React app in ${projectPath}`);

  try {
    // get user preferences
    const userChoices = options.yes ? getDefaultChoices() : await promptUser();
    console.log("Selected options:", userChoices);
    // TODO: Use these options to create the project
  } catch (err) {
    console.error("An error occurred during project setup:");
    console.error(err);
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
