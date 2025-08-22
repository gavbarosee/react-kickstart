import { describe, it, expect, vi } from "vitest";
vi.mock("execa", () => ({ execa: vi.fn(async () => ({ stdout: "1.0.0" })) }));
import { EditorStep } from "../prompts/steps/editor-step.js";

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

describe("EditorStep", () => {
  it("default is No and does not prompt for editor when No selected", async () => {
    const renderer = createRendererStub();
    const step = new EditorStep(renderer, createNavigatorStub(true));
    renderer.promptChoice.mockResolvedValue(false);
    const answers = {};
    const result = await step.execute(answers);
    expect(answers.openEditor).toBe(false);
    expect(result.nextStep).toBe("complete");
  });

  it("prompts editor choice when Yes and sets answers.editor when available", async () => {
    const renderer = createRendererStub();
    const step = new EditorStep(renderer, createNavigatorStub(true));
    // First prompt: Yes
    renderer.promptChoice.mockResolvedValueOnce(true);

    // Mock inquirer prompt inside EditorStep
    const inquirer = await import("inquirer");
    const promptSpy = vi
      .spyOn(inquirer, "prompt")
      .mockResolvedValue({ editor: "cursor" });

    const answers = {};
    const result = await step.execute(answers);
    expect(answers.openEditor).toBe(true);
    expect(answers.editor).toBe("cursor");
    expect(result.nextStep).toBe("complete");

    promptSpy.mockRestore();
  });
});
