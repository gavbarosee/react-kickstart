import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";

/**
 * Handles the UI rendering and display logic for prompts
 */
export class PromptRenderer {
  constructor() {
    this.answers = {};
  }

  /**
   * Clears terminal and shows the main header
   */
  showHeader() {
    process.stdout.write("\x1Bc");
    console.log();
    console.log(
      chalk.blue(
        figlet.textSync("React Kickstart", {
          font: "Standard",
          horizontalLayout: "full",
        }),
      ),
    );
    console.log();
    console.log(chalk.cyan("  A modern CLI tool for creating React applications"));
    console.log(chalk.cyan("  ------------------------------------------------"));
    console.log();
  }

  /**
   * Shows a compact summary of previous selections
   */
  showSelectionSummary(answers) {
    if (Object.keys(answers).length === 0) return;

    console.log(chalk.bgBlue("  Your selections so far:"));

    if (answers.packageManager) {
      console.log(
        `  ${chalk.dim("•")} Package Manager: ${chalk.green(answers.packageManager)}`,
      );
    }

    if (answers.framework) {
      console.log(`  ${chalk.dim("•")} Framework: ${chalk.yellow(answers.framework)}`);
    }

    if (answers.framework === "nextjs" && answers.nextRouting) {
      console.log(
        `  ${chalk.dim("•")} Next.js Routing: ${chalk.blue(answers.nextRouting)}`,
      );
    }

    if (answers.typescript !== undefined) {
      console.log(
        `  ${chalk.dim("•")} TypeScript: ${
          answers.typescript ? chalk.green("Yes") : chalk.red("No")
        }`,
      );
    }

    if (answers.linting !== undefined) {
      console.log(
        `  ${chalk.dim("•")} Linting: ${
          answers.linting ? chalk.green("Yes") : chalk.red("No")
        }`,
      );
    }

    if (answers.styling) {
      console.log(`  ${chalk.dim("•")} Styling: ${chalk.magenta(answers.styling)}`);
    }

    if (answers.routing) {
      console.log(`  ${chalk.dim("•")} Routing: ${chalk.blue(answers.routing)}`);
    }

    if (answers.stateManagement) {
      console.log(
        `  ${chalk.dim("•")} State Management: ${chalk.cyan(answers.stateManagement)}`,
      );
    }

    if (answers.initGit !== undefined) {
      console.log(
        `  ${chalk.dim("•")} Git Init: ${
          answers.initGit ? chalk.green("Yes") : chalk.red("No")
        }`,
      );
    }

    if (answers.openEditor !== undefined) {
      console.log(
        `  ${chalk.dim("•")} Open in Editor: ${
          answers.openEditor ? chalk.green("Yes") : chalk.red("No")
        }`,
      );

      if (answers.openEditor && answers.editor) {
        console.log(`  ${chalk.dim("•")} Editor: ${chalk.blue(answers.editor)}`);
      }
    }

    console.log();
  }

  /**
   * Displays the full screen with header and selections
   */
  refreshDisplay(answers) {
    this.showHeader();
    this.showSelectionSummary(answers);
  }

  /**
   * Shows step header with progress indicator
   */
  showStepHeader(stepNumber, totalSteps, title, icon = "•") {
    console.log();
    console.log(chalk.bold.cyan(` ${icon} STEP ${stepNumber} OF ${totalSteps}`));
    console.log(chalk.bold.white(` ${title}`));
    console.log(chalk.cyan("━".repeat(40)));
    console.log();
  }

  /**
   * Prompts user with a list of choices
   */
  async promptChoice(config) {
    const { selection } = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: config.message,
        choices: config.choices,
        default: config.default,
      },
    ]);

    return selection;
  }

  /**
   * Shows final completion message
   */
  showCompletion() {
    console.log(chalk.green("\n✓ Configuration complete! Here's your full setup:\n"));
    console.log(
      chalk.cyan("Note: ") +
        "The project will automatically start in your default browser after creation.\n",
    );
  }

  /**
   * Creates a separator for choice lists
   */
  createSeparator() {
    return new inquirer.Separator();
  }

  /**
   * Creates a back option for navigation
   */
  createBackOption() {
    return {
      name: chalk.yellow("← Back to previous step"),
      value: "BACK_OPTION",
    };
  }
}
