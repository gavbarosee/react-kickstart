/**
 * Base class for all prompt steps
 */
export class BaseStep {
  constructor(renderer, navigator) {
    this.renderer = renderer;
    this.navigator = navigator;
    this.stepName = "";
    this.stepNumber = 0;
    this.totalSteps = 9;
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
    this.navigator.goBack();
    return "BACK";
  }

  /**
   * Processes the user's selection
   */
  processSelection(selection, answers) {
    if (selection === "BACK_OPTION") {
      return this.handleBackNavigation();
    }

    // Record this step in navigation history
    this.navigator.recordStep(this.stepName);

    // Store the answer
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
      this.icon
    );

    // Get choices and add back option if we can go back
    const choices = this.getChoices(answers);

    if (this.navigator.canGoBack()) {
      choices.push(this.renderer.createSeparator());
      choices.push(this.renderer.createBackOption());
    }

    // Prompt user
    const selection = await this.renderer.promptChoice({
      message: this.getMessage(),
      choices: choices,
      default: this.getDefault(answers),
    });

    // Process selection
    const result = this.processSelection(selection, answers);

    return {
      selection: result,
      nextStep: this.getNextStep(result, answers),
    };
  }
}
