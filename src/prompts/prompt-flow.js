import { StepNavigator } from "./navigation/step-navigator.js";
import { ApiStep } from "./steps/api-step.js";
import { CodeQualityStep } from "./steps/code-quality-step.js";
import { DeploymentStep } from "./steps/deployment-step.js";
import { EditorStep } from "./steps/editor-step.js";
import { FrameworkStep } from "./steps/framework-step.js";
import { GitStep } from "./steps/git-step.js";
import { LanguageStep } from "./steps/language-step.js";
import { NextjsOptionsStep } from "./steps/nextjs-routing-step.js";
import { PackageManagerStep } from "./steps/package-manager-step.js";
import { RoutingStep } from "./steps/routing-step.js";
import { StateManagementStep } from "./steps/state-management-step.js";
import { StylingStep } from "./steps/styling-step.js";
import { TestingStep } from "./steps/testing-step.js";
import { PromptRenderer } from "./ui/prompt-renderer.js";

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
        defaultPackageManager,
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
          const previousStepName = this.getPreviousStepName();
          this.currentStepName = previousStepName;

          // Update navigator state to match
          this.navigator.goBack();

          // Clear answers for steps that come after the step we're going back to
          this.clearAnswersAfterStep(previousStepName);
          continue;
        }

        // Record this step in navigation history only when moving forward
        this.navigator.recordStep(this.currentStepName);

        // Move to next step
        this.currentStepName = result.nextStep;
      } catch (error) {
        // Gracefully handle prompt cancellations from inquirer (SIGINT)
        const message = error?.message || String(error);
        if (
          error?.name === "ExitPromptError" ||
          message.includes("force closed the prompt") ||
          message.toLowerCase().includes("sigint")
        ) {
          // Re-throw a normalized cancellation signal for the global handler
          // Don't log this as an error since it's intentional user action
          const cancelError = new Error("User cancelled during prompts");
          cancelError.code = "USER_CANCELLED";
          throw cancelError;
        }

        // Other errors: log minimally and rethrow (but not for user cancellations)
        console.error("Error in prompt step:", message);
        throw error;
      }
    }

    // Show completion message
    await this.renderer.refreshDisplay(this.answers);
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
   * Clears answers for steps that come after the specified step in the flow
   */
  clearAnswersAfterStep(stepName) {
    // Define the step order - this should match the actual flow
    const stepOrder = [
      "packageManager",
      "framework",
      "nextjsOptions", // conditional
      "routing", // conditional
      "language",
      "codeQuality",
      "styling",
      "stateManagement",
      "api",
      "testing",
      "git",
      "deployment",
      "editor",
    ];

    const currentStepIndex = stepOrder.indexOf(stepName);
    if (currentStepIndex === -1) return;

    // Clear answers for all steps after the current step
    const stepsToKeep = stepOrder.slice(0, currentStepIndex + 1);
    const keysToKeep = new Set();

    // Map step names to answer keys
    const stepToAnswerKey = {
      packageManager: "packageManager",
      framework: "framework",
      nextjsOptions: "nextRouting",
      routing: "routing",
      language: "typescript",
      codeQuality: "linting",
      styling: "styling",
      stateManagement: "stateManagement",
      api: "api",
      testing: "testing",
      git: "initGit",
      deployment: "deployment",
      editor: ["openEditor", "editor"],
    };

    // Collect keys to keep
    stepsToKeep.forEach((step) => {
      const answerKey = stepToAnswerKey[step];
      if (Array.isArray(answerKey)) {
        answerKey.forEach((key) => keysToKeep.add(key));
      } else if (answerKey) {
        keysToKeep.add(answerKey);
      }
    });

    // Remove answers that are not in the keep list
    Object.keys(this.answers).forEach((key) => {
      if (!keysToKeep.has(key)) {
        delete this.answers[key];
      }
    });
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
