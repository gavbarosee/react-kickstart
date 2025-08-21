import { PromptRenderer } from "./ui/prompt-renderer.js";
import { StepNavigator } from "./navigation/step-navigator.js";

// Import all step classes
import { PackageManagerStep } from "./steps/package-manager-step.js";
import { FrameworkStep } from "./steps/framework-step.js";
import { NextjsOptionsStep } from "./steps/nextjs-options-step.js";
import { RoutingStep } from "./steps/routing-step.js";
import { LanguageStep } from "./steps/language-step.js";
import { CodeQualityStep } from "./steps/code-quality-step.js";
import { StylingStep } from "./steps/styling-step.js";
import { StateManagementStep } from "./steps/state-management-step.js";
import { ApiStep } from "./steps/api-step.js";
import { TestingStep } from "./steps/testing-step.js";
import { GitStep } from "./steps/git-step.js";
import { DeploymentStep } from "./steps/deployment-step.js";
import { EditorStep } from "./steps/editor-step.js";

/**
 * Main prompt flow controller that orchestrates the entire prompt sequence
 */
export class PromptFlow {
  constructor(packageManagers, defaultPackageManager) {
    this.renderer = new PromptRenderer();
    this.navigator = new StepNavigator();
    this.answers = {};

    // Initialize all steps
    this.steps = {
      packageManager: new PackageManagerStep(
        this.renderer,
        this.navigator,
        packageManagers,
        defaultPackageManager
      ),
      framework: new FrameworkStep(this.renderer, this.navigator),
      nextjsOptions: new NextjsOptionsStep(this.renderer, this.navigator),
      routing: new RoutingStep(this.renderer, this.navigator),
      language: new LanguageStep(this.renderer, this.navigator),
      codeQuality: new CodeQualityStep(this.renderer, this.navigator),
      styling: new StylingStep(this.renderer, this.navigator),
      stateManagement: new StateManagementStep(this.renderer, this.navigator),
      api: new ApiStep(this.renderer, this.navigator),
      testing: new TestingStep(this.renderer, this.navigator),
      git: new GitStep(this.renderer, this.navigator),
      deployment: new DeploymentStep(this.renderer, this.navigator),
      editor: new EditorStep(this.renderer, this.navigator),
    };

    this.currentStepName = "packageManager";
  }

  /**
   * Runs the entire prompt flow
   */
  async run() {
    while (this.currentStepName && this.currentStepName !== "complete") {
      const step = this.steps[this.currentStepName];

      if (!step) {
        throw new Error(`Unknown step: ${this.currentStepName}`);
      }

      // Check if this step should be shown (for conditional steps like routing)
      if (step.shouldShow && !step.shouldShow(this.answers)) {
        // Skip this step and move to the next one
        const dummyResult = {
          nextStep: step.getNextStep("skip", this.answers),
        };
        this.currentStepName = dummyResult.nextStep;
        continue;
      }

      try {
        const result = await step.execute(this.answers);

        // Handle back navigation
        if (result.selection === "BACK") {
          this.currentStepName = this.getPreviousStepName();
          continue;
        }

        // Move to next step
        this.currentStepName = result.nextStep;
      } catch (error) {
        console.error("Error in prompt step:", error);
        throw error;
      }
    }

    // Show completion message
    this.renderer.refreshDisplay(this.answers);
    this.renderer.showCompletion();

    return this.answers;
  }

  /**
   * Gets the previous step name based on current answers and navigation history
   */
  getPreviousStepName() {
    const previousStep = this.navigator.getPreviousStep();

    if (!previousStep) {
      return "packageManager"; // Fallback to first step
    }

    return previousStep;
  }

  /**
   * Resets the prompt flow
   */
  reset() {
    this.answers = {};
    this.navigator.reset();
    this.currentStepName = "packageManager";
  }
}
