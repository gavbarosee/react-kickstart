import chalk from "chalk";
import inquirer from "inquirer";

import { COLORS } from "../../utils/ui/colors.js";

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
      await this.typeText(chalk.hex(COLORS.accent.reactCyan)("[ ⚛ ]"), 15);
      process.stdout.write(" ");
      await this.typeText(chalk.hex(COLORS.text.primary).bold("React Kickstart"), 15);

      // Hide cursor immediately and prepare for fade-in
      process.stdout.write("\x1B[?25l");
      console.log();

      // Brief pause after typing
      await this.delay(100);
      console.log();

      await this.fadeIn("Generate production-ready React starter apps in seconds", 120);

      console.log();

      // Fade in separator with enhanced smoothness
      await this.fadeInSeparator("─".repeat(process.stdout.columns || 80), 200);
      console.log();

      // Don't show cursor yet - let first step fade-in handle it
      // process.stdout.write("\x1B[?25h");

      this.hasAnimated = true; // Mark as animated
    } else {
      // Subsequent times: instant display
      const logo = chalk.hex(COLORS.accent.reactCyan)("[ ⚛ ]");
      const title = chalk.hex(COLORS.text.primary).bold("React Kickstart");
      console.log(`${logo} ${title}`);
      console.log();
      console.log(
        chalk.hex(COLORS.text.muted)(
          "Generate production-ready React starter apps in seconds",
        ),
      );
      console.log();

      // Separator appears instantly on subsequent renders
      console.log(chalk.hex(COLORS.text.dim)("─".repeat(process.stdout.columns || 80)));
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
      chalk.hex("#334155")(text),
      chalk.hex(COLORS.ui.separator)(text),
      chalk.hex("#54647d")(text),
      chalk.hex(COLORS.text.dim)(text),
      chalk.hex("#7889a0")(text),
      chalk.hex(COLORS.text.muted)(text),
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
      chalk.hex("#1e293b")(text),
      chalk.hex("#293548")(text),
      chalk.hex("#334155")(text),
      chalk.hex("#3d4d62")(text),
      chalk.hex(COLORS.ui.separator)(text),
      chalk.hex("#515e70")(text),
      chalk.hex("#5b6777")(text),
      chalk.hex(COLORS.text.dim)(text),
      chalk.hex("#758197")(text),
      chalk.hex(COLORS.text.muted)(text),
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

    const fadeSteps = [
      chalk.hex("#1e293b")(stepNumber) + " " + chalk.hex("#1e293b")(title),
      chalk.hex("#334155")(stepNumber) + " " + chalk.hex(COLORS.ui.separator)(title),
      chalk.hex(COLORS.ui.separator)(stepNumber) +
        " " +
        chalk.hex(COLORS.text.dim)(title),
      chalk.hex("#546375")(stepNumber) + " " + chalk.hex(COLORS.text.muted)(title),
      chalk.hex("#5d6f82")(stepNumber) + " " + chalk.hex(COLORS.text.tertiary)(title),
      chalk.hex(COLORS.text.dim)(stepNumber) +
        " " +
        chalk.hex(COLORS.text.secondary)(title),
      chalk.hex(COLORS.text.dim)(stepNumber) +
        " " +
        chalk.hex(COLORS.text.primary)(title),
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
    console.log(chalk.hex(COLORS.text.dim)("Configuration"));
    console.log();

    // Helper function to format each line with consistent padding
    const formatLine = (label, value) => {
      const paddedLabel = label.padEnd(17); // Consistent 17-char width for all labels
      return `  ${paddedLabel} ${value}`;
    };

    if (answers.packageManager) {
      console.log(
        formatLine(
          "Package Manager",
          chalk.hex(COLORS.text.tertiary)(answers.packageManager),
        ),
      );
    }

    if (answers.framework) {
      console.log(
        formatLine("Framework", chalk.hex(COLORS.text.tertiary)(answers.framework)),
      );
    }

    if (answers.framework === "nextjs" && answers.nextRouting) {
      console.log(
        formatLine("Routing", chalk.hex(COLORS.text.tertiary)(answers.nextRouting)),
      );
    }

    if (answers.typescript !== undefined) {
      console.log(
        formatLine(
          "TypeScript",
          answers.typescript
            ? chalk.hex(COLORS.status.success)("✓")
            : chalk.hex(COLORS.status.error)("×"),
        ),
      );
    }

    if (answers.linting !== undefined) {
      console.log(
        formatLine(
          "Linting",
          answers.linting
            ? chalk.hex(COLORS.status.success)("✓")
            : chalk.hex(COLORS.status.error)("×"),
        ),
      );
    }

    if (answers.styling) {
      console.log(
        formatLine("Styling", chalk.hex(COLORS.text.tertiary)(answers.styling)),
      );
    }

    if (answers.routing) {
      console.log(
        formatLine(
          "Routing",
          answers.routing === "none"
            ? chalk.hex(COLORS.text.dim)(answers.routing)
            : chalk.hex(COLORS.text.tertiary)(answers.routing),
        ),
      );
    }

    if (answers.stateManagement) {
      console.log(
        formatLine(
          "State",
          answers.stateManagement === "none"
            ? chalk.hex(COLORS.text.dim)(answers.stateManagement)
            : chalk.hex(COLORS.text.tertiary)(answers.stateManagement),
        ),
      );
    }

    if (answers.api) {
      console.log(
        formatLine(
          "API",
          answers.api === "none"
            ? chalk.hex(COLORS.text.dim)(answers.api)
            : chalk.hex(COLORS.text.tertiary)(answers.api),
        ),
      );
    }

    if (answers.testing) {
      console.log(
        formatLine(
          "Testing",
          answers.testing === "none"
            ? chalk.hex(COLORS.text.dim)(answers.testing)
            : chalk.hex(COLORS.text.tertiary)(answers.testing),
        ),
      );
    }

    if (answers.deployment) {
      console.log(
        formatLine(
          "Deployment",
          answers.deployment === "none"
            ? chalk.hex(COLORS.text.dim)(answers.deployment)
            : chalk.hex(COLORS.text.tertiary)(answers.deployment),
        ),
      );
    }

    if (answers.initGit !== undefined) {
      console.log(
        formatLine(
          "Git",
          answers.initGit
            ? chalk.hex(COLORS.status.success)("✓")
            : chalk.hex(COLORS.status.error)("×"),
        ),
      );
    }

    if (answers.openEditor !== undefined && answers.openEditor) {
      console.log(
        formatLine(
          "Editor",
          chalk.hex(COLORS.text.tertiary)(answers.editor || "vscode"),
        ),
      );
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
      console.log(
        chalk.hex(COLORS.ui.separator)("─".repeat(process.stdout.columns || 80)),
      );
      console.log();
    }

    const stepText = `Step ${stepNumber}/${totalSteps} ${title}`;

    if (isFirstStep) {
      // Pause before fading in first step for smooth transition
      // await this.delay(80);

      // Fade in the first step (cursor already hidden from header)
      await this.fadeInStep(stepText, 160);

      // Brief pause before showing the prompt to make transition smoother
      await this.delay(100);

      process.stdout.write("\x1B[?25h"); // Show cursor

      this.firstStepShown = true;
    } else {
      // Show subsequent steps instantly
      console.log(
        chalk.hex(COLORS.text.dim)(`Step ${stepNumber}/${totalSteps}`) +
          " " +
          chalk.hex(COLORS.text.primary)(title),
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
          prefix: chalk.hex(COLORS.text.primary)("→"),
          helpMode: "never",
          style: {
            answer: chalk.hex(COLORS.text.secondary),
            message: chalk.hex(COLORS.text.secondary),
            highlight: chalk.hex(COLORS.accent.reactCyan),
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
    console.log();
    console.log(
      chalk.hex(COLORS.status.success)("✓") +
        " " +
        chalk.hex(COLORS.text.primary)("Configuration complete"),
    );
    console.log();
    console.log(
      chalk.hex(COLORS.text.dim)(
        "The project will automatically start in your default browser after creation.",
      ),
    );
    console.log();
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
      name: chalk.hex(COLORS.text.dim)("← Back to previous step"),
      value: "BACK_OPTION",
    };
  }
}
