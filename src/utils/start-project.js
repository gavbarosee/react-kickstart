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

    // flag to prevent concurrent cleanup operations
    let isCleanupInProgress = false;

    const subprocess = execa(cmd, args, {
      cwd: projectPath,
      stdio: ["inherit", "pipe", "pipe"],
      killSignal: "SIGTERM", // ensure we use SIGTERM by default
      cleanup: true, // kill process and all its child processes
      detached: false, // don't detach from parent process
    });

    const cleanup = async () => {
      if (isCleanupInProgress) return;
      isCleanupInProgress = true;

      if (subprocess && !subprocess.killed) {
        console.log(chalk.yellow("\nStopping development server..."));

        try {
          // first try SIGTERM
          subprocess.kill("SIGTERM");

          // wait for up to 3 seconds for graceful termination
          const terminated = await Promise.race([
            new Promise((resolve) => {
              subprocess.once("exit", () => resolve(true));
              subprocess.once("error", () => resolve(true)); // consider errors as "terminated"
            }),
            new Promise((resolve) => setTimeout(() => resolve(false), 3000)),
          ]);

          // if not terminated gracefully, force kill with SIGKILL
          if (!terminated && !subprocess.killed) {
            console.log(
              chalk.yellow(
                "Development server did not terminate gracefully, forcing exit..."
              )
            );
            subprocess.kill("SIGKILL");
          }
        } catch (err) {
          console.error(
            chalk.red(`Error while terminating process: ${err.message}`)
          );

          // last resort: try to kill by process ID if we have it
          try {
            if (subprocess.pid) {
              process.kill(subprocess.pid, "SIGKILL");
            }
          } catch (killError) {
            console.error(
              chalk.red(`Failed to force kill process: ${killError.message}`)
            );
          }
        }
      }

      // always clean up the listeners regardless of subprocess termination success
      removeAllListeners();
      isCleanupInProgress = false;
    };

    // enhanced signal handlers that are async to handle the cleanup promises
    const handleSigInt = async () => {
      await cleanup();
      // use a small delay to allow cleanup logs to be printed
      setTimeout(() => process.exit(0), 100);
    };

    const handleSigTerm = async () => {
      await cleanup();
      setTimeout(() => process.exit(0), 100);
    };

    const handleExit = async () => {
      await cleanup();
    };

    const handleUncaughtException = async (err) => {
      console.error(chalk.red(`Uncaught exception: ${err.message}`));
      await cleanup();
      setTimeout(() => process.exit(1), 100);
    };

    const handleUnhandledRejection = async (reason, promise) => {
      console.error(
        chalk.red(`Unhandled rejection at:`),
        promise,
        chalk.red(`reason:`),
        reason
      );
      await cleanup();
      setTimeout(() => process.exit(1), 100);
    };

    // add event listeners
    process.on("SIGINT", handleSigInt);
    process.on("SIGTERM", handleSigTerm);
    process.on("exit", handleExit);
    process.on("uncaughtException", handleUncaughtException);
    process.on("unhandledRejection", handleUnhandledRejection);

    // remove all listeners
    const removeAllListeners = () => {
      process.removeListener("SIGINT", handleSigInt);
      process.removeListener("SIGTERM", handleSigTerm);
      process.removeListener("exit", handleExit);
      process.removeListener("uncaughtException", handleUncaughtException);
      process.removeListener("unhandledRejection", handleUnhandledRejection);
    };

    // handle subprocess-specific events
    subprocess.on("exit", (code, signal) => {
      const exitMessage = signal
        ? `Development server was terminated by signal: ${signal}`
        : `Development server exited with code: ${code}`;
      console.log(chalk.cyan(exitMessage));
      removeAllListeners();
    });

    subprocess.on("error", (err) => {
      console.error(chalk.red(`Development server error: ${err.message}`));
      cleanup();
    });

    // log any stderr output from the subprocess that might indicate problems
    subprocess.stderr.on("data", (data) => {
      const errorOutput = data.toString().trim();
      if (errorOutput && errorOutput.toLowerCase().includes("error")) {
        console.error(chalk.red(`Server error: ${errorOutput}`));
      }
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
