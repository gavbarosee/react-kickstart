import { describe, it, expect, vi } from "vitest";
import { PromptFlow } from "../prompts/prompt-flow.js";

function createRendererDouble() {
  return {
    refreshDisplay: vi.fn(),
    showCompletion: vi.fn(),
    showStepHeader: vi.fn(),
    promptChoice: vi.fn(),
    createSeparator: vi.fn(() => ({})),
    createBackOption: vi.fn(() => ({ value: "BACK_OPTION" })),
  };
}

describe("PromptFlow control flow", () => {
  it("records history only when moving forward", async () => {
    const flow = new PromptFlow({ npm: { available: true } }, "npm");
    // Prevent expensive rendering
    flow.renderer = createRendererDouble();
    const recordSpy = vi.spyOn(flow.navigator, "recordStep");
    // Stub steps to simulate forward, then back
    flow.steps.packageManager.execute = async (answers) => {
      answers.packageManager = "npm";
      return { selection: "npm", nextStep: "framework" };
    };
    flow.steps.framework.execute = async (answers) => {
      answers.framework = "vite";
      return { selection: "vite", nextStep: "routing" };
    };
    let backed = false;
    flow.steps.routing.execute = async () => {
      if (!backed) {
        backed = true;
        return { selection: "BACK", nextStep: null };
      }
      return { selection: "react-router", nextStep: "language" };
    };
    flow.steps.language.execute = async () => ({
      selection: true,
      nextStep: "complete",
    });

    const result = await flow.run();
    expect(result.packageManager).toBe("npm");
    expect(result.framework).toBe("vite");
    // recordStep called only when moving forward, not on BACK
    expect(recordSpy).toHaveBeenCalledWith("packageManager");
    expect(recordSpy).toHaveBeenCalledWith("framework");
    expect(recordSpy).toHaveBeenCalledWith("routing");
  });

  it("skips routing when framework is nextjs and runs nextjsOptions", async () => {
    const flow = new PromptFlow({ npm: { available: true } }, "npm");
    flow.renderer = createRendererDouble();
    flow.steps.packageManager.execute = async (answers) => {
      answers.packageManager = "npm";
      return { selection: "npm", nextStep: "framework" };
    };
    flow.steps.framework.execute = async (answers) => {
      answers.framework = "nextjs";
      return { selection: "nextjs", nextStep: "nextjsOptions" };
    };
    const routingExec = vi.spyOn(flow.steps.routing, "execute");
    flow.steps.nextjsOptions.execute = async (answers) => {
      answers.nextRouting = "app";
      return { selection: "app", nextStep: "language" };
    };
    flow.steps.language.execute = async () => ({
      selection: true,
      nextStep: "complete",
    });

    const result = await flow.run();
    expect(result.framework).toBe("nextjs");
    expect(result.nextRouting).toBe("app");
    expect(routingExec).not.toHaveBeenCalled();
  });

  it("back from first step resolves gracefully to packageManager", async () => {
    const flow = new PromptFlow({ npm: { available: true } }, "npm");
    flow.renderer = createRendererDouble();
    // First move forward to framework, then go back to packageManager, then complete
    let stage = 0;
    flow.steps.packageManager.execute = async (answers) => {
      if (stage === 0) {
        stage = 1;
        answers.packageManager = "npm";
        return { selection: "npm", nextStep: "framework" };
      }
      answers.packageManager = "npm";
      return { selection: "npm", nextStep: "complete" };
    };
    flow.steps.framework.execute = async () => ({
      selection: "BACK",
      nextStep: null,
    });

    const result = await flow.run();
    expect(result.packageManager).toBe("npm");
  });
});
