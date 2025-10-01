import chalk from "chalk";
import inquirer from "inquirer";

/**
 * Handles the UI rendering and display logic for prompts
 */
export class PromptRenderer {
  constructor() {
    this.answers = {};
    this.hasAnimated = false; // Track if animation has played
  }

  /**
   * Clears terminal and shows the main header with typing animation (only first time)
   */
  async showHeader() {
    process.stdout.write("\x1Bc");
    console.log();

    if (!this.hasAnimated) {
      // First time: typing animation (premium speed)
      await this.typeText(chalk.white("[/]"), 20);
      process.stdout.write(" ");
      await this.typeText(chalk.white.bold("React Kickstart"), 20);
      console.log();
      console.log();

      await this.delay(60);
      await this.typeText(
        chalk.gray("Generate production-ready React starter apps in seconds"),
        12,
      );
      console.log();
      console.log();

      // Separator "draws" across as final touch
      await this.typeText(chalk.gray("─".repeat(process.stdout.columns || 80)), 2);
      console.log();

      this.hasAnimated = true; // Mark as animated
    } else {
      // Subsequent times: instant display
      const logo = chalk.white("[/]");
      const title = chalk.white.bold("React Kickstart");
      console.log(`${logo} ${title}`);
      console.log();
      console.log(
        chalk.gray("Generate production-ready React starter apps in seconds"),
      );
      console.log();

      // Separator appears instantly on subsequent renders
      console.log(chalk.gray("─".repeat(process.stdout.columns || 80)));
      console.log();
    }
  }

  /**
   * Types text character by character
   */
  async typeText(text, speed = 50) {
    // Strip ANSI codes to get actual characters
    // eslint-disable-next-line no-control-regex
    const plainText = text.replace(/\u001b\[[0-9;]*m/g, "");

    // Extract chalk styling codes
    const prefix = text.substring(0, text.indexOf(plainText));
    const suffix = text.substring(text.indexOf(plainText) + plainText.length);

    for (let i = 0; i < plainText.length; i++) {
      const char = plainText[i];
      // Write character with original styling
      process.stdout.write(prefix + char + suffix);
      await this.delay(speed);
    }
  }

  /**
   * Simple delay utility
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Shows a compact summary of previous selections
   */
  showSelectionSummary(answers) {
    if (Object.keys(answers).length === 0) return;
    console.log(chalk.dim("Configuration"));

    if (answers.packageManager) {
      console.log(`  Package Manager  ${chalk.white(answers.packageManager)}`);
    }

    if (answers.framework) {
      console.log(`  Framework        ${chalk.white(answers.framework)}`);
    }

    if (answers.framework === "nextjs" && answers.nextRouting) {
      console.log(`  Routing          ${chalk.white(answers.nextRouting)}`);
    }

    if (answers.typescript !== undefined) {
      console.log(
        `  TypeScript       ${answers.typescript ? chalk.green("Yes") : chalk.dim("No")}`,
      );
    }

    if (answers.linting !== undefined) {
      console.log(
        `  Linting          ${answers.linting ? chalk.green("Yes") : chalk.dim("No")}`,
      );
    }

    if (answers.styling) {
      console.log(`  Styling          ${chalk.white(answers.styling)}`);
    }

    if (answers.routing) {
      console.log(`  Routing          ${chalk.white(answers.routing)}`);
    }

    if (answers.stateManagement) {
      console.log(`  State            ${chalk.white(answers.stateManagement)}`);
    }

    if (answers.api) {
      console.log(`  API              ${chalk.white(answers.api)}`);
    }

    if (answers.testing) {
      console.log(`  Testing          ${chalk.white(answers.testing)}`);
    }

    if (answers.deployment) {
      console.log(`  Deployment       ${chalk.white(answers.deployment)}`);
    }

    if (answers.initGit !== undefined) {
      console.log(
        `  Git              ${answers.initGit ? chalk.green("Yes") : chalk.dim("No")}`,
      );
    }

    if (answers.openEditor !== undefined && answers.openEditor) {
      console.log(`  Editor           ${chalk.white(answers.editor || "vscode")}`);
    }
  }

  /**
   * Displays the full screen with header and selections
   */
  async refreshDisplay(answers) {
    await this.showHeader();
    this.showSelectionSummary(answers);
  }

  /**
   * Shows step header with progress indicator
   */
  showStepHeader(stepNumber, totalSteps, title, _ = "•") {
    console.log();
    console.log(
      chalk.dim(`Step ${stepNumber}/${totalSteps}`) + " " + chalk.white(title),
    );
    console.log();
  }

  /**
   * Prompts user with a list of choices
   */
  async promptChoice(config) {
    const { selection } = await inquirer.prompt(
      [
        {
          type: "list",
          name: "selection",
          message: config.message,
          choices: config.choices,
          default: config.default,
          loop: false,
          pageSize: 10,
          theme: {
            helpMode: "never", // Disable help text at prompt level
          },
        },
      ],
      {
        theme: {
          prefix: chalk.white("→"),
          helpMode: "never",
          style: {
            answer: chalk.white,
            message: chalk.white,
            highlight: chalk.white,
          },
        },
      },
    );

    return selection;
  }

  /**
   * Shows final completion message
   */
  showCompletion() {
    console.log(chalk.green("\n✓") + " " + chalk.white("Configuration complete\n"));
    console.log(
      chalk.dim(
        "The project will automatically start in your default browser after creation.\n",
      ),
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
      name: chalk.dim("← Back to previous step"),
      value: "BACK_OPTION",
    };
  }
}
