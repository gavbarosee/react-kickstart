import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class StylingStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "styling",
      stepNumber: 6, // Will be adjusted based on framework
      totalSteps: 11,
      title: "Styling Solution",
      icon: "🎨",
    });
  }

  // Adjust step number based on framework
  execute(answers) {
    const stepNum = answers.framework === "nextjs" ? 6 : 6;
    this.stepNumber = stepNum;
    return super.execute(answers);
  }

  getChoices(answers) {
    return [
      {
        name: chalk.cyan("🎨 Tailwind CSS") + " - Utility-first CSS framework",
        value: "tailwind",
      },
      {
        name: chalk.magenta("💅 styled-components") + " - CSS-in-JS library",
        value: "styled-components",
      },
      {
        name: chalk.blue("📝 Plain CSS") + " - No additional dependencies",
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
