import { describe, it, expect } from "vitest";
import { PromptFlow } from "../prompts/prompt-flow.js";

// Create minimal doubles for renderer and navigator behavior used by PromptFlow
function createRendererDouble() {
  return {
    refreshDisplay: () => {},
    showCompletion: () => {},
  };
}

function createNavigatorDouble() {
  const history = [];
  return {
    recordStep: (name) => history.push(name),
    getPreviousStep: () =>
      history.length ? history[history.length - 1] : null,
    goBack: () => {
      // mimic real StepNavigator.goBack
      // set current to last, then pop it
      if (history.length > 0) {
        // current not used here by PromptFlow tests
        history.pop();
      }
    },
    canGoBack: () => history.length > 0,
    reset: () => {
      history.length = 0;
    },
  };
}

// Helper to create a PromptFlow with test doubles and controlled steps
function createTestFlow() {
  const flow = new PromptFlow({ npm: { available: true } }, "npm");
  // override renderer and navigator with doubles that are deterministic
  flow.renderer = createRendererDouble();
  flow.navigator = createNavigatorDouble();
  return flow;
}

describe("PromptFlow.clearAnswersAfterStep", () => {
  it("keeps answers up to the specified step and clears subsequent ones", () => {
    const flow = createTestFlow();
    flow.answers = {
      packageManager: "npm",
      framework: "vite",
      routing: "react-router",
      typescript: true,
      linting: true,
      styling: "tailwind",
      stateManagement: "redux",
      api: "fetch",
      testing: "vitest",
      initGit: true,
      deployment: "none",
      openEditor: true,
      editor: "code",
      nextRouting: "app",
    };

    flow.clearAnswersAfterStep("language");

    // Should keep: packageManager, framework, (routing or nextRouting depending on framework), typescript
    expect(flow.answers.packageManager).toBe("npm");
    expect(flow.answers.framework).toBe("vite");
    expect(flow.answers.routing).toBe("react-router");
    expect(flow.answers.typescript).toBe(true);

    // Should remove later steps
    expect(flow.answers.linting).toBeUndefined();
    expect(flow.answers.styling).toBeUndefined();
    expect(flow.answers.stateManagement).toBeUndefined();
    expect(flow.answers.api).toBeUndefined();
    expect(flow.answers.testing).toBeUndefined();
    expect(flow.answers.initGit).toBeUndefined();
    expect(flow.answers.deployment).toBeUndefined();
    expect(flow.answers.openEditor).toBeUndefined();
    expect(flow.answers.editor).toBeUndefined();
    // nextRouting is kept because it's mapped to the Next.js options step,
    // which is before language in the fixed step order, regardless of framework
    expect(flow.answers.nextRouting).toBe("app");
  });
});

// Integration of back navigation is exercised indirectly via navigator tests
