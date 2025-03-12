#!/usr/bin/env node

import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { program } from "commander";
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
  .option("--no-summary", "Skip the configuration summary")
  .action((projectDirectory, options) => {
    createApp(projectDirectory, options);
  });

program.parse(process.argv);
