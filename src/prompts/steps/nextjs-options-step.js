import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class NextjsOptionsStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "nextRouting",
      stepNumber: 3,
      totalSteps: 9,
      title: "Next.js Options",
      icon: "▲ ",
    });
  }

  getChoices(answers) {
    return [
      {
        name: chalk.cyan("App Router") + " - Newer, supports Server Components",
        value: "app",
      },
      {
        name: chalk.blue("Pages Router") + " - Traditional routing system",
        value: "pages",
      },
    ];
  }

  getMessage() {
    return "Which Next.js routing system would you like to use?";
  }

  getDefault(answers) {
    if (answers.nextRouting) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.nextRouting);
    }
    return 0;
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "framework";
    return "language";
  }
}
