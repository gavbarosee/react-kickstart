import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class GitStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "initGit",
      stepNumber: 8, // Will be adjusted based on framework
      totalSteps: 9,
      title: "Git Options",
      icon: "🔄",
    });
  }

  // Adjust step number based on framework
  execute(answers) {
    const stepNum = answers.framework === "nextjs" ? 8 : 8;
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
    return "Initialize a git repository?";
  }

  getDefault(answers) {
    if (answers.initGit !== undefined) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.initGit);
    }
    return 0; // Default to Yes
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "stateManagement";
    return "editor";
  }
}
