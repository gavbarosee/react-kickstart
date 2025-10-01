import chalk from "chalk";
import inquirer from "inquirer";

import { validateUserChoices } from "../core/validation.js";

function getFrameworkDescriptor(framework) {
  const descriptors = {
    vite: "Fast dev, optimized builds",
    nextjs: "SSR, full-stack",
  };
  return descriptors[framework] || "";
}

function getStylingDescriptor(styling) {
  const descriptors = {
    tailwind: "Utility-first CSS",
    "styled-components": "CSS-in-JS",
    css: "Standard CSS",
  };
  return descriptors[styling] || "";
}

function getRoutingDescriptor(routing) {
  const descriptors = {
    "react-router": "Comprehensive routing",
  };
  return descriptors[routing] || "";
}

function getStateManagementDescriptor(stateManagement) {
  const descriptors = {
    redux: "Predictable state",
    zustand: "Lightweight state",
    none: "None",
  };
  return descriptors[stateManagement] || "";
}

function getApiDescriptor(api) {
  const descriptors = {
    "axios-only": "HTTP client",
    "fetch-only": "Native fetch",
    "axios-react-query": "Axios + React Query",
    "fetch-react-query": "Fetch + React Query",
    none: "None",
  };
  return descriptors[api] || "";
}

function getTestingDescriptor(testing) {
  const descriptors = {
    vitest: "Fast unit tests",
    jest: "Testing framework",
    none: "None",
  };
  return descriptors[testing] || "";
}

function getDeploymentDescriptor(deployment) {
  const descriptors = {
    vercel: "Zero-config deployment",
    netlify: "Build optimization",
    none: "None",
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
    return chalk.dim(`\n${title}`);
  };

  // create summary content with logical grouping
  const content = [
    formatItem("", "Project", chalk.white(projectName)),
    formatItem("", "Location", chalk.dim(projectPath)),

    formatSectionHeader("Build Configuration"),
    formatItem("", "Package Manager", chalk.white(userChoices.packageManager)),
    formatItem(
      "",
      "Framework",
      chalk.white(userChoices.framework),
      getFrameworkDescriptor(userChoices.framework),
    ),

    userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? formatItem(
          "",
          "Routing",
          chalk.white(userChoices.routing),
          getRoutingDescriptor(userChoices.routing),
        )
      : "",

    // conditionally show routing for next.js
    userChoices.framework === "nextjs"
      ? formatItem("", "Router Type", chalk.white(userChoices.nextRouting))
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
      chalk.white(userChoices.styling),
      getStylingDescriptor(userChoices.styling),
    ),

    // State Management
    userChoices.stateManagement && userChoices.stateManagement !== "none"
      ? formatItem(
          "",
          "State Management",
          chalk.white(userChoices.stateManagement),
          getStateManagementDescriptor(userChoices.stateManagement),
        )
      : "",

    // API Setup
    userChoices.api && userChoices.api !== "none"
      ? formatItem(
          "",
          "API Setup",
          chalk.white(userChoices.api),
          getApiDescriptor(userChoices.api),
        )
      : "",

    // Testing
    userChoices.testing && userChoices.testing !== "none"
      ? formatItem(
          "",
          "Testing",
          chalk.white(userChoices.testing),
          getTestingDescriptor(userChoices.testing),
        )
      : "",

    formatSectionHeader("Project Tools"),
    // Deployment
    userChoices.deployment && userChoices.deployment !== "none"
      ? formatItem(
          "",
          "Deployment",
          chalk.white(userChoices.deployment),
          getDeploymentDescriptor(userChoices.deployment),
        )
      : "",
    formatItem("", "Git Repository", getStatusSymbol(userChoices.initGit)),
    userChoices.openEditor
      ? formatItem("", "Editor", chalk.white(userChoices.editor))
      : formatItem("", "Open in Editor", getStatusSymbol(userChoices.openEditor)),

    // Add warnings section if there are any
    validation.warnings && validation.warnings.length > 0
      ? formatSectionHeader("Recommendations")
      : "",
    ...(validation.warnings || []).map((warning) => chalk.dim(`  ${warning}`)),
  ]
    .filter(Boolean)
    .join("\n");

  // Simple header + content (no box)
  return `\n${chalk.white("Configuration")}\n\n${content}\n`;
}

// display the summary and ask for confirmation
export async function showSummaryPrompt(projectPath, projectName, userChoices) {
  const summary = generateSummary(projectPath, projectName, userChoices);
  console.log(summary);

  const { confirmed } = await inquirer.prompt(
    [
      {
        type: "confirm",
        name: "confirmed",
        message: "Proceed with this configuration?",
        default: true,
      },
    ],
    {
      theme: {
        prefix: chalk.white("→"),
        style: {
          answer: chalk.white,
          message: chalk.white,
          highlight: chalk.white,
        },
      },
    },
  );

  return confirmed;
}
