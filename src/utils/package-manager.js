import execa from "execa";
import ora from "ora";
import { error } from "./logger.js";

export async function installDependencies(projectPath, packageManager = "npm") {
  const spinner = ora({
    text: `Installing dependencies (est. <1 min)...`,
    color: "green",
    spinner: "bouncingBar",
  }).start();

  try {
    const installCmd = packageManager === "yarn" ? "yarn" : "npm";
    const installArgs = packageManager === "yarn" ? [] : ["install"];

    // capture standard output and error
    const { stdout, stderr } = await execa(installCmd, installArgs, {
      cwd: projectPath,
      stdio: ["inherit", "pipe", "pipe"], // only inherit stdin
    });

    // parse output for vulnerabilities
    let vulnerabilities = [];
    const combinedOutput = stdout + "\n" + stderr;

    // look for vulnerability message in the combined output
    const vulnMatch = combinedOutput.match(
      /found (\d+) (\w+) severity vulnerabilit(y|ies)/i
    );
    if (vulnMatch) {
      const count = parseInt(vulnMatch[1], 10);
      const severity = vulnMatch[2].toLowerCase();

      if (count > 0) {
        vulnerabilities.push({
          count,
          severity,
        });
      }
    }

    spinner.succeed("Dependencies installed successfully!");

    return {
      success: true,
      vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : null,
    };
  } catch (err) {
    spinner.fail("Failed to install dependencies");
    error(err.message || err);
    return { success: false, error: err };
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
