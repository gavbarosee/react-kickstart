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
      icon: "🚀",
    });
  }

  getChoices(answers) {
    const choices = [];

    // Vercel - excellent for Next.js, good for Vite
    choices.push({
      name:
        chalk.blue("▲ Vercel") +
        (answers.framework === "nextjs" ? chalk.dim(" (Recommended)") : ""),
      value: "vercel",
      description: "Zero-config deployments with excellent Next.js integration",
    });

    // Netlify - great for both frameworks
    choices.push({
      name:
        chalk.green("◈ Netlify") +
        (answers.framework === "vite" ? chalk.dim(" (Recommended)") : ""),
      value: "netlify",
      description: "Powerful platform with great build optimization",
    });

    // Skip option
    choices.push({
      name: chalk.gray("❌ Skip deployment setup"),
      value: "none",
      description: "Configure deployment manually later",
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

    // Framework-optimized defaults
    if (answers.framework === "nextjs") {
      return 0; // Vercel for Next.js
    } else if (answers.framework === "vite") {
      return 1; // Netlify for Vite
    }

    return 0; // Default to Vercel
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
        "Netlify with Next.js: Consider using Vercel for optimal Next.js features and performance."
      );
    } else if (
      deploymentSelection === "vercel" &&
      answers.framework === "vite"
    ) {
      console.log();
      UI_UTILS.log(
        "Vercel with Vite: Great choice! Vercel has excellent Vite support with zero configuration."
      );
    } else if (
      deploymentSelection === "netlify" &&
      answers.framework === "vite"
    ) {
      console.log();
      UI_UTILS.log(
        "Netlify with Vite: Excellent choice! Netlify has great build optimization for Vite projects."
      );
    } else if (
      deploymentSelection === "vercel" &&
      answers.framework === "nextjs"
    ) {
      console.log();
      UI_UTILS.log(
        "Vercel with Next.js: Perfect match! Zero-config deployments with optimal performance."
      );
    }
  }
}
