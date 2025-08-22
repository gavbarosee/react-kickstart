import { describe, it, expect, vi } from "vitest";
import { BaseStep } from "../prompts/steps/base-step.js";

function createRendererStub() {
  return {
    refreshDisplay: vi.fn(),
    showStepHeader: vi.fn(),
    promptChoice: vi.fn(),
    createSeparator: () => ({ type: "separator" }),
    createBackOption: () => ({ name: "back", value: "BACK_OPTION" }),
  };
}

function createNavigatorStub(canGoBack) {
  return {
    canGoBack: () => canGoBack,
  };
}

class FakeStep extends BaseStep {
  constructor(renderer, navigator) {
    super(renderer, navigator);
    this.configure({
      stepName: "fake",
      stepNumber: 1,
      totalSteps: 2,
      title: "Fake",
    });
  }
  getChoices() {
    return [
      { name: "A", value: "a" },
      { name: "B", value: "b" },
    ];
  }
  getMessage() {
    return "Pick one";
  }
  getDefault(answers) {
    if (answers.fake) {
      const idx = this.getChoices().findIndex((c) => c.value === answers.fake);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  }
  getNextStep() {
    return "next";
  }
  getAnswerKey() {
    return "customKey";
  }
}

describe("BaseStep contract", () => {
  it("adds back option only when canGoBack is true", async () => {
    const renderer = createRendererStub();
    const a = new FakeStep(renderer, createNavigatorStub(false));
    renderer.promptChoice.mockResolvedValue("a");
    await a.execute({});
    const c1 = renderer.promptChoice.mock.calls[0][0].choices;
    expect(c1.some((c) => c && c.value === "BACK_OPTION")).toBe(false);

    const renderer2 = createRendererStub();
    const b = new FakeStep(renderer2, createNavigatorStub(true));
    renderer2.promptChoice.mockResolvedValue("a");
    await b.execute({});
    const c2 = renderer2.promptChoice.mock.calls[0][0].choices;
    expect(c2.some((c) => c && c.value === "BACK_OPTION")).toBe(true);
  });

  it("stores answer under overridden key via processSelection", async () => {
    const renderer = createRendererStub();
    const step = new FakeStep(renderer, createNavigatorStub(false));
    renderer.promptChoice.mockResolvedValue("b");
    const answers = {};
    const result = await step.execute(answers);
    expect(answers.customKey).toBe("b");
    expect(result.nextStep).toBe("next");
  });
});
