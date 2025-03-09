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
        { name: "npm", value: "npm" },
        { name: "yarn", value: "yarn" },
      ],
      default: "npm",
    },
    {
      type: "list",
      name: "framework",
      message: "Which framework would you like to use?",
      choices: [
        { name: "Vite", value: "vite" },
        { name: "Next.js", value: "nextjs" },
        { name: "Rsbuild", value: "rsbuild" },
        { name: "Parcel", value: "parcel" },
      ],
      default: "vite",
    },
    {
      type: "list",
      name: "nextRouting",
      message: "Which Next.js routing system would you like to use?",
      choices: [
        {
          name: "App Router (newer, supports Server Components)",
          value: "app",
        },
        { name: "Pages Router (traditional)", value: "pages" },
      ],
      default: "app",
      when: (answers) => answers.framework === "nextjs",
    },
    {
      type: "confirm",
      name: "typescript",
      message: "Would you like to use TypeScript?",
      default: false,
    },
    {
      type: "confirm",
      name: "linting",
      message:
        "Would you like to include ESLint and Prettier for code quality?",
      default: true,
    },
    {
      type: "list",
      name: "styling",
      message: "Which styling solution would you like to use?",
      choices: [
        { name: "Tailwind CSS", value: "tailwind" },
        { name: "styled-components", value: "styled-components" },
        { name: "None (plain CSS)", value: "css" },
      ],
      default: "tailwind",
    },
    {
      type: "confirm",
      name: "initGit",
      message: "Initialize a git repository?",
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
        { name: "Visual Studio Code", value: "vscode" },
        { name: "Cursor", value: "cursor" },
      ],
      default: "vscode",
      when: (answers) => answers.openEditor,
    },
  ]);

  return answers;
}
