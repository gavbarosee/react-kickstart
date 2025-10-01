import chalk from "chalk";

import { BaseStep } from "./base-step.js";

export class StylingStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "styling",
      stepNumber: 6,
      totalSteps: 12,
      title: "Styling Solution",
      icon: "",
    });
  }

  // Step number is always 6 regardless of framework
  execute(answers) {
    // Both paths: CodeQuality(5) -> Styling(6)
    const stepNum = 6;
    this.stepNumber = stepNum;
    return super.execute(answers);
  }

  getChoices(answers) {
    return [
      {
        name: chalk.white("Tailwind CSS") + chalk.dim(" - Utility-first CSS framework"),
        value: "tailwind",
      },
      {
        name: chalk.white("styled-components") + chalk.dim(" - CSS-in-JS library"),
        value: "styled-components",
      },
      {
        name: chalk.white("Plain CSS") + chalk.dim(" - No additional dependencies"),
        value: "css",
      },
    ];
  }

  getMessage() {
    return "Which styling solution would you like to use?";
  }

  getDefault(answers) {
    if (answers.styling) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.styling);
    }
    return 0; // Default to Tailwind
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "codeQuality";
    return "stateManagement";
  }
}
