#!/usr/bin/env node

const { program } = require("commander");
const createApp = require("../src/index");
const pkg = require("../package.json");

program
  .name("react-kickstart")
  .description("A modern CLI tool for creating React applications")
  .version(pkg.version)
  .argument("[project-directory]", "Project directory name")
  .option("-y, --yes", "Skip all prompts and use default values")
  .action((projectDirectory, options) => {
    createApp(projectDirectory, options);
  });

program.parse(process.argv);
