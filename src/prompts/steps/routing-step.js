import chalk from "chalk";

import { BaseStep } from "./base-step.js";

export class RoutingStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "routing",
      stepNumber: 3,
      totalSteps: 12,
      title: "Routing Options",
      icon: "",
    });
  }

  getChoices(answers) {
    return [
      {
        name:
          chalk.white("React Router") + chalk.dim(" - Popular, comprehensive routing"),
        value: "react-router",
      },
      {
        name: chalk.dim("None - No routing library"),
        value: "none",
      },
    ];
  }

  getMessage() {
    return "Which routing library would you like to use?";
  }

  getDefault(answers) {
    if (answers.routing) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.routing);
    }
    return 0; // Default to React Router
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "framework";
    return "language";
  }

  // Only show this step for non-Next.js frameworks
  shouldShow(answers) {
    return answers.framework !== "nextjs";
  }
}
