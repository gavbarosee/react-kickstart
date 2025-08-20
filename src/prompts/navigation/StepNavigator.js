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
      this.history.pop();
      this.currentStep = this.history[this.history.length - 1] || null;
    }
  }

  /**
   * Gets the previous step name
   */
  getPreviousStep() {
    if (this.history.length > 1) {
      return this.history[this.history.length - 2];
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
