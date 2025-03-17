import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { section } from "./utils/logger.js";

export async function promptUser() {
  const answers = {};
  const history = [];

  // clear terminal and show header
  function refreshDisplay() {
    process.stdout.write("\x1Bc");

    console.log();
    console.log(
      chalk.blue(
        figlet.textSync("React Kickstart", {
          font: "Standard",
          horizontalLayout: "full",
        })
      )
    );
    console.log();
    console.log(
      chalk.cyan("  A modern CLI tool for creating React applications")
    );
    console.log(
      chalk.cyan("  ------------------------------------------------")
    );
    console.log();

    // Show a compact summary of previous selections
    if (Object.keys(answers).length > 0) {
      console.log(chalk.bgCyan("  Your selections so far:"));

      if (answers.packageManager) {
        console.log(
          `  ${chalk.dim("•")} Package Manager: ${chalk.green(
            answers.packageManager
          )}`
        );
      }

      if (answers.framework) {
        console.log(
          `  ${chalk.dim("•")} Framework: ${chalk.yellow(answers.framework)}`
        );
      }

      if (answers.framework === "nextjs" && answers.nextRouting) {
        console.log(
          `  ${chalk.dim("•")} Next.js Routing: ${chalk.blue(
            answers.nextRouting
          )}`
        );
      }

      if (answers.typescript !== undefined) {
        console.log(
          `  ${chalk.dim("•")} TypeScript: ${
            answers.typescript ? chalk.green("Yes") : chalk.red("No")
          }`
        );
      }

      if (answers.linting !== undefined) {
        console.log(
          `  ${chalk.dim("•")} Linting: ${
            answers.linting ? chalk.green("Yes") : chalk.red("No")
          }`
        );
      }

      if (answers.styling) {
        console.log(
          `  ${chalk.dim("•")} Styling: ${chalk.magenta(answers.styling)}`
        );
      }

      if (answers.initGit !== undefined) {
        console.log(
          `  ${chalk.dim("•")} Git Init: ${
            answers.initGit ? chalk.green("Yes") : chalk.red("No")
          }`
        );
      }

      if (answers.openEditor !== undefined) {
        console.log(
          `  ${chalk.dim("•")} Open in Editor: ${
            answers.openEditor ? chalk.green("Yes") : chalk.red("No")
          }`
        );

        if (answers.openEditor && answers.editor) {
          console.log(
            `  ${chalk.dim("•")} Editor: ${chalk.blue(answers.editor)}`
          );
        }
      }

      if (answers.autoStart !== undefined) {
        console.log(
          `  ${chalk.dim("•")} Auto-Start: ${
            answers.autoStart ? chalk.green("Yes") : chalk.red("No")
          }`
        );

        if (answers.autoStart && answers.browser) {
          const browserName =
            answers.browser === "default"
              ? "System Default"
              : answers.browser.charAt(0).toUpperCase() +
                answers.browser.slice(1);
          console.log(
            `  ${chalk.dim("•")} Browser: ${chalk.blue(browserName)}`
          );
        }
      }

      console.log();
    }
  }

  async function packageManagerPrompt() {
    refreshDisplay();
    section(`Step 1/8: Package Manager`);

    const { packageManager } = await inquirer.prompt([
      {
        type: "list",
        name: "packageManager",
        message: "Which package manager would you like to use?",
        choices: [
          { name: chalk.green("📦 npm"), value: "npm" },
          { name: chalk.blue("🧶 yarn"), value: "yarn" },
        ],
        default: answers.packageManager || "npm",
      },
    ]);

    answers.packageManager = packageManager;
    history.push("packageManager");
    return frameworkPrompt();
  }

  async function frameworkPrompt() {
    refreshDisplay();
    section(`Step 2/8: Framework Selection`);

    const choices = [
      {
        name: chalk.yellow("⚡ Vite") + " - Fast dev server, optimized builds",
        value: "vite",
      },
      {
        name: chalk.blue("▲  Next.js") + " - SSR, full-stack framework",
        value: "nextjs",
      },
      {
        name: chalk.cyan("🚀 Rsbuild") + " - Performance-focused bundler",
        value: "rsbuild",
      },
      {
        name: chalk.magenta("📦 Parcel") + " - Zero-configuration bundler",
        value: "parcel",
      },
    ];

    // add back option (except for first step)
    choices.push(new inquirer.Separator());
    choices.push({
      name: chalk.yellow("← Back to previous step"),
      value: "BACK_OPTION",
    });

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Which framework would you like to use?",
        choices: choices,
        default: function () {
          if (answers.framework) {
            return choices.findIndex((c) => c.value === answers.framework);
          }
          return 0;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return packageManagerPrompt();
    }

    answers.framework = selection;
    history.push("framework");

    if (selection === "nextjs") {
      return nextjsOptionsPrompt();
    } else {
      return languageOptionsPrompt();
    }
  }

  async function nextjsOptionsPrompt() {
    refreshDisplay();
    section(`Step 3/8: Next.js Options`);

    const choices = [
      {
        name: chalk.cyan("App Router") + " - Newer, supports Server Components",
        value: "app",
      },
      {
        name: chalk.blue("Pages Router") + " - Traditional routing system",
        value: "pages",
      },
      new inquirer.Separator(),
      {
        name: chalk.yellow("← Back to previous step"),
        value: "BACK_OPTION",
      },
    ];

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Which Next.js routing system would you like to use?",
        choices: choices,
        default: function () {
          if (answers.nextRouting) {
            return choices.findIndex((c) => c.value === answers.nextRouting);
          }
          return 0;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return frameworkPrompt();
    }

    answers.nextRouting = selection;
    history.push("nextRouting");
    return languageOptionsPrompt();
  }

  async function languageOptionsPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 4 : 3;
    section(`Step ${stepNum}/8: Language Options`);

    const choices = [
      { name: chalk.green("Yes"), value: true },
      { name: chalk.red("No"), value: false },
      new inquirer.Separator(),
      {
        name: chalk.yellow("← Back to previous step"),
        value: "BACK_OPTION",
      },
    ];

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Would you like to use TypeScript?",
        choices: choices,
        default: function () {
          if (answers.typescript !== undefined) {
            return choices.findIndex((c) => c.value === answers.typescript);
          }
          return 1;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      if (answers.framework === "nextjs") {
        return nextjsOptionsPrompt();
      } else {
        return frameworkPrompt();
      }
    }

    answers.typescript = selection;
    history.push("typescript");
    return codeQualityPrompt();
  }

  async function codeQualityPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 5 : 4;
    section(`Step ${stepNum}/8: Code Quality`);

    const choices = [
      { name: chalk.green("Yes"), value: true },
      { name: chalk.red("No"), value: false },
      new inquirer.Separator(),
      {
        name: chalk.yellow("← Back to previous step"),
        value: "BACK_OPTION",
      },
    ];

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message:
          "Would you like to include ESLint and Prettier for code quality?",
        choices: choices,
        default: function () {
          if (answers.linting !== undefined) {
            return choices.findIndex((c) => c.value === answers.linting);
          }
          return 0;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return languageOptionsPrompt();
    }

    answers.linting = selection;
    history.push("linting");
    return stylingSolutionPrompt();
  }

  async function stylingSolutionPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 6 : 5;
    section(`Step ${stepNum}/8: Styling Solution`);

    const choices = [
      {
        name: chalk.cyan("🎨 Tailwind CSS") + " - Utility-first CSS framework",
        value: "tailwind",
      },
      {
        name: chalk.magenta("💅 styled-components") + " - CSS-in-JS library",
        value: "styled-components",
      },
      {
        name: chalk.blue("📝 Plain CSS") + " - No additional dependencies",
        value: "css",
      },
      new inquirer.Separator(),
      {
        name: chalk.yellow("← Back to previous step"),
        value: "BACK_OPTION",
      },
    ];

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Which styling solution would you like to use?",
        choices: choices,
        default: function () {
          if (answers.styling) {
            return choices.findIndex((c) => c.value === answers.styling);
          }
          return 0;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return codeQualityPrompt();
    }

    answers.styling = selection;
    history.push("styling");
    return gitOptionsPrompt();
  }

  async function gitOptionsPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 7 : 6;
    section(`Step ${stepNum}/8: Git Options`);

    const choices = [
      { name: chalk.green("Yes"), value: true },
      { name: chalk.red("No"), value: false },
      new inquirer.Separator(),
      {
        name: chalk.yellow("← Back to previous step"),
        value: "BACK_OPTION",
      },
    ];

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Initialize a git repository?",
        choices: choices,
        default: function () {
          if (answers.initGit !== undefined) {
            return choices.findIndex((c) => c.value === answers.initGit);
          }
          return 0;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return stylingSolutionPrompt();
    }

    answers.initGit = selection;
    history.push("gitInit");
    return editorOptionsPrompt();
  }

  async function autoStartPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 9 : 8;
    section(`Step ${stepNum}/9: Auto Start`);

    const choices = [
      {
        name: chalk.green("Yes") + " - Start development server after setup",
        value: true,
      },
      { name: chalk.red("No") + " - I'll start it manually", value: false },
      new inquirer.Separator(),
      {
        name: chalk.yellow("← Back to previous step"),
        value: "BACK_OPTION",
      },
    ];

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message:
          "Would you like to automatically start the development server after creation?",
        choices: choices,
        default: function () {
          if (answers.autoStart !== undefined) {
            return choices.findIndex((c) => c.value === answers.autoStart);
          }
          return 1;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return editorOptionsPrompt();
    }

    answers.autoStart = selection;
    history.push("autoStart");

    if (answers.autoStart) {
      return browserSelectionPrompt();
    }

    refreshDisplay();
    console.log(
      chalk.green("\n✓ Configuration complete! Here's your full setup:\n")
    );

    return answers;
  }

  async function browserSelectionPrompt() {
    // only show this prompt if auto-start is enabled
    if (!answers.autoStart) {
      return answers;
    }

    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 10 : 9;
    section(`Step ${stepNum}/10: Browser Selection`);

    // create browser options with platform-specific variations
    const browserChoices = [
      {
        name: chalk.blue("System Default") + " - Use your default browser",
        value: "default",
      },
      { name: chalk.yellow("Google Chrome"), value: "chrome" },
      { name: chalk.red("Firefox"), value: "firefox" },
    ];

    // platform-specific browsers
    if (process.platform === "darwin") {
      browserChoices.push({ name: chalk.blue("Safari"), value: "safari" });
    }

    if (process.platform === "win32") {
      browserChoices.push({
        name: chalk.blue("Microsoft Edge"),
        value: "edge",
      });
    }

    // add back option
    browserChoices.push(new inquirer.Separator());
    browserChoices.push({
      name: chalk.yellow("← Back to previous step"),
      value: "BACK_OPTION",
    });

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Which browser would you like to use when auto-starting?",
        choices: browserChoices,
        default: function () {
          if (answers.browser) {
            return browserChoices.findIndex((c) => c.value === answers.browser);
          }
          return 0;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return autoStartPrompt();
    }

    answers.browser = selection;
    history.push("browser");

    refreshDisplay();
    console.log(
      chalk.green("\n✓ Configuration complete! Here's your full setup:\n")
    );

    return answers;
  }

  async function editorOptionsPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 8 : 7;
    section(`Step ${stepNum}/8: Editor Options`);

    const choices = [
      { name: chalk.green("Yes"), value: true },
      { name: chalk.red("No"), value: false },
      new inquirer.Separator(),
      {
        name: chalk.yellow("← Back to previous step"),
        value: "BACK_OPTION",
      },
    ];

    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message:
          "Would you like to open the project in an editor after creation?",
        choices: choices,
        default: function () {
          if (answers.openEditor !== undefined) {
            return choices.findIndex((c) => c.value === answers.openEditor);
          }
          return 1;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return gitOptionsPrompt();
    }

    answers.openEditor = selection;

    if (answers.openEditor) {
      const { editor } = await inquirer.prompt([
        {
          type: "list",
          name: "editor",
          message: "Which editor would you like to use?",
          choices: [
            { name: chalk.blue("Visual Studio Code"), value: "vscode" },
            { name: chalk.cyan("Cursor"), value: "cursor" },
          ],
          default: answers.editor || "vscode",
        },
      ]);
      answers.editor = editor;
    }

    history.push("editorOptions");

    // refreshDisplay();
    // console.log(
    //   chalk.green("\n✓ Configuration complete! Here's your full setup:\n")
    // );

    // return answers;
    return autoStartPrompt();
  }

  refreshDisplay();

  return packageManagerPrompt();
}

// fn to get default choices (used when --yes flag is provided)
export function getDefaultChoices() {
  return {
    packageManager: "npm",
    framework: "vite",
    typescript: false,
    linting: true,
    styling: "tailwind",
    initGit: true,
    openEditor: false,
    editor: "vscode",
    autoStart: false,
    browser: "default",
  };
}
