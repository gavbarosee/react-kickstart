import { execa } from "execa";
import chalk from "chalk";
import open from "open";
import ora from "ora";
import path from "path";
import { getFrameworkDocumentation } from "../ui/completion.js";
import { createErrorHandler, ERROR_TYPES } from "../../errors/index.js";

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
 * Legacy cleanup handlers - now replaced by centralized ErrorHandler
 * @deprecated Use ErrorHandler.setupGlobalHandlers() instead
 */
function registerCleanupHandlers() {
  // Only register dev server cleanup, global handlers are managed centrally
  process.on("exit", cleanupDevServer);
  process.on("SIGINT", cleanupDevServer);
  process.on("SIGTERM", cleanupDevServer);
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
  const errorHandler = createErrorHandler();
  const userReporter = errorHandler.userReporter;

  errorHandler.setContext({
    projectPath,
    framework: userChoices.framework,
    packageManager: userChoices.packageManager,
  });

  // Use centralized error handlers instead of local ones
  errorHandler.setupGlobalHandlers();

  const spinner = ora({
    text: `Starting development server...`,
    color: "green",
    spinner: "dots",
  }).start();

  return errorHandler.withErrorHandling(
    async () => {
      const frameworkInfo = getFrameworkDocumentation(userChoices.framework);
      const devUrl = `http://localhost:${frameworkInfo.port}`;

      const pmRun = userChoices.packageManager === "yarn" ? "yarn" : "npm run";
      const devCommand = false ? "npm start" : `${pmRun} dev`;

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

      // handle subprocess events with standardized error reporting
      devProcess.on("exit", (code, signal) => {
        const exitMessage = signal
          ? `Development server was terminated by signal: ${signal}`
          : `Development server exited with code: ${code}`;
        console.log(chalk.cyan(exitMessage));

        // clear the reference to allow garbage collection
        devProcess = null;
      });

      devProcess.on("error", (err) => {
        userReporter.reportProcessError(err);
        devProcess = null;
      });

      // log any stderr output from the subprocess that might indicate problems
      devProcess.stderr.on("data", (data) => {
        const errorOutput = data.toString().trim();
        if (errorOutput && errorOutput.toLowerCase().includes("error")) {
          userReporter.formatError("Development Server Error", errorOutput, [
            "Check if the port is available",
            "Ensure all dependencies are installed",
          ]);
        }
      });

      checkServerAndOpenBrowser(devUrl);

      return devProcess;
    },
    {
      type: ERROR_TYPES.PROCESS,
      showRecovery: true,
      onError: async (error) => {
        spinner.fail(`Failed to start development server`);

        // Show manual start instructions
        const pmRun =
          userChoices.packageManager === "yarn" ? "yarn" : "npm run";
        const devCommand = false ? "npm start" : `${pmRun} dev`;

        userReporter.formatError(
          "Development Server Failed",
          error.message || error,
          [
            `cd ${path.basename(projectPath || ".")}`,
            devCommand,
            "Check that all dependencies are installed",
            "Ensure the port is not already in use",
          ]
        );

        return null;
      },
    }
  );
}
