/**
 * Singleton manager for keyboard navigation to prevent listener leaks
 */
class KeyboardNavigationManager {
  constructor() {
    this.isActive = false;
    this.currentHandler = null;
    this.activePromise = null;
    this.originalMaxListeners = process.stdin.getMaxListeners();

    // Suppress the MaxListenersExceededWarning for stdin
    process.stdin.setMaxListeners(0); // 0 means unlimited
  }

  /**
   * Activates keyboard navigation for the current prompt
   */
  activate(onBackNavigation) {
    // Clean up any existing navigation
    this.deactivate();

    // Clean up any orphaned keypress listeners if there are too many
    const currentCount = this.getListenerCount();
    if (currentCount > 5) {
      // Get all current listeners
      const listeners = process.stdin.listeners("keypress");
      // Remove all but the most recent ones (keep inquirer's listeners)
      const listenersToRemove = listeners.slice(0, -2);
      listenersToRemove.forEach((listener) => {
        process.stdin.removeListener("keypress", listener);
      });
    }

    this.isActive = true;
    this.currentHandler = (str, key) => {
      if (key && (key.name === "left" || key.name === "backspace")) {
        this.deactivate();
        onBackNavigation();
      }
    };

    // Add the listener
    process.stdin.on("keypress", this.currentHandler);
  }

  /**
   * Deactivates keyboard navigation
   */
  deactivate() {
    if (this.currentHandler) {
      process.stdin.removeListener("keypress", this.currentHandler);
      this.currentHandler = null;
    }
    this.isActive = false;
  }

  /**
   * Checks if navigation is currently active
   */
  isNavigationActive() {
    return this.isActive;
  }

  /**
   * Gets the current listener count for debugging
   */
  getListenerCount() {
    return process.stdin.listenerCount("keypress");
  }

  /**
   * Cleanup method to restore original settings (call on app exit)
   */
  cleanup() {
    this.deactivate();
    // Restore original max listeners setting
    process.stdin.setMaxListeners(this.originalMaxListeners);
  }
}

// Export singleton instance
export const keyboardNavManager = new KeyboardNavigationManager();
