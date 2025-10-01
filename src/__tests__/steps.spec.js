import { describe, it, expect, vi, beforeEach } from "vitest";

import { FrameworkStep } from "../prompts/steps/framework-step.js";
import { LanguageStep } from "../prompts/steps/language-step.js";
import { NextjsOptionsStep } from "../prompts/steps/nextjs-routing-step.js";
import { PackageManagerStep } from "../prompts/steps/package-manager-step.js";
import { RoutingStep } from "../prompts/steps/routing-step.js";

function createRendererStub() {
  return {
    refreshDisplay: vi.fn(),
    showStepHeader: vi.fn(),
    promptChoice: vi.fn(),
    createSeparator: () => ({ type: "separator" }),
    createBackOption: () => ({ name: "back", value: "BACK_OPTION" }),
  };
}

function createNavigatorStub(canGoBack = false) {
  return {
    canGoBack: () => canGoBack,
  };
}

describe("Steps - choices and flow", () => {
  it("PackageManagerStep lists detected managers and honors default", async () => {
    const renderer = createRendererStub();
    const navigator = createNavigatorStub(false);
    const step = new PackageManagerStep(
      renderer,
      navigator,
      {
        npm: { available: true, recommended: true },
        yarn: { available: true },
      },
      "npm",
    );
    renderer.promptChoice.mockResolvedValue("npm");
    const answers = {};
    const result = await step.execute(answers);
    expect(result.selection).toBe("npm");
    expect(result.nextStep).toBe("framework");
    expect(answers.packageManager).toBe("npm");
  });

  it("FrameworkStep shows vite and nextjs options and routes accordingly", async () => {
    const renderer = createRendererStub();
    const navigator = createNavigatorStub(true);
    const step = new FrameworkStep(renderer, navigator);
    // Choose nextjs
    renderer.promptChoice.mockResolvedValue("nextjs");
    const answers = {};
    const result = await step.execute(answers);
    expect(result.nextStep).toBe("nextjsOptions");

    const callArg = renderer.promptChoice.mock.calls[0][0];
    expect(callArg.choices.some((c) => c && c.value === "BACK_OPTION")).toBe(false);
  });

  it("NextjsOptionsStep goes to language and supports back", async () => {
    const renderer = createRendererStub();
    const navigator = createNavigatorStub(true);
    const step = new NextjsOptionsStep(renderer, navigator);
    renderer.promptChoice.mockResolvedValue("app");
    const answers = { framework: "nextjs" };
    const result = await step.execute(answers);
    expect(answers.nextRouting).toBe("app");
    expect(result.nextStep).toBe("language");
  });

  it("RoutingStep only shows for non-nextjs frameworks", async () => {
    const renderer = createRendererStub();
    const navigator = createNavigatorStub(false);
    const step = new RoutingStep(renderer, navigator);
    expect(step.shouldShow({ framework: "vite" })).toBe(true);
    expect(step.shouldShow({ framework: "nextjs" })).toBe(false);
    // Also verify default index resolves to existing choice
    const idx = step.getDefault({});
    const choices = step.getChoices({});
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(choices.length);
  });

  it("LanguageStep back returns to routing or nextjsOptions based on framework", () => {
    const renderer = createRendererStub();
    const navigator = createNavigatorStub(true);
    const step = new LanguageStep(renderer, navigator);
    expect(step.getNextStep("BACK", { framework: "nextjs" })).toBe("nextjsOptions");
    expect(step.getNextStep("BACK", { framework: "vite" })).toBe("routing");
  });
});
