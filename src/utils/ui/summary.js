import chalk from "chalk";
import inquirer from "inquirer";

import { COLORS } from "./colors.js";

export function generateSummary(projectPath, projectName, userChoices) {
  const getStatusSymbol = (value) =>
    value ? chalk.hex(COLORS.status.success)("[✓]") : chalk.red("[×]");

  // format each item in the summary with proper alignment
  const formatItem = (label, value) => {
    const paddedLabel = `  ${label}`.padEnd(19); // Consistent 19-char width (2 spaces + 17 chars)
    return `${paddedLabel} ${value}`;
  };

  const formatSectionHeader = (title) => {
    return chalk.hex(COLORS.text.dim)(`\n${title}`);
  };

  // create summary content with logical grouping
  const content = [
    formatSectionHeader("Project"),
    formatItem("Name", chalk.hex(COLORS.text.secondary)(projectName)),
    formatItem("Location", chalk.hex(COLORS.text.dim)(projectPath)),

    formatSectionHeader("Build"),
    formatItem(
      "Package Manager",
      chalk.hex(COLORS.text.secondary)(userChoices.packageManager),
    ),
    formatItem("Framework", chalk.hex(COLORS.text.secondary)(userChoices.framework)),

    userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? formatItem("Routing", chalk.hex(COLORS.text.secondary)(userChoices.routing))
      : "",

    // conditionally show routing for next.js
    userChoices.framework === "nextjs"
      ? formatItem(
          "Router Type",
          chalk.hex(COLORS.text.secondary)(userChoices.nextRouting),
        )
      : "",

    formatSectionHeader("Developer Experience"),
    formatItem("TypeScript", getStatusSymbol(userChoices.typescript)),
    formatItem("Linting", getStatusSymbol(userChoices.linting)),
    formatItem("Styling", chalk.hex(COLORS.text.secondary)(userChoices.styling)),

    // State Management
    userChoices.stateManagement && userChoices.stateManagement !== "none"
      ? formatItem(
          "State Management",
          chalk.hex(COLORS.text.secondary)(userChoices.stateManagement),
        )
      : "",

    // API Setup
    userChoices.api && userChoices.api !== "none"
      ? formatItem("API Setup", chalk.hex(COLORS.text.secondary)(userChoices.api))
      : "",

    // Testing
    userChoices.testing && userChoices.testing !== "none"
      ? formatItem("Testing", chalk.hex(COLORS.text.secondary)(userChoices.testing))
      : "",

    formatSectionHeader("Tools"),
    // Deployment
    userChoices.deployment && userChoices.deployment !== "none"
      ? formatItem(
          "Deployment",
          chalk.hex(COLORS.text.secondary)(userChoices.deployment),
        )
      : "",
    formatItem("Git Repository", getStatusSymbol(userChoices.initGit)),
    userChoices.openEditor
      ? formatItem("Editor", chalk.hex(COLORS.text.secondary)(userChoices.editor))
      : formatItem("Open in Editor", getStatusSymbol(userChoices.openEditor)),
  ]
    .filter(Boolean)
    .join("\n");

  return `\n${chalk.hex(COLORS.text.primary)("Overview")}\n${content}\n`;
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
        message: "Continue?",
        default: true,
      },
    ],
    {
      theme: {
        prefix: chalk.hex(COLORS.text.primary)("→"),
        style: {
          answer: chalk.hex(COLORS.text.secondary),
          message: chalk.hex(COLORS.text.secondary),
          highlight: chalk.hex(COLORS.text.secondary),
        },
      },
    },
  );

  console.log();

  return confirmed;
}
