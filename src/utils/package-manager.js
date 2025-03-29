import execa from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { error } from "./logger.js";

export function countPackages(packageJsonPath) {
  try {
    const packageData = fs.readJsonSync(packageJsonPath);
    const dependencies = Object.keys(packageData.dependencies || {}).length;
    const devDependencies = Object.keys(
      packageData.devDependencies || {}
    ).length;
    const totalDirectDeps = dependencies + devDependencies;

    return Math.round(totalDirectDeps * 5);
  } catch (err) {
    return 25;
  }
}

function createProgressBar(framework = "vite") {
  let progress = 10;
  let interval;

  const settings = {
    vite: {
      interval: 300, // Update every 300ms
      increment: 15, // Fast increments
      description: "Fast installation",
    },
    rsbuild: {
      interval: 300, // Update every 300ms
      increment: 12, // Fairly fast increments
      description: "Fast installation",
    },
    parcel: {
      interval: 500, // Update every 500ms
      increment: 3, // Slower increments
      description: "Standard installation",
    },
    nextjs: {
      interval: 500, // Update every 500ms
      increment: 2, // Slowest increments
      description: "Full-stack framework installation",
    },
  };

  const config = settings[framework.toLowerCase()] || settings.vite;
  const progressFinishMessage = config.description
    ? ` (${config.description})`
    : "";

  const start = () => {
    process.stdout.write(
      `  📊 Installing packages${progressFinishMessage}: ${"░".repeat(30)} 0%\n`
    );

    let startTime = Date.now();
    interval = setInterval(() => {
      progress = Math.min(95, progress + config.increment / 3);

      process.stdout.write("\x1b[1A"); // Move cursor up one line
      process.stdout.write("\r\x1b[K"); // Clear the line

      const barLength = Math.floor(progress / 3.33);
      process.stdout.write(
        `  📊 Installing packages${progressFinishMessage}: ${"█".repeat(
          barLength
        )}${"░".repeat(30 - barLength)} ${Math.floor(progress)}%\n`
      );
    }, config.interval);
  };

  return {
    start,
    complete: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      process.stdout.write("\x1b[1A"); // Move cursor up one line
      process.stdout.write("\r\x1b[K"); // Clear the line
      process.stdout.write(
        `  📊 Installing packages: ${"█".repeat(30)} 100%\n\n`
      );
    },
  };
}

export async function installDependencies(
  projectPath,
  packageManager = "npm",
  framework = "vite"
) {
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

    const packageData = fs.readJsonSync(packageJsonPath);
    const dependencies = Object.keys(packageData.dependencies || {});
    const devDependencies = Object.keys(packageData.devDependencies || {});

    const categories = {
      "React ecosystem": dependencies.filter(
        (dep) => dep.includes("react") || dep.includes("jsx")
      ),
      "UI frameworks": [...dependencies, ...devDependencies].filter(
        (dep) =>
          dep.includes("tailwind") ||
          dep.includes("style") ||
          dep.includes("css") ||
          dep.includes("sass") ||
          dep.includes("postcss")
      ),
      "Build tools": [...dependencies, ...devDependencies].filter(
        (dep) =>
          dep.includes("vite") ||
          dep.includes("webpack") ||
          dep.includes("babel") ||
          dep.includes("parcel") ||
          dep.includes("build") ||
          dep.includes("rsbuild") ||
          dep.includes("next")
      ),
      "Dev tools": devDependencies.filter(
        (dep) =>
          dep.includes("eslint") ||
          dep.includes("prettier") ||
          dep.includes("typescript") ||
          dep.includes("test")
      ),
    };

    console.log("  📥 Project dependencies:");

    Object.entries(categories).forEach(([category, deps]) => {
      if (deps.length > 0) {
        const displayedDeps = deps.slice(0, 3);
        const remaining = deps.length > 3 ? deps.length - 3 : 0;

        const formattedDeps = displayedDeps
          .map(
            (dep) =>
              `${dep}@${
                packageData.dependencies?.[dep] ||
                packageData.devDependencies?.[dep]
              }`
          )
          .join(", ");

        console.log(
          `     ${category}:`.padEnd(25) +
            `✓ ${formattedDeps}${remaining ? ` (+${remaining} more)` : ""}`
        );
      }
    });

    console.log();

    const progressBar = createProgressBar(framework);
    progressBar.start();

    const { stdout, stderr } = await execa(installCmd, installArgs, {
      cwd: projectPath,
      stdio: ["inherit", "pipe", "pipe"],
    });

    progressBar.complete();

    let vulnerabilities = [];
    const combinedOutput = stdout + "\n" + stderr;

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

    const packageCount = countPackages(packageJsonPath);

    console.log(
      `  ✅ Dependencies successfully installed (${packageCount} packages)`
    );
    console.log();

    return {
      success: true,
      vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : null,
      packageCount,
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
