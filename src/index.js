const path = require("path");
const fs = require("fs-extra");

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
  console.log("TODO: Implement app creation");
}

module.exports = createApp;
