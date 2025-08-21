import chalk from "chalk";
import inquirer from "inquirer";
import { BaseStep } from "./base-step.js";

export class EditorStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "openEditor",
      stepNumber: 11,
      totalSteps: 11,
      title: "Editor Options",
      icon: "📝",
    });
  }

  // Step number is always 11 regardless of framework
  execute(answers) {
    // Both paths: Git(10) -> Editor(11)
    const stepNum = 11;
    this.stepNumber = stepNum;
    return super.execute(answers);
  }

  getChoices(answers) {
    return [
      { name: chalk.green("Yes"), value: true },
      { name: chalk.red("No"), value: false },
    ];
  }

  getMessage() {
    return "Would you like to open the project in an editor after creation?";
  }

  getDefault(answers) {
    if (answers.openEditor !== undefined) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.openEditor);
    }
    return 1; // Default to No
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "git";
    return "complete";
  }

  // Override to handle editor selection if user chose yes
  async execute(answers) {
    const result = await super.execute(answers);

    // If user selected "Yes" to open editor, prompt for editor choice
    if (result.selection === true) {
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

    // Set autoStart to true (as in original code)
    answers.autoStart = true;

    return result;
  }
}
