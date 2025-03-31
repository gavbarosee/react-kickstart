import execa from "execa";
import chalk from "chalk";
import open from "open";
import ora from "ora";
import path from "path";
import { getFrameworkInfo } from "./completion.js";

async function checkServerAndOpenBrowser(devUrl) {
  console.log(chalk.cyan(`\nWaiting for development server to start...`));

  // function to check if server is responding
  const isServerReady = async () => {
    try {
      // using native http/https modules to avoid adding dependencies
      const http = devUrl.startsWith("https")
        ? await import("https")
        : await import("http");

      return new Promise((resolve) => {
        const req = http.get(devUrl, (res) => {
          // any response means server is up (even 404, 500, etc.)
          resolve(true);
          req.destroy();
        });

        req.on("error", () => {
          resolve(false);
        });

        // set a short timeout for each attempt
        req.setTimeout(500, () => {
          req.destroy();
          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  };

  // try to connect to the server for up to 30 seconds
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    if (await isServerReady()) {
      console.log(chalk.green(`Server is ready! Opening browser...`));

      try {
        await open(devUrl);
        console.log(chalk.green(`Browser opened successfully!`));
      } catch (err) {
        console.log(
          chalk.yellow(
            `\nCouldn't open your default browser. It might not be installed or properly configured.`
          )
        );
        console.log(
          chalk.cyan(`Please visit ${devUrl} manually in your browser.`)
        );
      }

      return true;
    }

    // wait 1 second between attempts and show progress
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.stdout.write(".");
    attempts++;
  }

  console.log(
    chalk.yellow(
      `\nServer didn't respond in time. You may need to manually open:`
    )
  );
  console.log(chalk.bold.underline(`${devUrl}`));
  return false;
}

export async function startProject(projectPath, userChoices) {
  const spinner = ora({
    text: `Starting development server...`,
    color: "green",
    spinner: "dots",
  }).start();

  try {
    const frameworkInfo = getFrameworkInfo(userChoices.framework);
    const devUrl = `http://localhost:${frameworkInfo.port}`;

    const pmRun = userChoices.packageManager === "yarn" ? "yarn" : "npm run";
    const devCommand =
      userChoices.framework === "parcel" && userChoices.packageManager === "npm"
        ? "npm start"
        : `${pmRun} dev`;

    const [cmd, ...args] = devCommand.split(" ");

    spinner.succeed(`Development server starting at ${chalk.cyan(devUrl)}`);
    console.log(
      `\n${chalk.cyan(">")} ${chalk.dim(`${cmd} ${args.join(" ")}`)}`
    );
    console.log(
      chalk.yellow("\nPress Ctrl+C to stop the development server\n")
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    const subprocess = execa(cmd, args, {
      cwd: projectPath,
      stdio: ["inherit", "pipe", "pipe"],
    });

    const cleanup = () => {
      if (subprocess && !subprocess.killed) {
        console.log(chalk.yellow("\nStopping development server..."));
        subprocess.kill("SIGTERM");
      }
    };

    // store event listener references so we can remove them later
    const handleSigInt = () => cleanup();
    const handleSigTerm = () => cleanup();
    const handleExit = () => cleanup();
    const handleUncaughtException = (err) => {
      console.error(chalk.red(`Uncaught exception: ${err.message}`));
      cleanup();
      process.exit(1);
    };

    // add event listeners
    process.on("SIGINT", handleSigInt);
    process.on("SIGTERM", handleSigTerm);
    process.on("exit", handleExit);
    process.on("uncaughtException", handleUncaughtException);

    // set up a function to remove all listeners when no longer needed
    const removeAllListeners = () => {
      process.removeListener("SIGINT", handleSigInt);
      process.removeListener("SIGTERM", handleSigTerm);
      process.removeListener("exit", handleExit);
      process.removeListener("uncaughtException", handleUncaughtException);
    };

    // remove listeners when the subprocess exits
    subprocess.on("exit", () => {
      removeAllListeners();
    });

    // check server and open browser
    checkServerAndOpenBrowser(devUrl);

    return subprocess;
  } catch (err) {
    spinner.fail(`Failed to start development server`);
    console.error(chalk.red(`Error: ${err.message || err}`));
    console.log(
      chalk.cyan(
        `\nYou can start it manually by navigating to the project directory and running:`
      )
    );

    const pmRun = userChoices.packageManager === "yarn" ? "yarn" : "npm run";
    const devCommand =
      userChoices.framework === "parcel" && userChoices.packageManager === "npm"
        ? "npm start"
        : `${pmRun} dev`;

    console.log(chalk.bold(`  cd ${path.basename(projectPath || ".")}`));
    console.log(chalk.bold(`  ${devCommand}`));
    console.log();

    return null;
  }
}
