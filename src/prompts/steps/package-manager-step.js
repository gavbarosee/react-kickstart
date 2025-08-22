import chalk from "chalk";
import { BaseStep } from "./base-step.js";
import { PROCESS_UTILS } from "../../utils/index.js";

export class PackageManagerStep extends BaseStep {
  constructor(renderer, navigator, packageManagers, defaultPackageManager) {
    super(renderer, navigator);
    this.packageManagers = packageManagers;
    this.defaultPackageManager = defaultPackageManager;
    this.configure({
      stepName: "packageManager",
      stepNumber: 1,
      totalSteps: 12,
      title: "Package Manager",
      icon: "",
    });
  }

  getChoices(answers) {
    return PROCESS_UTILS.formatPackageManagerChoices(this.packageManagers);
  }

  getMessage() {
    return "Which package manager would you like to use?";
  }

  getDefault(answers) {
    if (answers.packageManager) {
      const choices = this.getChoices(answers);
      const index = choices.findIndex(
        (c) => c.value === answers.packageManager
      );
      return index >= 0 ? index : 0;
    }
    // Find default package manager in choices
    const choices = this.getChoices(answers);
    const defaultValue = this.defaultPackageManager || "npm";
    const index = choices.findIndex((c) => c.value === defaultValue);
    return index >= 0 ? index : 0;
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return null;
    return "framework";
  }
}
