import { describe, it, expect } from "vitest";

import { StepNavigator } from "../prompts/navigation/step-navigator.js";

describe("StepNavigator robustness", () => {
  it("multiple goBack calls do not underflow history", () => {
    const nav = new StepNavigator();
    nav.recordStep("a");
    nav.recordStep("b");
    nav.recordStep("c");
    nav.goBack();
    nav.goBack();
    nav.goBack();
    nav.goBack();
    expect(nav.history).toEqual([]);
    expect(nav.canGoBack()).toBe(false);
  });

  it("getCurrentPosition returns history length", () => {
    const nav = new StepNavigator();
    expect(nav.getCurrentPosition()).toBe(0);
    nav.recordStep("a");
    expect(nav.getCurrentPosition()).toBe(1);
    nav.recordStep("b");
    expect(nav.getCurrentPosition()).toBe(2);
  });
});
