import { describe, it, expect } from "vitest";
import { PromptFlow } from "../prompts/prompt-flow.js";

function rendererDouble() {
  return {
    refreshDisplay: () => {},
    showCompletion: () => {},
  };
}

describe("PromptFlow cancellation handling", () => {
  it("throws normalized USER_CANCELLED when a step throws ExitPromptError", async () => {
    const flow = new PromptFlow({ npm: { available: true } }, "npm");
    flow.renderer = rendererDouble();
    const cancelError = new Error("Cancelled by user");
    cancelError.name = "ExitPromptError";
    flow.steps.packageManager.execute = async () => {
      throw cancelError;
    };

    await expect(flow.run()).rejects.toMatchObject({ code: "USER_CANCELLED" });
  });
});
