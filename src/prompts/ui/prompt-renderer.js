import chalk from "chalk";
import inquirer from "inquirer";

/**
 * Handles the UI rendering and display logic for prompts
 */
export class PromptRenderer {
  constructor() {
    this.answers = {};
    this.hasAnimated = false; // Track if animation has played
    this.firstStepShown = false; // Track if first step has been shown
  }

  /**
   * Clears terminal and shows the main header with typing animation (only first time)
   */
  async showHeader() {
    process.stdout.write("\x1Bc");
    console.log();

    if (!this.hasAnimated) {
      // Type logo + title
      await this.typeText(chalk.white("[/]"), 30);
      process.stdout.write(" ");
      await this.typeText(chalk.white.bold("React Kickstart"), 30);

      // Hide cursor immediately and prepare for fade-in
      process.stdout.write("\x1B[?25l");
      console.log();

      // Brief pause after typing
      await this.delay(200);
      console.log();

      await this.fadeIn("Generate production-ready React starter apps in seconds", 240);

      console.log();

      // Fade in separator with enhanced smoothness
      await this.fadeInSeparator("─".repeat(process.stdout.columns || 80), 400);
      console.log();

      // Show cursor again for prompts
      process.stdout.write("\x1B[?25h");

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
   * Fade in text by gradually increasing opacity
   */
  async fadeIn(text, durationMs = 300) {
    const fadeSteps = [
      chalk.hex("#333333")(text),
      chalk.hex("#444444")(text),
      chalk.hex("#555555")(text),
      chalk.hex("#666666")(text),
      chalk.hex("#777777")(text),
      chalk.gray(text),
    ];

    // Use ANSI clear code for flicker-free rendering
    const clearLine = "\r\x1B[2K";
    const stepDelay = durationMs / fadeSteps.length;

    for (const step of fadeSteps) {
      process.stdout.write(clearLine + step);
      await this.delay(stepDelay);
    }

    console.log(); // Move to next line after fade complete
  }

  /**
   * Fade in separator with extra smooth gradient
   */
  async fadeInSeparator(text, durationMs = 400) {
    const fadeSteps = [
      chalk.hex("#2a2a2a")(text),
      chalk.hex("#333333")(text),
      chalk.hex("#3d3d3d")(text),
      chalk.hex("#474747")(text),
      chalk.hex("#525252")(text),
      chalk.hex("#5c5c5c")(text),
      chalk.hex("#666666")(text),
      chalk.hex("#707070")(text),
      chalk.hex("#7a7a7a")(text),
      chalk.gray(text),
    ];

    // Use ANSI clear code for flicker-free rendering
    const clearLine = "\r\x1B[2K";
    const stepDelay = durationMs / fadeSteps.length;

    for (const step of fadeSteps) {
      process.stdout.write(clearLine + step);
      await this.delay(stepDelay);
    }

    console.log(); // Move to next line after fade complete
  }

  /**
   * Fade in white text (for logo and title)
   */
  async fadeInWhite(text, durationMs = 300) {
    const fadeSteps = [
      chalk.hex("#333333")(text),
      chalk.hex("#444444")(text),
      chalk.hex("#555555")(text),
      chalk.hex("#666666")(text),
      chalk.hex("#777777")(text),
      chalk.hex("#888888")(text),
      chalk.hex("#999999")(text),
      chalk.hex("#aaaaaa")(text),
      chalk.hex("#bbbbbb")(text),
      chalk.hex("#cccccc")(text),
      chalk.hex("#dddddd")(text),
      chalk.hex("#eeeeee")(text),
      chalk.white(text),
      chalk.white.bold(text),
    ];

    // Use ANSI clear code for flicker-free rendering
    const clearLine = "\r\x1B[2K";
    const stepDelay = durationMs / fadeSteps.length;

    for (const step of fadeSteps) {
      process.stdout.write(clearLine + step);
      await this.delay(stepDelay);
    }

    console.log(); // Move to next line after fade complete
  }

  /**
   * Fade in step header (mixed dim and white text)
   */
  async fadeInStep(stepText, durationMs = 300) {
    // Extract parts: "Step X/Y Title"
    const parts = stepText.match(/^(Step \d+\/\d+) (.+)$/);
    if (!parts) {
      console.log(stepText);
      return;
    }

    const stepNumber = parts[1];
    const title = parts[2];

    // Create smooth fade steps with gradual progression
    const fadeSteps = [
      chalk.hex("#2a2a2a")(stepNumber) + " " + chalk.hex("#2a2a2a")(title),
      chalk.hex("#3a3a3a")(stepNumber) + " " + chalk.hex("#3a3a3a")(title),
      chalk.hex("#4a4a4a")(stepNumber) + " " + chalk.hex("#555555")(title),
      chalk.hex("#555555")(stepNumber) + " " + chalk.hex("#777777")(title),
      chalk.hex("#666666")(stepNumber) + " " + chalk.hex("#999999")(title),
      chalk.hex("#777777")(stepNumber) + " " + chalk.hex("#bbbbbb")(title),
      chalk.dim(stepNumber) + " " + chalk.white(title),
    ];

    // Use ANSI clear code for flicker-free rendering
    const clearLine = "\r\x1B[2K";
    const stepDelay = durationMs / fadeSteps.length;

    for (const step of fadeSteps) {
      process.stdout.write(clearLine + step);
      await this.delay(stepDelay);
    }

    console.log(); // Move to next line after fade complete
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
  async showStepHeader(stepNumber, totalSteps, title, _ = "•", answers = {}) {
    const isFirstStep = !this.firstStepShown && Object.keys(answers).length === 0;

    // Only show separator if there's configuration to separate from
    if (Object.keys(answers).length > 0) {
      console.log(chalk.dim("─".repeat(process.stdout.columns || 80)));
      console.log();
    }

    const stepText = `Step ${stepNumber}/${totalSteps} ${title}`;

    if (isFirstStep) {
      // Pause before fading in first step for smooth transition
      await this.delay(300);

      // Fade in the first step
      process.stdout.write("\x1B[?25l"); // Hide cursor
      await this.fadeInStep(stepText, 300);
      process.stdout.write("\x1B[?25h"); // Show cursor

      this.firstStepShown = true;
    } else {
      // Show subsequent steps instantly
      console.log(
        chalk.dim(`Step ${stepNumber}/${totalSteps}`) + " " + chalk.white(title),
      );
    }

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
