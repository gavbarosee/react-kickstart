import execa from "execa";
import ora from "ora";
import { log, error } from "./logger.js";

export async function installDependencies(projectPath, packageManager = "npm") {
  // const spinner = ora("Installing dependencies...").start();

  const spinner = ora({
    text: `Installing dependencies...`,
    color: "green",
    spinner: "bouncingBar",
  }).start();

  try {
    const installCmd = packageManager === "yarn" ? "yarn" : "npm";
    const installArgs = packageManager === "yarn" ? [] : ["install"];

    log(`Installing dependencies using ${packageManager}...`);

    await execa(installCmd, installArgs, {
      cwd: projectPath,
      stdio: "inherit",
    });

    spinner.succeed("Dependencies installed successfully!");
    return true;
  } catch (err) {
    spinner.fail("Failed to install dependencies");
    error(err.message || err);

    return false;
  }
}

export function getPackageManagerCommand(packageManager) {
  if (packageManager === "yarn") {
    return {
      run: "yarn",
      dev: "yarn dev",
      build: "yarn build",
      start: "yarn start",
    };
  }

  return {
    run: "npm run",
    dev: "npm run dev",
    build: "npm run build",
    start: "npm start",
  };
}
