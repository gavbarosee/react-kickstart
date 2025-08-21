import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class StateManagementStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "stateManagement",
      stepNumber: 7,
      totalSteps: 12,
      title: "State Management",
      icon: "📦",
    });
  }

  // Step number is always 7 regardless of framework
  execute(answers) {
    // Both paths: Styling(6) -> StateManagement(7)
    const stepNum = 7;
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
    return "api";
  }
}
