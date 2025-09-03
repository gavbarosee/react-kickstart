import { describe, it, expect, vi } from "vitest";

import { PromptRenderer } from "../prompts/ui/prompt-renderer.js";

describe("PromptRenderer call order and omissions", () => {
  it("refreshDisplay calls header then summary, and summary omits undefineds", async () => {
    const renderer = new PromptRenderer();
    const headerSpy = vi.spyOn(renderer, "showHeader").mockResolvedValue();
    const summarySpy = vi.spyOn(renderer, "showSelectionSummary");

    const answers = {
      packageManager: "npm",
      // leave other fields undefined
    };
    await renderer.refreshDisplay(answers);

    expect(headerSpy).toHaveBeenCalledTimes(1);
    expect(summarySpy).toHaveBeenCalledWith(answers);

    // Spy on console to ensure omitted lines are not printed
    const origLog = console.log;
    const lines = [];
    console.log = (...args) => lines.push(args.join(" "));
    renderer.showSelectionSummary(answers);
    console.log = origLog;

    const joined = lines.join("\n");
    expect(joined).toMatch(/Package Manager/);
    expect(joined).not.toMatch(/Framework:/);
    expect(joined).not.toMatch(/Routing:/);
    expect(joined).not.toMatch(/TypeScript:/);
  });
});
