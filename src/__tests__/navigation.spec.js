import { describe, it, expect } from "vitest";

import { StepNavigator } from "../prompts/navigation/step-navigator.js";

describe("StepNavigator", () => {
  it("records steps and returns previous step", () => {
    const nav = new StepNavigator();
    expect(nav.canGoBack()).toBe(false);

    nav.recordStep("packageManager");
    nav.recordStep("framework");
    expect(nav.getPreviousStep()).toBe("framework");
    expect(nav.canGoBack()).toBe(true);
  });

  it("goBack sets currentStep to previous and pops history", () => {
    const nav = new StepNavigator();
    nav.recordStep("packageManager");
    nav.recordStep("framework");
    nav.recordStep("routing");

    expect(nav.getPreviousStep()).toBe("routing");
    nav.goBack();

    // After goBack, currentStep should be the last in history before pop
    // and the history should have removed that element
    expect(nav.currentStep).toBe("routing");
    expect(nav.getPreviousStep()).toBe("framework");
  });

  it("reset clears history and currentStep", () => {
    const nav = new StepNavigator();
    nav.recordStep("packageManager");
    nav.recordStep("framework");
    nav.reset();
    expect(nav.history).toEqual([]);
    expect(nav.currentStep).toBe(null);
    expect(nav.canGoBack()).toBe(false);
  });
});
