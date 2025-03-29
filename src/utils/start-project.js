// Enhanced and simplified version of startProject function
import execa from "execa";
import chalk from "chalk";
import open from "open";
import ora from "ora";
import path from "path";
import { getFrameworkInfo } from "./completion.js";

function getBrowserLaunchOptions(browserChoice) {
  // map user-friendly names to what the 'open' package expects
  const browserMap = {
    default: undefined, // use system default
    chrome: {
      darwin: ["google chrome"], // macOS
      win32: ["chrome"], // windows
      linux: ["google-chrome"], // linux
    },
    firefox: {
      darwin: ["firefox"],
      win32: ["firefox"],
      linux: ["firefox"],
    },
    safari: {
      darwin: ["safari"],
    },
    edge: {
      win32: ["msedge"],
    },
  };

  // if it's the default browser, return undefined to let 'open' use the system default
  if (browserChoice === "default") {
    return undefined;
  }

  // get platform-specific browser names
  const platformBrowsers = browserMap[browserChoice]?.[process.platform];

  // if we have a mapping for this browser on this platform
  if (platformBrowsers && platformBrowsers.length > 0) {
    return { app: { name: platformBrowsers } };
  }

  // fallback - try using the browser name directly
  return { app: { name: browserChoice } };
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

    // after a short delay to let the server start, open the browser
    setTimeout(async () => {
      // Always use default browser
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
