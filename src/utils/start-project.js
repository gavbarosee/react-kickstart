import execa from "execa";
import chalk from "chalk";
import open from "open";
import ora from "ora";
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
  if (!userChoices.autoStart) return;

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
      stdio: "inherit",
      shell: true,
    });

    // after a short delay to let the server start, open the browser
    setTimeout(async () => {
      const browserName =
        userChoices.browser === "default"
          ? "default browser"
          : userChoices.browser;

      let appOptions = undefined;

      if (userChoices.browser !== "default") {
        // map browser names to what the 'open' package expects
        const browserMap = {
          chrome: process.platform === "darwin" ? "google chrome" : "chrome",
          firefox: "firefox",
          safari: "safari",
          edge: "microsoft-edge",
        };

        appOptions = {
          app: { name: browserMap[userChoices.browser] || userChoices.browser },
        };
      }

      try {
        await open(devUrl, appOptions);
        // add a small delay to see if we get an error
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.log(
          chalk.yellow(
            `\nCouldn't open ${browserName}. It might not be installed or properly configured.`
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
      chalk.cyan("You can start it manually with the commands shown above.")
    );
    return null;
  }
}
