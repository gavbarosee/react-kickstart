import chalk from "chalk";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { PromptRenderer } from "../prompts/ui/prompt-renderer.js";

describe("PromptRenderer", () => {
  let renderer;
  const originalLog = console.log;
  const originalWrite = process.stdout.write;
  let logs;

  beforeEach(() => {
    logs = [];
    console.log = (...args) => logs.push(args.join(" "));
    process.stdout.write = vi.fn();
    renderer = new PromptRenderer();
  });

  afterEach(() => {
    console.log = originalLog;
    process.stdout.write = originalWrite;
  });

  it("shows selection summary including key choices", () => {
    renderer.showSelectionSummary({
      packageManager: "npm",
      framework: "nextjs",
      nextRouting: "app",
      typescript: true,
      linting: false,
      styling: "tailwind",
      routing: "react-router",
      stateManagement: "redux",
      initGit: true,
      openEditor: true,
      editor: "code",
    });

    const output = logs.join("\n");
    expect(output).toMatch(/Package Manager: .*npm/);
    expect(output).toMatch(/Framework: .*nextjs/);
    expect(output).toMatch(/Next\.js Routing: .*app/);
    expect(output).toMatch(/TypeScript: .*Yes/);
    expect(output).toMatch(/Linting: .*No/);
    expect(output).toMatch(/Styling: .*tailwind/);
    expect(output).toMatch(/Routing: .*react-router/);
    expect(output).toMatch(/State Management: .*redux/);
    expect(output).toMatch(/Git Init: .*Yes/);
    expect(output).toMatch(/Open in Editor: .*Yes/);
    expect(output).toMatch(/Editor: .*code/);
  });
});
