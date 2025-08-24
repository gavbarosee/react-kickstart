import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";

import { createUIRenderer } from "../../templates/index.js";
import { validateUserChoices } from "../core/validation.js";

function getFrameworkDescriptor(framework) {
  const descriptors = {
    vite: "Fast dev server, optimized builds",
    nextjs: "SSR, full-stack framework",
  };
  return descriptors[framework] || "";
}

function getStylingDescriptor(styling) {
  const descriptors = {
    tailwind: "Utility-first CSS framework",
    "styled-components": "CSS-in-JS library",
    css: "Standard CSS files",
  };
  return descriptors[styling] || "";
}

function getRoutingDescriptor(routing) {
  const descriptors = {
    "react-router": "Popular, comprehensive routing",
  };
  return descriptors[routing] || "";
}

export function generateSummary(projectPath, projectName, userChoices) {
  const getStatusSymbol = (value) => (value ? chalk.green("[✓]") : chalk.red("[x]"));

  // Validate user choices to get warnings
  const validation = validateUserChoices(userChoices);

  // format each item in the summary with proper alignment
  const formatItem = (icon, label, value, description = "") => {
    const paddedLabel = `${icon} ${label}:`.padEnd(20);
    const descText = description ? chalk.gray(` → ${description}`) : "";
    return `${paddedLabel} ${value}${descText}`;
  };

  const formatSectionHeader = (title) => {
    return chalk.cyan(`\n━━━━━━━━━━ ${title} ━━━━━━━━━━`);
  };

  // create summary content with logical grouping
  const content = [
    formatItem("[proj]", "Project", chalk.cyan(projectName)),
    formatItem("[dir]", "Location", chalk.cyan(projectPath)),

    formatSectionHeader("Build Configuration"),
    formatItem("[pkg]", "Package Manager", chalk.green(userChoices.packageManager)),
    formatItem(
      "[fw]",
      "Framework",
      chalk.yellow(userChoices.framework),
      getFrameworkDescriptor(userChoices.framework),
    ),

    userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? formatItem(
          "[router]",
          "Routing",
          chalk.yellow(userChoices.routing),
          getRoutingDescriptor(userChoices.routing),
        )
      : "",

    // conditionally show routing for next.js
    userChoices.framework === "nextjs"
      ? formatItem("[router]", "Router Type", chalk.blue(userChoices.nextRouting))
      : "",

    formatSectionHeader("Developer Experience"),
    formatItem("[lang]", "TypeScript", getStatusSymbol(userChoices.typescript)),
    formatItem(
      "[lint]",
      "Linting",
      getStatusSymbol(userChoices.linting),
      userChoices.linting ? "ESLint + Prettier" : "",
    ),
    formatItem(
      "[style]",
      "Styling",
      chalk.magenta(userChoices.styling),
      getStylingDescriptor(userChoices.styling),
    ),

    formatSectionHeader("Project Tools"),
    formatItem("[git]", "Git Repository", getStatusSymbol(userChoices.initGit)),
    userChoices.openEditor
      ? formatItem("[edit]", "Editor", chalk.cyan(userChoices.editor))
      : formatItem("[edit]", "Open in Editor", getStatusSymbol(userChoices.openEditor)),

    // Add warnings section if there are any
    validation.warnings && validation.warnings.length > 0
      ? formatSectionHeader("Configuration Recommendations")
      : "",
    ...(validation.warnings || []).map((warning) => chalk.yellow(`  ${warning}`)),

    // action hint at the bottom
    "",
    chalk.gray("» Press Y to proceed or N to reconfigure «"),
  ]
    .filter(Boolean)
    .join("\n");

  return boxen(content, {
    title: " Your React Project Configuration ",
    titleAlignment: "center",
    padding: 1,
    margin: 1,
    borderColor: "cyan",
    borderStyle: "round",
  });
}

// display the summary and ask for confirmation
export async function showSummaryPrompt(projectPath, projectName, userChoices) {
  const summary = generateSummary(projectPath, projectName, userChoices);
  console.log(summary);

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: "Proceed with this configuration?",
      default: true,
    },
  ]);

  return confirmed;
}
