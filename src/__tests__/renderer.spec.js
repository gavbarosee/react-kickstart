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
    // Strip ANSI color codes before testing
    // eslint-disable-next-line no-control-regex
    const cleanOutput = output.replace(/\u001b\[[0-9;]*m/g, "");
    expect(cleanOutput).toMatch(/Package Manager\s+npm/);
    expect(cleanOutput).toMatch(/Framework\s+nextjs/);
    expect(cleanOutput).toMatch(/Routing\s+app/);
    expect(cleanOutput).toMatch(/TypeScript\s+✓/);
    expect(cleanOutput).toMatch(/Linting\s+×/);
    expect(cleanOutput).toMatch(/Styling\s+tailwind/);
    expect(cleanOutput).toMatch(/Routing\s+react-router/);
    expect(cleanOutput).toMatch(/State\s+redux/);
    expect(cleanOutput).toMatch(/Git\s+✓/);
    expect(cleanOutput).toMatch(/Editor\s+code/);
  });
});
