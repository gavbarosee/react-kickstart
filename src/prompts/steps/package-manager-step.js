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
    return answers.packageManager || this.defaultPackageManager || "npm";
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return null;
    return "framework";
  }
}
