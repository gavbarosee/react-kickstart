/**
 * Handles navigation logic between prompt steps
 */
export class StepNavigator {
  constructor() {
    this.history = [];
    this.currentStep = null;
  }

  /**
   * Records a step in navigation history
   */
  recordStep(stepName) {
    this.history.push(stepName);
    this.currentStep = stepName;
  }

  /**
   * Goes back to the previous step
   */
  goBack() {
    if (this.history.length > 0) {
      // Don't pop - just set current step to the last item in history
      this.currentStep = this.history[this.history.length - 1];
      // Remove the step we're going back to from history so we can go back further
      this.history.pop();
    }
  }

  /**
   * Gets the previous step name
   */
  getPreviousStep() {
    if (this.history.length > 0) {
      return this.history[this.history.length - 1];
    }
    return null;
  }

  /**
   * Checks if we can go back
   */
  canGoBack() {
    return this.history.length > 0;
  }

  /**
   * Resets navigation history
   */
  reset() {
    this.history = [];
    this.currentStep = null;
  }

  /**
   * Gets current step position
   */
  getCurrentPosition() {
    return this.history.length;
  }
}
