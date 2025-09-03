import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";

/**
 * Handles the UI rendering and display logic for prompts
 */
export class PromptRenderer {
  constructor() {
    this.answers = {};
    this.hasShownAnimation = false;
  }

  /**
   * Clears terminal and shows the main header (animated first time, static after)
   */
  async showHeader() {
    process.stdout.write("\x1Bc");
    console.log();

    // Generate the figlet text
    const figletText = figlet.textSync("React Kickstart", {
      font: "Small Slant",
      horizontalLayout: "fitted",
    });

    const lines = figletText.split("\n");
    const gradientColors = [
      chalk.rgb(0, 100, 200), // Deep blue
      chalk.rgb(0, 120, 180), // Steel blue
      chalk.rgb(0, 140, 160), // Teal blue
      chalk.rgb(0, 160, 140), // Blue-green
      chalk.rgb(0, 180, 120), // Emerald
      chalk.rgb(20, 200, 100), // Green
    ];

    if (!this.hasShownAnimation) {
      // Show animation on first run
      await this.animateLogoReveal(lines, gradientColors);
      this.hasShownAnimation = true;
    } else {
      // Show static logo for subsequent displays
      this.showStaticLogo(lines, gradientColors);
    }

    console.log();
    console.log(chalk.cyan("  A modern CLI tool for creating React applications"));
    console.log(chalk.cyan("  ------------------------------------------------"));
    console.log();
  }

  /**
   * Shows the static logo instantly (no animation)
   */
  showStaticLogo(lines, gradientColors) {
    const coloredLines = lines.map((line, index) => {
      const colorIndex = index % gradientColors.length;
      return gradientColors[colorIndex](line);
    });

    console.log(coloredLines.join("\n"));
  }

  /**
   * Animates the logo reveal from left to right with beautiful timing
   */
  async animateLogoReveal(lines, gradientColors) {
    const maxWidth = Math.max(...lines.map((line) => line.length));
    const animationSpeed = 8; // milliseconds per character (faster!)
    const lineDelay = 20; // milliseconds between starting each line (faster!)

    // Create placeholder for the logo
    const logoLines = lines.length;
    for (let i = 0; i < logoLines; i++) {
      console.log();
    }

    // Move cursor back to start of logo
    process.stdout.write(`\x1b[${logoLines}A`);

    // Animate each line with a slight delay
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const colorIndex = lineIndex % gradientColors.length;
      const color = gradientColors[colorIndex];

      // Start this line's animation after a delay
      setTimeout(async () => {
        await this.animateLineReveal(line, color, lineIndex, logoLines);
      }, lineIndex * lineDelay);
    }

    // Wait for all animations to complete
    const totalAnimationTime =
      (lines.length - 1) * lineDelay + maxWidth * animationSpeed + 100;
    await new Promise((resolve) => setTimeout(resolve, totalAnimationTime));
  }

  /**
   * Animates a single line revealing from left to right
   */
  async animateLineReveal(line, color, lineIndex, totalLines) {
    const chars = line.split("");
    let revealed = "";

    for (let i = 0; i <= chars.length; i++) {
      // Move cursor to the correct position
      process.stdout.write(`\x1b[${totalLines - lineIndex}A`); // Move up
      process.stdout.write("\x1b[0G"); // Move to start of line

      // Clear the line and show the revealed portion
      process.stdout.write("\x1b[2K"); // Clear entire line
      revealed = chars.slice(0, i).join("");
      process.stdout.write(color(revealed));

      // Move cursor back down
      process.stdout.write(`\x1b[${totalLines - lineIndex}B`);

      // Small delay for smooth animation
      if (i < chars.length) {
        await new Promise((resolve) => setTimeout(resolve, 8));
      }
    }
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

    if (answers.api) {
      console.log(`  ${chalk.dim("•")} API Setup: ${chalk.green(answers.api)}`);
    }

    if (answers.testing) {
      console.log(`  ${chalk.dim("•")} Testing: ${chalk.blue(answers.testing)}`);
    }

    if (answers.deployment) {
      console.log(
        `  ${chalk.dim("•")} Deployment: ${chalk.yellow(answers.deployment)}`,
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
  async refreshDisplay(answers) {
    await this.showHeader();
    this.showSelectionSummary(answers);
  }

  /**
   * Shows step header with progress indicator
   */
  showStepHeader(
    stepNumber,
    totalSteps,
    title,
    icon = "•",
    showNavInstructions = false,
  ) {
    console.log();
    console.log(chalk.bold.cyan(` ${icon} STEP ${stepNumber} OF ${totalSteps}`));
    console.log(chalk.bold.white(` ${title}`));
    console.log(chalk.cyan("━".repeat(40)));
    if (showNavInstructions) {
      console.log(chalk.dim("(Use ↑↓ to navigate, ← or Backspace to go back)"));
    }
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
      name: chalk.rgb(255, 140, 105)("← Back to previous step"),
      value: "BACK_OPTION",
    };
  }
}
