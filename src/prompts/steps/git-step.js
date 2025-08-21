import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class GitStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "initGit",
      stepNumber: 10,
      totalSteps: 11,
      title: "Git Options",
      icon: "🔄",
    });
  }

  // Step number is always 10 regardless of framework
  execute(answers) {
    // Both paths: Testing(9) -> Git(10)
    const stepNum = 10;
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
    if (selection === "BACK") return "testing";
    return "editor";
  }
}
