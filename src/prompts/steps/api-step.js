import chalk from "chalk";

import { BaseStep } from "./base-step.js";
import { UI_UTILS } from "../../utils/index.js";

export class ApiStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "api",
      stepNumber: 8,
      totalSteps: 12,
      title: "API & Data Fetching",
      icon: "",
    });
  }

  // Step number is always 8 regardless of framework
  execute(answers) {
    // Both paths: StateManagement(7) -> API(8)
    const stepNum = 8;
    this.stepNumber = stepNum;
    return super.execute(answers);
  }

  getChoices(answers) {
    return [
      {
        name:
          chalk.white("Axios + React Query") +
          chalk.dim(" - Complete API setup with smart caching"),
        value: "axios-react-query",
      },
      {
        name:
          chalk.white("Axios") +
          chalk.dim(" - HTTP client with interceptors and error handling"),
        value: "axios-only",
      },
      {
        name:
          chalk.white("Fetch + React Query") +
          chalk.dim(" - Native fetch with caching layer"),
        value: "fetch-react-query",
      },
      {
        name: chalk.white("Fetch") + chalk.dim(" - Native fetch API with custom hooks"),
        value: "fetch-only",
      },
      {
        name: chalk.dim("Skip - I'll handle API setup myself"),
        value: "none",
      },
    ];
  }

  getMessage() {
    return "Setup API boilerplate?";
  }

  getDefault(answers) {
    if (answers.api !== undefined) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.api);
    }
    return 0; // Default to Axios + React Query
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "stateManagement";
    return "testing";
  }

  /**
   * Override execute to add inline warnings
   */
  async execute(answers) {
    const result = await super.execute(answers);

    // Show inline warnings for potentially redundant combinations
    if (result.selection && result.selection !== "BACK") {
      this.showInlineWarnings(result.selection, answers);
    }

    return result;
  }

  /**
   * Show inline warnings for API + State Management combinations
   */
  showInlineWarnings(apiSelection, answers) {
    if (apiSelection && apiSelection.includes("react-query")) {
      if (answers.stateManagement === "redux") {
        console.log();
        UI_UTILS.warning(
          "React Query + Redux detected. React Query handles server state very well - consider using Redux only for client-side state.",
        );
      } else if (answers.stateManagement === "zustand") {
        console.log();
        UI_UTILS.warning(
          "React Query + Zustand detected. Consider using Zustand primarily for client-side application state.",
        );
      }
    }
  }
}
