import chalk from "chalk";
import { execa } from "execa";
import inquirer from "inquirer";

import { BaseStep } from "./base-step.js";
import { UI_UTILS } from "../../utils/index.js";

export class EditorStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "openEditor",
      stepNumber: 12,
      totalSteps: 12,
      title: "Editor Options",
      icon: "",
    });
  }

  // Step number is always 12 regardless of framework
  execute(answers) {
    // Both paths: Git(10) -> Deployment(11) -> Editor(12)
    const stepNum = 12;
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
    if (selection === "BACK") return "deployment";
    return "complete";
  }

  // Override to handle editor selection if user chose yes
  async execute(answers) {
    const result = await super.execute(answers);

    // If user selected "Yes" to open editor, prompt for editor choice
    if (result.selection === true) {
      const resolveEditorCommand = (ed) => {
        if (ed === "vscode") return process.platform === "win32" ? "code.cmd" : "code";
        if (ed === "cursor")
          return process.platform === "win32" ? "cursor.cmd" : "cursor";
        return null;
      };

      const isEditorAvailable = async (ed) => {
        const cmd = resolveEditorCommand(ed);
        if (!cmd) return false;
        try {
          await execa(cmd, ["--version"], { stdio: "ignore" });
          return true;
        } catch (_) {
          return false;
        }
      };

      const available = {
        cursor: await isEditorAvailable("cursor"),
        vscode: await isEditorAvailable("vscode"),
      };

      const choices = [];
      if (available.cursor)
        choices.push({ name: chalk.cyan("Cursor"), value: "cursor" });
      if (available.vscode)
        choices.push({
          name: chalk.blue("Visual Studio Code"),
          value: "vscode",
        });

      if (choices.length === 0) {
        UI_UTILS.warning("No supported editor detected in PATH (Cursor or VS Code).");
        UI_UTILS.warning("You can open the project manually after setup.");
        answers.openEditor = false;
      } else {
        UI_UTILS.log(
          `Detected editors: ${[
            available.cursor ? "Cursor" : null,
            available.vscode ? "VS Code" : null,
          ]
            .filter(Boolean)
            .join(", ")}`,
        );

        const { editor } = await inquirer.prompt([
          {
            type: "list",
            name: "editor",
            message: "Which editor would you like to use?",
            choices,
            default:
              answers.editor && choices.find((c) => c.value === answers.editor)
                ? answers.editor
                : choices[0].value,
          },
        ]);
        answers.editor = editor;
      }
    }

    // Set autoStart to true (as in original code)
    answers.autoStart = true;

    return result;
  }
}
