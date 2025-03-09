import execa from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { log, error } from "./logger.js";

export async function initGit(projectPath) {
  const spinner = ora("Initializing git repository...").start();

  try {
    // check if git is installed
    try {
      await execa("git", ["--version"]);
    } catch (err) {
      spinner.warn("Git is not installed. Skipping git initialization.");
      return false;
    }

    // initialize git repository
    log("Initializing git repository...");
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

    spinner.succeed("Git repository initialized successfully!");
    return true;
  } catch (err) {
    spinner.fail("Failed to initialize git repository");
    error(err.message || err);
    return false;
  }
}
