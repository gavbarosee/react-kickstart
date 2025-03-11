import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";

export async function promptUser() {
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
  console.log(chalk.cyan("  ------------------------------------------------"));
  console.log();

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager would you like to use?",
      choices: [
        { name: chalk.green("📦 npm"), value: "npm" },
        { name: chalk.blue("🧶 yarn"), value: "yarn" },
      ],
      default: "npm",
    },
    {
      type: "list",
      name: "framework",
      message: "Which framework would you like to use?",
      choices: [
        {
          name:
            chalk.yellow("⚡ Vite") + " - Fast dev server, optimized builds",
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
      ],
      default: "vite",
    },
    {
      type: "list",
      name: "nextRouting",
      message: "Which Next.js routing system would you like to use?",
      choices: [
        {
          name:
            chalk.cyan("App Router") + " - Newer, supports Server Components",
          value: "app",
        },
        {
          name: chalk.blue("Pages Router") + " - Traditional routing system",
          value: "pages",
        },
      ],
      default: "app",
      when: (answers) => answers.framework === "nextjs",
    },
    {
      type: "confirm",
      name: "typescript",
      message: "Would you like to use " + chalk.blue("TypeScript") + "?",
      default: false,
    },
    {
      type: "confirm",
      name: "linting",
      message:
        "Would you like to include " +
        chalk.yellow("ESLint and Prettier") +
        " for code quality?",
      default: true,
    },
    {
      type: "list",
      name: "styling",
      message: "Which styling solution would you like to use?",
      choices: [
        {
          name:
            chalk.cyan("🎨 Tailwind CSS") + " - Utility-first CSS framework",
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
      ],
      default: "tailwind",
    },
    {
      type: "confirm",
      name: "initGit",
      message: "Initialize a " + chalk.green("git repository") + "?",
      default: true,
    },
    {
      type: "confirm",
      name: "openEditor",
      message:
        "Would you like to open the project in an editor after creation?",
      default: false,
    },
    {
      type: "list",
      name: "editor",
      message: "Which editor would you like to use?",
      choices: [
        { name: chalk.blue("Visual Studio Code"), value: "vscode" },
        { name: chalk.cyan("Cursor"), value: "cursor" },
      ],
      default: "vscode",
      when: (answers) => answers.openEditor,
    },
  ]);

  return answers;
}
