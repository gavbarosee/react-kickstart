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

function getStateManagementDescriptor(stateManagement) {
  const descriptors = {
    redux: "Predictable state container",
    zustand: "Lightweight state management",
    none: "No state management",
  };
  return descriptors[stateManagement] || "";
}

function getApiDescriptor(api) {
  const descriptors = {
    "axios-only": "Promise-based HTTP client",
    "fetch-only": "Native browser fetch API",
    "axios-react-query": "Axios + React Query for server state",
    "fetch-react-query": "Fetch + React Query for server state",
    none: "No API setup",
  };
  return descriptors[api] || "";
}

function getTestingDescriptor(testing) {
  const descriptors = {
    vitest: "Fast unit test framework",
    jest: "JavaScript testing framework",
    none: "No testing setup",
  };
  return descriptors[testing] || "";
}

function getDeploymentDescriptor(deployment) {
  const descriptors = {
    vercel: "Zero-config deployments with Next.js integration",
    netlify: "Powerful platform with build optimization",
    none: "No deployment setup",
  };
  return descriptors[deployment] || "";
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
    formatItem("", "Project", chalk.cyan(projectName)),
    formatItem("", "Location", chalk.cyan(projectPath)),

    formatSectionHeader("Build Configuration"),
    formatItem("", "Package Manager", chalk.green(userChoices.packageManager)),
    formatItem(
      "",
      "Framework",
      chalk.yellow(userChoices.framework),
      getFrameworkDescriptor(userChoices.framework),
    ),

    userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? formatItem(
          "",
          "Routing",
          chalk.yellow(userChoices.routing),
          getRoutingDescriptor(userChoices.routing),
        )
      : "",

    // conditionally show routing for next.js
    userChoices.framework === "nextjs"
      ? formatItem("", "Router Type", chalk.blue(userChoices.nextRouting))
      : "",

    formatSectionHeader("Developer Experience"),
    formatItem("", "TypeScript", getStatusSymbol(userChoices.typescript)),
    formatItem(
      "",
      "Linting",
      getStatusSymbol(userChoices.linting),
      userChoices.linting ? "ESLint + Prettier" : "",
    ),
    formatItem(
      "",
      "Styling",
      chalk.magenta(userChoices.styling),
      getStylingDescriptor(userChoices.styling),
    ),

    // State Management
    userChoices.stateManagement && userChoices.stateManagement !== "none"
      ? formatItem(
          "",
          "State Management",
          chalk.blue(userChoices.stateManagement),
          getStateManagementDescriptor(userChoices.stateManagement),
        )
      : "",

    // API Setup
    userChoices.api && userChoices.api !== "none"
      ? formatItem(
          "",
          "API Setup",
          chalk.green(userChoices.api),
          getApiDescriptor(userChoices.api),
        )
      : "",

    // Testing
    userChoices.testing && userChoices.testing !== "none"
      ? formatItem(
          "",
          "Testing",
          chalk.cyan(userChoices.testing),
          getTestingDescriptor(userChoices.testing),
        )
      : "",

    formatSectionHeader("Project Tools"),
    // Deployment
    userChoices.deployment && userChoices.deployment !== "none"
      ? formatItem(
          "",
          "Deployment",
          chalk.yellow(userChoices.deployment),
          getDeploymentDescriptor(userChoices.deployment),
        )
      : "",
    formatItem("", "Git Repository", getStatusSymbol(userChoices.initGit)),
    userChoices.openEditor
      ? formatItem("", "Editor", chalk.cyan(userChoices.editor))
      : formatItem("", "Open in Editor", getStatusSymbol(userChoices.openEditor)),

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
