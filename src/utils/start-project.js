import execa from "execa";
import chalk from "chalk";
import open from "open";
import ora from "ora";
import path from "path";
import { getFrameworkInfo } from "./completion.js";

let devProcess = null;
let isShuttingDown = false;

/**
 * Cleanup function that properly terminates the development server
 */
function cleanupDevServer() {
  if (!devProcess || isShuttingDown) return;

  isShuttingDown = true;
  console.log(chalk.yellow("\nStopping development server..."));

  try {
    // try graceful termination first with SIGTERM
    if (!devProcess.killed) {
      devProcess.kill("SIGTERM");

      // give it a moment to terminate gracefully, then force if needed
      setTimeout(() => {
        if (devProcess && !devProcess.killed) {
          console.log(chalk.yellow("Forcing development server to stop..."));
          try {
            devProcess.kill("SIGKILL");
          } catch (err) {
            // last resort attempt by PID
            try {
              if (devProcess.pid) {
                process.kill(devProcess.pid, "SIGKILL");
              }
            } catch (killError) {
              console.error(
                chalk.red(`Unable to terminate process: ${killError.message}`)
              );
            }
          }
        }
        devProcess = null;
        isShuttingDown = false;
      }, 2000);
    }
  } catch (err) {
    console.error(chalk.red(`Error stopping server: ${err.message}`));
    devProcess = null;
    isShuttingDown = false;
  }
}

/**
 * Register process termination handlers
 */
function registerCleanupHandlers() {
  // clean up on terminal exit signals
  process.on("SIGINT", () => {
    cleanupDevServer();
    setTimeout(() => process.exit(0), 100);
  });

  process.on("SIGTERM", () => {
    cleanupDevServer();
    setTimeout(() => process.exit(0), 100);
  });

  // handle abnormal terminations
  process.on("exit", cleanupDevServer);

  process.on("uncaughtException", (err) => {
    console.error(chalk.red(`Uncaught exception: ${err.message}`));
    cleanupDevServer();
    setTimeout(() => process.exit(1), 100);
  });

  process.on("unhandledRejection", (reason) => {
    console.error(chalk.red(`Unhandled rejection: ${reason}`));
    cleanupDevServer();
    setTimeout(() => process.exit(1), 100);
  });
}

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
  // register cleanup handlers only once
  registerCleanupHandlers();

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

    // start the process with improved tracking
    devProcess = execa(cmd, args, {
      cwd: projectPath,
      stdio: ["inherit", "pipe", "pipe"],
      killSignal: "SIGTERM",
      cleanup: true,
      // important: don't use detached mode to ensure process is killed with parent
      detached: false,
    });

    // handle subprocess events
    devProcess.on("exit", (code, signal) => {
      const exitMessage = signal
        ? `Development server was terminated by signal: ${signal}`
        : `Development server exited with code: ${code}`;
      console.log(chalk.cyan(exitMessage));

      // clear the reference to allow garbage collection
      devProcess = null;
    });

    devProcess.on("error", (err) => {
      console.error(chalk.red(`Development server error: ${err.message}`));
      devProcess = null;
    });

    // log any stderr output from the subprocess that might indicate problems
    devProcess.stderr.on("data", (data) => {
      const errorOutput = data.toString().trim();
      if (errorOutput && errorOutput.toLowerCase().includes("error")) {
        console.error(chalk.red(`Server error: ${errorOutput}`));
      }
    });

    checkServerAndOpenBrowser(devUrl);

    return devProcess;
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
