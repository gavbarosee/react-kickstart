import chalk from "chalk";
import { BaseStep } from "./base-step.js";

export class TestingStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "testing",
      stepNumber: 9,
      totalSteps: 11,
      title: "Testing Framework",
      icon: "🧪",
    });
  }

  getChoices(answers) {
    const choices = [];

    if (answers.framework === "vite") {
      choices.push({
        name:
          chalk.green("⚡ Vitest") +
          " + React Testing Library " +
          chalk.dim("(Recommended)"),
        value: "vitest",
        description: "Fast, Vite-native testing with zero config",
      });
      choices.push({
        name: chalk.blue("🃏 Jest") + " + React Testing Library",
        value: "jest",
        description: "Traditional setup with more configuration",
      });
    } else if (answers.framework === "nextjs") {
      choices.push({
        name:
          chalk.blue("🃏 Jest") +
          " + React Testing Library " +
          chalk.dim("(Recommended)"),
        value: "jest",
        description: "Next.js optimized testing setup",
      });
      choices.push({
        name: chalk.green("⚡ Vitest") + " + React Testing Library",
        value: "vitest",
        description: "Modern alternative with faster execution",
      });
    }

    choices.push({
      name: chalk.gray("❌ Skip testing setup"),
      value: "none",
      description: "Set up testing manually later",
    });

    return choices;
  }

  getMessage() {
    return "Which testing framework would you like to set up?";
  }

  getDefault(answers) {
    if (answers.testing) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.testing);
    }

    // Framework-optimized defaults
    return 0; // Always recommend the first (framework-optimized) option
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "api";
    return "git";
  }
}
