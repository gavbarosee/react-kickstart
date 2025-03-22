import execa from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { error } from "./logger.js";
import { displayGitSetup } from "./enhanced-logger.js";

export async function initGit(projectPath, userChoices) {
  const { framework, typescript, linting, styling } = userChoices || {};

  const spinner = ora({
    text: "Initializing git repository...",
    color: "blue",
    spinner: "dots",
  }).start();

  try {
    try {
      await execa("git", ["--version"]);
    } catch (err) {
      spinner.warn("Git is not installed. Skipping git initialization.");
      return false;
    }

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
${framework === "nextjs" ? "/.next/\n/out/" : ""}
${framework === "parcel" ? "/.parcel-cache/" : ""}

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

    spinner.stop();

    displayGitSetup(linting, framework, typescript);

    return true;
  } catch (err) {
    spinner.fail("Failed to initialize git repository");
    error(err.message || err);
    return false;
  }
}
