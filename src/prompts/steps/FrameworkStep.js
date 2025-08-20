import chalk from "chalk";
import { BaseStep } from "./BaseStep.js";

export class FrameworkStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "framework",
      stepNumber: 2,
      totalSteps: 9,
      title: "Framework Selection",
      icon: "🚀",
    });
  }

  getChoices(answers) {
    return [
      {
        name: chalk.yellow("⚡ Vite") + " - Fast dev server, optimized builds",
        value: "vite",
      },
      {
        name: chalk.blue("▲  Next.js") + " - SSR, full-stack framework",
        value: "nextjs",
      },
    ];
  }

  getMessage() {
    return "Which framework would you like to use?";
  }

  getDefault(answers) {
    if (answers.framework) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.framework);
    }
    return 0;
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "packageManager";

    if (selection === "nextjs") {
      return "nextjsOptions";
    } else {
      return "routing";
    }
  }
}
