import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class StateManagementStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "stateManagement",
      stepNumber: 7, // Will be adjusted based on framework
      totalSteps: 9,
      title: "State Management",
      icon: "📦",
    });
  }

  // Adjust step number based on framework
  execute(answers) {
    const stepNum = answers.framework === "nextjs" ? 7 : 7;
    this.stepNumber = stepNum;
    return super.execute(answers);
  }

  getChoices(answers) {
    return [
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
    ];
  }

  getMessage() {
    return "Would you like to add global state management?";
  }

  getDefault(answers) {
    if (answers.stateManagement !== undefined) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.stateManagement);
    }
    return 2; // Default to None
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "styling";
    return "git";
  }
}
