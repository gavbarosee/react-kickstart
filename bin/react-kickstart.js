#!/usr/bin/env node

const { program } = require("commander");
const pkg = require("../package.json");

program
  .name("react-kickstart")
  .description("A modern CLI tool for creating React applications")
  .version(pkg.version)
  .argument("[project-directory]", "Project directory name")
  .action((projectDirectory) => {
    console.log(`Creating a new React app in ${projectDirectory || "."}`);
  });

program.parse(process.argv);
