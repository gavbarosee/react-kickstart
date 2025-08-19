import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { section } from "./utils/logger.js";
import {
  detectPackageManagers,
  formatPackageManagerChoices,
  getDefaultPackageManager,
} from "./utils/package-manager-detection.js";

export async function promptUser(options = {}) {
  const { verbose = false } = options;
  const answers = {};
  const history = [];

  const packageManagers = await detectPackageManagers({ verbose });
  const defaultPackageManager = getDefaultPackageManager(packageManagers);

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
      console.log(chalk.bgBlue("  Your selections so far:"));

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

      console.log();
    }
  }

  async function packageManagerPrompt() {
    refreshDisplay();
    section(`Step 1/9: Package Manager`);

    const choices = formatPackageManagerChoices(packageManagers);

    // No available package managers and user chose not to proceed with npm
    if (choices.length === 0) {
      console.log(
        chalk.red(
          "No package managers detected. Please install Node.js or Yarn and try again."
        )
      );
      process.exit(1);
    }

    if (history.length > 0) {
      choices.push(new inquirer.Separator());
      choices.push({
        name: chalk.yellow("← Back to previous step"),
        value: "BACK_OPTION",
      });
    }

    const { packageManager } = await inquirer.prompt([
      {
        type: "list",
        name: "packageManager",
        message: "Which package manager would you like to use?",
        choices: choices,
        default: answers.packageManager || defaultPackageManager || "npm",
      },
    ]);

    if (packageManager === "BACK_OPTION") {
      history.pop();
      return packageManagerPrompt();
    }

    answers.packageManager = packageManager;
    history.push("packageManager");
    return frameworkPrompt();
  }

  async function frameworkPrompt() {
    refreshDisplay();
    section(`Step 2/9: Framework Selection`);

    const choices = [
      {
        name: chalk.yellow("⚡ Vite") + " - Fast dev server, optimized builds",
        value: "vite",
      },
      {
        name: chalk.blue("▲  Next.js") + " - SSR, full-stack framework",
        value: "nextjs",
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
      return routingOptionsPrompt();
    }
  }

  async function routingOptionsPrompt() {
    refreshDisplay();

    // skip routing prompt for Next.js since it has its own routing system
    if (answers.framework === "nextjs") {
      return languageOptionsPrompt();
    }

    const stepNum = 3;
    section(`Step ${stepNum}/9: Routing Options`);

    const choices = [
      {
        name:
          chalk.blue("React Router") +
          chalk.gray(" - Popular, comprehensive routing"),
        value: "react-router",
      },
      {
        name: chalk.gray("None") + chalk.gray(" - No routing library"),
        value: "none",
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
        message: "Which routing library would you like to use?",
        choices: choices,
        default: function () {
          if (answers.routing) {
            return choices.findIndex((c) => c.value === answers.routing);
          }
          return 0; // Default to React Router
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return frameworkPrompt();
    }

    answers.routing = selection;
    history.push("routing");
    return languageOptionsPrompt();
  }

  async function nextjsOptionsPrompt() {
    refreshDisplay();
    section(`Step 3/9: Next.js Options`);

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
    section(`Step ${stepNum}/9: Language Options`);

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
    section(`Step ${stepNum}/9: Code Quality`);

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
    section(`Step ${stepNum}/9: Styling Solution`);

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
    return stateManagementPrompt();
  }

  async function stateManagementPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 7 : 6;
    section(`Step ${stepNum}/9: State Management`);

    const choices = [
      {
        name:
          chalk.blue("📦 Redux Toolkit") +
          " - Powerful state management library",
        value: "redux",
      },
      {
        name:
          chalk.green("🐻 Zustand") +
          " - Lightweight state management solution",
        value: "zustand",
      },

      {
        name: chalk.gray("None") + " - No global state management",
        value: "none",
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
        message: "Would you like to add global state management?",
        choices: choices,
        default: function () {
          if (answers.stateManagement !== undefined) {
            return choices.findIndex(
              (c) => c.value === answers.stateManagement
            );
          }
          return 1;
        },
      },
    ]);

    if (selection === "BACK_OPTION") {
      history.pop();
      return stylingSolutionPrompt();
    }

    answers.stateManagement = selection;
    history.push("stateManagement");
    return gitOptionsPrompt();
  }

  async function gitOptionsPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 7 : 6;
    section(`Step ${stepNum}/9: Git Options`);

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
      return stateManagementPrompt();
    }

    answers.initGit = selection;
    history.push("gitInit");
    return editorOptionsPrompt();
  }

  async function editorOptionsPrompt() {
    refreshDisplay();
    const stepNum = answers.framework === "nextjs" ? 8 : 7;
    section(`Step ${stepNum}/9: Editor Options`);

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

    answers.autoStart = true;

    refreshDisplay();
    console.log(
      chalk.green("\n✓ Configuration complete! Here's your full setup:\n")
    );
    console.log(
      chalk.cyan("Note: ") +
        "The project will automatically start in your default browser after creation.\n"
    );

    return answers;
  }

  refreshDisplay();

  return packageManagerPrompt();
}

export function getDefaultChoices() {
  return {
    packageManager: "npm",
    framework: "vite",
    typescript: false,
    linting: true,
    styling: "tailwind",
    routing: "none",
    initGit: true,
    openEditor: false,
    editor: "vscode",
    autoStart: true,
  };
}
