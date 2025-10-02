import chalk from "chalk";
import inquirer from "inquirer";

export function generateSummary(projectPath, projectName, userChoices) {
  const getStatusSymbol = (value) =>
    value ? chalk.hex("#34d399")("[✓]") : chalk.red("[x]");

  // format each item in the summary with proper alignment
  const formatItem = (icon, label, value) => {
    const paddedLabel = `${icon} ${label}:`.padEnd(20);
    return `${paddedLabel} ${value}`;
  };

  const formatSectionHeader = (title) => {
    return chalk.hex("#64748b")(`\n${title}`);
  };

  // create summary content with logical grouping
  const content = [
    formatSectionHeader("Project"),
    formatItem("", "Name", chalk.hex("#e2e8f0")(projectName)),
    formatItem("", "Location", chalk.hex("#64748b")(projectPath)),

    formatSectionHeader("Build"),
    formatItem("", "Package Manager", chalk.hex("#e2e8f0")(userChoices.packageManager)),
    formatItem("", "Framework", chalk.hex("#e2e8f0")(userChoices.framework)),

    userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? formatItem("", "Routing", chalk.hex("#e2e8f0")(userChoices.routing))
      : "",

    // conditionally show routing for next.js
    userChoices.framework === "nextjs"
      ? formatItem("", "Router Type", chalk.hex("#e2e8f0")(userChoices.nextRouting))
      : "",

    formatSectionHeader("Developer Experience"),
    formatItem("", "TypeScript", getStatusSymbol(userChoices.typescript)),
    formatItem("", "Linting", getStatusSymbol(userChoices.linting)),
    formatItem("", "Styling", chalk.hex("#e2e8f0")(userChoices.styling)),

    // State Management
    userChoices.stateManagement && userChoices.stateManagement !== "none"
      ? formatItem(
          "",
          "State Management",
          chalk.hex("#e2e8f0")(userChoices.stateManagement),
        )
      : "",

    // API Setup
    userChoices.api && userChoices.api !== "none"
      ? formatItem("", "API Setup", chalk.hex("#e2e8f0")(userChoices.api))
      : "",

    // Testing
    userChoices.testing && userChoices.testing !== "none"
      ? formatItem("", "Testing", chalk.hex("#e2e8f0")(userChoices.testing))
      : "",

    formatSectionHeader("Tools"),
    // Deployment
    userChoices.deployment && userChoices.deployment !== "none"
      ? formatItem("", "Deployment", chalk.hex("#e2e8f0")(userChoices.deployment))
      : "",
    formatItem("", "Git Repository", getStatusSymbol(userChoices.initGit)),
    userChoices.openEditor
      ? formatItem("", "Editor", chalk.hex("#e2e8f0")(userChoices.editor))
      : formatItem("", "Open in Editor", getStatusSymbol(userChoices.openEditor)),
  ]
    .filter(Boolean)
    .join("\n");

  return `\n${chalk.hex("#f1f5f9")("Overview")}\n${content}\n`;
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
        prefix: chalk.hex("#f1f5f9")("→"),
        style: {
          answer: chalk.hex("#e2e8f0"),
          message: chalk.hex("#e2e8f0"),
          highlight: chalk.hex("#e2e8f0"),
        },
      },
    },
  );

  console.log();

  return confirmed;
}
