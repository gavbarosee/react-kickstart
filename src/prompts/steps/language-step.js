import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class LanguageStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "typescript",
      stepNumber: 4, // Will be adjusted based on framework
      totalSteps: 10,
      title: "Language Options",
      icon: "🔤",
    });
  }

  // Adjust step number based on framework
  execute(answers) {
    const stepNum = answers.framework === "nextjs" ? 4 : 4;
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
    return "Would you like to use TypeScript?";
  }

  getDefault(answers) {
    if (answers.typescript !== undefined) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.typescript);
    }
    return 1; // Default to No
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") {
      if (answers.framework === "nextjs") {
        return "nextjsOptions";
      } else {
        return "routing";
      }
    }
    return "codeQuality";
  }
}
