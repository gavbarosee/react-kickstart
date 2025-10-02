import chalk from "chalk";
import inquirer from "inquirer";

export function generateSummary(projectPath, projectName, userChoices) {
  const getStatusSymbol = (value) => (value ? chalk.green("[✓]") : chalk.red("[x]"));

  // format each item in the summary with proper alignment
  const formatItem = (icon, label, value) => {
    const paddedLabel = `${icon} ${label}:`.padEnd(20);
    return `${paddedLabel} ${value}`;
  };

  const formatSectionHeader = (title) => {
    return chalk.dim(`\n${title}`);
  };

  // create summary content with logical grouping
  const content = [
    formatSectionHeader("Project"),
    formatItem("", "Name", chalk.white(projectName)),
    formatItem("", "Location", chalk.dim(projectPath)),

    formatSectionHeader("Build"),
    formatItem("", "Package Manager", chalk.white(userChoices.packageManager)),
    formatItem("", "Framework", chalk.white(userChoices.framework)),

    userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? formatItem("", "Routing", chalk.white(userChoices.routing))
      : "",

    // conditionally show routing for next.js
    userChoices.framework === "nextjs"
      ? formatItem("", "Router Type", chalk.white(userChoices.nextRouting))
      : "",

    formatSectionHeader("Developer Experience"),
    formatItem("", "TypeScript", getStatusSymbol(userChoices.typescript)),
    formatItem("", "Linting", getStatusSymbol(userChoices.linting)),
    formatItem("", "Styling", chalk.white(userChoices.styling)),

    // State Management
    userChoices.stateManagement && userChoices.stateManagement !== "none"
      ? formatItem("", "State Management", chalk.white(userChoices.stateManagement))
      : "",

    // API Setup
    userChoices.api && userChoices.api !== "none"
      ? formatItem("", "API Setup", chalk.white(userChoices.api))
      : "",

    // Testing
    userChoices.testing && userChoices.testing !== "none"
      ? formatItem("", "Testing", chalk.white(userChoices.testing))
      : "",

    formatSectionHeader("Tools"),
    // Deployment
    userChoices.deployment && userChoices.deployment !== "none"
      ? formatItem("", "Deployment", chalk.white(userChoices.deployment))
      : "",
    formatItem("", "Git Repository", getStatusSymbol(userChoices.initGit)),
    userChoices.openEditor
      ? formatItem("", "Editor", chalk.white(userChoices.editor))
      : formatItem("", "Open in Editor", getStatusSymbol(userChoices.openEditor)),
  ]
    .filter(Boolean)
    .join("\n");

  return `\n${chalk.white("Overview")}\n${content}\n`;
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
        prefix: chalk.white("→"),
        style: {
          answer: chalk.white,
          message: chalk.white,
          highlight: chalk.white,
        },
      },
    },
  );

  console.log();

  return confirmed;
}
