const execa = require("execa");
const fs = require("fs-extra");
const path = require("path");

async function initGit(projectPath) {
  try {
    // check if git is installed
    try {
      await execa("git", ["--version"]);
    } catch (err) {
      console.log("Git is not installed. Skipping git initialization.");
      return false;
    }

    // initialize git repository
    console.log("Initializing git repository...");
    await execa("git", ["init"], { cwd: projectPath });

    // create .gitignore file if it doesn't exist
    const gitignorePath = path.join(projectPath, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = `
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build
/dist

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
      fs.writeFileSync(gitignorePath, gitignoreContent.trim());
    }

    console.log("Git repository initialized successfully!");
    return true;
  } catch (err) {
    console.error("Failed to initialize git repository");
    console.error(err.message || err);
    return false;
  }
}

module.exports = {
  initGit,
};
