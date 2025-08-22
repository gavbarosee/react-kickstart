import { describe, it, expect } from "vitest";
import { PromptFlow } from "../prompts/prompt-flow.js";

const stepOrder = [
  "packageManager",
  "framework",
  "nextjsOptions",
  "routing",
  "language",
  "codeQuality",
  "styling",
  "stateManagement",
  "api",
  "testing",
  "git",
  "deployment",
  "editor",
];

const stepToAnswerKey = {
  packageManager: ["packageManager"],
  framework: ["framework"],
  nextjsOptions: ["nextRouting"],
  routing: ["routing"],
  language: ["typescript"],
  codeQuality: ["linting"],
  styling: ["styling"],
  stateManagement: ["stateManagement"],
  api: ["api"],
  testing: ["testing"],
  git: ["initGit"],
  deployment: ["deployment"],
  editor: ["openEditor", "editor"],
};

function populateAllAnswers() {
  return {
    packageManager: "npm",
    framework: "nextjs",
    nextRouting: "app",
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
    editor: "cursor",
  };
}

describe("PromptFlow.clearAnswersAfterStep parametric", () => {
  it("keeps only keys up to each step and clears the rest", () => {
    for (const stepName of stepOrder) {
      const flow = new PromptFlow({ npm: { available: true } }, "npm");
      flow.answers = populateAllAnswers();
      flow.clearAnswersAfterStep(stepName);

      const keepKeys = new Set();
      const index = stepOrder.indexOf(stepName);
      const stepsToKeep = stepOrder.slice(0, index + 1);
      stepsToKeep.forEach((s) =>
        stepToAnswerKey[s].forEach((k) => keepKeys.add(k))
      );

      // kept
      for (const k of keepKeys) {
        expect(flow.answers[k]).not.toBeUndefined();
      }
      // cleared
      for (const k of Object.keys(stepToAnswerKey).flatMap(
        (s) => stepToAnswerKey[s]
      )) {
        if (!keepKeys.has(k)) {
          expect(flow.answers[k]).toBeUndefined();
        }
      }
    }
  });
});
