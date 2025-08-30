#!/usr/bin/env node

import { program } from "commander";
import { readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { createApp } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let packageJson;
try {
  const packagePath = resolve(__dirname, "../package.json");
  const packageData = await readFile(packagePath, "utf8");
  packageJson = JSON.parse(packageData);
} catch (err) {
  console.error("Error reading package.json:", err);
  packageJson = { version: "0.1.0" };
}

program
  .name("react-kickstart")
  .description("A modern CLI tool for creating React applications")
  .version(packageJson.version)
  .argument("[project-directory]", "Project directory name")
  .option("-y, --yes", "Skip all prompts and use default values")
  .option("-f, --framework <framework>", "Framework to use (vite, nextjs)", "vite")
  .option("--typescript", "Enable TypeScript")
  .option("--no-typescript", "Disable TypeScript (default)")
  .option(
    "--styling <styling>",
    "Styling solution (tailwind, styled-components, css)",
    "tailwind",
  )
  .option("--state <state>", "State management (redux, zustand, none)", "none")
  .option(
    "--api <api>",
    "API setup (axios-react-query, axios-only, fetch-react-query, fetch-only, none)",
    "none",
  )
  .option("--testing <testing>", "Testing framework (vitest, jest, none)", "none")
  .option(
    "--routing <routing>",
    "Routing library (react-router, none) - Vite only",
    "none",
  )
  .option(
    "--next-routing <routing>",
    "Next.js routing (app, pages) - Next.js only",
    "app",
  )
  .option("--package-manager <pm>", "Package manager (npm, yarn)", "npm")
  .option("--no-linting", "Disable ESLint")
  .option("--no-git", "Skip Git initialization")
  .option("--no-summary", "Skip the configuration summary")
  .option("--no-autostart", "Disable automatic project startup")
  .option("--skip-install", "Skip dependency installation")
  .action(async (projectDirectory, options) => {
    await createApp(projectDirectory, options);
  });

program.parse(process.argv);
