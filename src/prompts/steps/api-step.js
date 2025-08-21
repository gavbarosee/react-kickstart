import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class ApiStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "api",
      stepNumber: 8,
      totalSteps: 11,
      title: "API & Data Fetching",
      icon: "🌐",
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
          chalk.cyan("🚀 Axios + React Query") +
          " - Complete API setup with smart caching",
        value: "axios-react-query",
      },
      {
        name:
          chalk.blue("⚡ Axios") +
          " - HTTP client with interceptors and error handling",
        value: "axios-only",
      },
      {
        name:
          chalk.green("🔗 Fetch + React Query") +
          " - Native fetch with caching layer",
        value: "fetch-react-query",
      },
      {
        name:
          chalk.magenta("🌐 Fetch") + " - Native fetch API with custom hooks",
        value: "fetch-only",
      },
      {
        name: chalk.gray("Skip") + " - I'll handle API setup myself",
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
}
