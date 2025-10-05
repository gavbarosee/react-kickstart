import chalk from "chalk";

import { BaseStep } from "./base-step.js";
import { UI_UTILS } from "../../utils/index.js";

export class DeploymentStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "deployment",
      stepNumber: 11,
      totalSteps: 12,
      title: "Deployment Platform",
      icon: "",
    });
  }

  getChoices(answers) {
    const choices = [];

    // Reorder choices based on framework to put recommended option first
    if (answers.framework === "vite") {
      // Netlify first for Vite (recommended)
      choices.push({
        name: chalk.white("Netlify") + chalk.dim(" (Recommended)"),
        value: "netlify",
      });

      // Vercel second for Vite
      choices.push({
        name: chalk.white("Vercel"),
        value: "vercel",
      });
    } else {
      // Vercel first for Next.js and other frameworks (recommended for Next.js)
      choices.push({
        name:
          chalk.white("Vercel") +
          (answers.framework === "nextjs" ? chalk.dim(" (Recommended)") : ""),
        value: "vercel",
      });

      // Netlify second for non-Vite frameworks
      choices.push({
        name: chalk.white("Netlify"),
        value: "netlify",
      });
    }

    // Skip option always last
    choices.push({
      name: chalk.dim("Skip deployment setup"),
      value: "none",
    });

    return choices;
  }

  getMessage() {
    return "Which deployment platform would you like to configure?";
  }

  getDefault(answers) {
    if (answers.deployment) {
      const choices = this.getChoices(answers);
      return choices.findIndex((c) => c.value === answers.deployment);
    }

    // With the reordered choices, the recommended option is always first (index 0)
    return 0;
  }

  getNextStep(selection, answers) {
    if (selection === "BACK") return "git";
    return "editor";
  }

  /**
   * Override execute to add inline recommendations
   */
  async execute(answers) {
    const result = await super.execute(answers);

    // Show inline recommendations for deployment platform + framework combinations
    if (result.selection && result.selection !== "BACK") {
      this.showInlineRecommendations(result.selection, answers);
    }

    return result;
  }

  /**
   * Show inline recommendations for deployment platform + framework combinations
   */
  showInlineRecommendations(deploymentSelection, answers) {
    if (deploymentSelection === "netlify" && answers.framework === "nextjs") {
      console.log();
      UI_UTILS.log(
        "Netlify with Next.js: Consider using Vercel for optimal Next.js features and performance.",
      );
    } else if (deploymentSelection === "vercel" && answers.framework === "vite") {
      console.log();
      UI_UTILS.log(
        "Vercel with Vite: Great choice! Vercel has excellent Vite support with zero configuration.",
      );
    } else if (deploymentSelection === "netlify" && answers.framework === "vite") {
      console.log();
      UI_UTILS.log(
        "Netlify with Vite: Excellent choice! Netlify has great build optimization for Vite projects.",
      );
    } else if (deploymentSelection === "vercel" && answers.framework === "nextjs") {
      console.log();
      UI_UTILS.log(
        "Vercel with Next.js: Perfect match! Zero-config deployments with optimal performance.",
      );
    }
  }
}
