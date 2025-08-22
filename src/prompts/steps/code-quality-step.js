import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class CodeQualityStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "linting",
      stepNumber: 5,
      totalSteps: 12,
      title: "Code Quality",
      icon: "",
    });
  }

  // Step number is always 5 regardless of framework
  execute(answers) {
    // Both paths: Language(4) -> CodeQuality(5)
    const stepNum = 5;
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
    return "Would you like to include ESLint and Prettier for code quality?";
  }

  getDefault(answers) {
    if (answers.linting !== undefined) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.linting);
    }
    return 0; // Default to Yes
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "language";
    return "styling";
  }
}
