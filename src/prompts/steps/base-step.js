import chalk from "chalk";

import { keyboardNavManager } from "../navigation/navigation-manager.js";

/**
 * Base class for all prompt steps
 */
export class BaseStep {
  constructor(renderer, navigator) {
    this.renderer = renderer;
    this.navigator = navigator;
    this.stepName = "";
    this.stepNumber = 0;
    this.totalSteps = 12;
    this.title = "";
    this.icon = "•";
  }

  /**
   * Sets step configuration
   */
  configure(config) {
    this.stepName = config.stepName;
    this.stepNumber = config.stepNumber;
    this.totalSteps = config.totalSteps;
    this.title = config.title;
    this.icon = config.icon || "•";
  }

  /**
   * Gets the choices for this step
   * Must be implemented by subclasses
   */
  getChoices(answers) {
    throw new Error("getChoices must be implemented by subclass");
  }

  /**
   * Gets the prompt message
   * Must be implemented by subclasses
   */
  getMessage() {
    throw new Error("getMessage must be implemented by subclass");
  }

  /**
   * Gets the default selection
   */
  getDefault(answers) {
    return 0;
  }

  /**
   * Determines the next step based on current answer
   */
  getNextStep(selection, answers) {
    return null; // Override in subclasses
  }

  /**
   * Handles the back navigation
   */
  handleBackNavigation() {
    return "BACK";
  }

  /**
   * Processes the user's selection
   */
  processSelection(selection, answers) {
    if (selection === "BACK_OPTION") {
      return this.handleBackNavigation();
    }

    // Store the answer (don't record step in history here - that happens in PromptFlow)
    answers[this.getAnswerKey()] = selection;

    return selection;
  }

  /**
   * Gets the key to store the answer under
   * Defaults to stepName, override if needed
   */
  getAnswerKey() {
    return this.stepName;
  }

  /**
   * Executes the step
   */
  async execute(answers) {
    // Refresh display
    this.renderer.refreshDisplay(answers);

    // Show step header
    this.renderer.showStepHeader(
      this.stepNumber,
      this.totalSteps,
      this.title,
      this.icon,
    ); // Get choices and calculate default BEFORE modifying choices array
    const choices = this.getChoices(answers);
    const canGoBack = this.navigator.canGoBack();
    const defaultIndex = this.getDefault(answers);

    if (canGoBack) {
      choices.push(this.renderer.createSeparator());
      choices.push(this.renderer.createBackOption());
    }

    // Add keyboard navigation hint if we can go back
    let message = this.getMessage();
    if (canGoBack) {
      message += chalk.dim("\n  (Press ← or Backspace to go back quickly)");
    }

    // Prompt user with keyboard navigation support
    const selection = await this.promptWithKeyboardNavigation({
      message: message,
      choices: choices,
      default: defaultIndex,
      canGoBack: canGoBack,
    });

    // Process selection
    const result = this.processSelection(selection, answers);

    return {
      selection: result,
      nextStep: this.getNextStep(result, answers),
    };
  }

  /**
   * Enhanced prompt with keyboard navigation support
   */
  async promptWithKeyboardNavigation(config) {
    if (!config.canGoBack) {
      // Use standard prompt if no back navigation is available
      return await this.renderer.promptChoice(config);
    }

    return new Promise((resolve, reject) => {
      let isResolved = false;

      // Activate keyboard navigation with our callback
      keyboardNavManager.activate(() => {
        if (!isResolved) {
          isResolved = true;
          resolve("BACK_OPTION");
        }
      });

      // Run the standard prompt
      this.renderer
        .promptChoice(config)
        .then((selection) => {
          if (!isResolved) {
            isResolved = true;
            keyboardNavManager.deactivate();
            resolve(selection);
          }
        })
        .catch((error) => {
          if (!isResolved) {
            isResolved = true;
            keyboardNavManager.deactivate();
            reject(error);
          }
        });
    });
  }
}
