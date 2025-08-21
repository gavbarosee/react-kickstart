import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class LanguageStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "typescript",
      stepNumber: 4,
      totalSteps: 12,
      title: "Language Options",
      icon: "🔤",
    });
  }

  // Adjust step number based on framework (routing step is skipped for Next.js)
  execute(answers) {
    // Next.js: Package(1) -> Framework(2) -> NextjsOptions(3) -> Language(4)
    // Vite: Package(1) -> Framework(2) -> Routing(3) -> Language(4)
    const stepNum = 4; // Always step 4 since routing/nextjsOptions occupy step 3
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
