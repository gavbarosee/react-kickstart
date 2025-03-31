import execa from "execa";
import chalk from "chalk";
import open from "open";
import ora from "ora";
import path from "path";
import { getFrameworkInfo } from "./completion.js";

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

    // handle termination signals
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);

    // handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error(chalk.red(`Uncaught exception: ${err.message}`));
      cleanup();
      process.exit(1);
    });

    // after a short delay to let the server start, open the browser
    setTimeout(async () => {
      try {
        await open(devUrl);
        // add a small delay to see if we get an error
        await new Promise((resolve) => setTimeout(resolve, 500));
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
    }, 1500);

    console.log(
      chalk.cyan(`\nIf the browser doesn't open automatically, visit:`)
    );
    console.log(chalk.bold.underline(`${devUrl}`));
    console.log();

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
