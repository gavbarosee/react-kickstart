// src/utils/package-manager.js (updated version)
import execa from "execa";
import ora from "ora";
import path from "path";
import { error } from "./logger.js";
import {
  categorizeDependencies,
  stepSection,
  progressBar,
  displayEstimatedTime,
  countPackages,
} from "./enhanced-logger.js";

export async function installDependencies(projectPath, packageManager = "npm") {
  const spinner = ora({
    text: `Installing dependencies...`,
    color: "green",
    spinner: "bouncingBar",
  }).start();

  try {
    const installCmd = packageManager === "yarn" ? "yarn" : "npm";
    const installArgs = packageManager === "yarn" ? [] : ["install"];

    spinner.stop();
    console.log();

    const packageJsonPath = path.join(projectPath, "package.json");
    const categorizedDeps = categorizeDependencies(packageJsonPath);

    // change to "Project dependencies" instead of "Resolving dependencies"
    stepSection(
      "📥",
      "Project dependencies:",
      categorizedDeps.map(({ category, deps }) => ({
        label: category + ":",
        description: deps,
      }))
    );

    progressBar(15, "Installing packages");
    displayEstimatedTime(30); // est 30 seconds

    spinner.start();

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

    // get a more realistic package count
    const totalPackages = countPackages(packageJsonPath);
    spinner.stop();

    console.log(
      `  ✅ Dependencies successfully installed (${totalPackages} packages)`
    );
    console.log();

    return {
      success: true,
      vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : null,
      packageCount: totalPackages,
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
