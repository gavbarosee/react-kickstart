import chalk from "chalk";

import { COLORS } from "./colors.js";
import { createUserErrorReporter } from "../../errors/index.js";
import { createUIRenderer } from "../../templates/index.js";

/**
 * Logging utilities - console output and messaging functions
 */

// Track steps during process
let currentStep = 0;
let totalSteps = 0;

// Create UI renderer instance
const uiRenderer = createUIRenderer();

/**
 * Initialize step tracking
 * @param {number} total - Total number of steps
 */
export function initSteps(total) {
  totalSteps = total;
  currentStep = 0;
}

/**
 * Move to next step and display progress
 * @param {string} message - Step message
 */
export function nextStep(message) {
  currentStep++;
  const theme = uiRenderer.engine.getTheme();
  uiRenderer.stepIndicator(currentStep, totalSteps, message, theme.icons.step);
}

/**
 * Display informational message
 * @param {string} message - Message to display
 */
export function log(message) {
  const theme = uiRenderer.engine.getTheme();
  console.log(`${chalk.hex(COLORS.accent.cyan)(theme.icons.info)} ${message}`);
}

/**
 * Display success message
 * @param {string} message - Message to display
 */
export function success(message) {
  const theme = uiRenderer.engine.getTheme();
  console.log(`${chalk.hex(COLORS.status.success)(theme.icons.success)} ${message}`);
}

/**
 * Display warning message
 * @param {string} message - Message to display
 */
export function warning(message) {
  const theme = uiRenderer.engine.getTheme();
  console.log(`${chalk.hex(COLORS.status.warning)(theme.icons.warning)} ${message}`);
}

/**
 * Display error message using standardized error reporting
 * @param {string} message - Error message
 */
export function error(message) {
  // Use standardized error reporting when possible
  const userReporter = createUserErrorReporter();
  userReporter.formatError("Error", message);
}

/**
 * Display debug message (only if verbose mode)
 * @param {string} message - Debug message
 * @param {boolean} isVerbose - Whether to show debug message
 */
export function debug(message, isVerbose = false) {
  if (isVerbose) {
    const theme = uiRenderer.engine.getTheme();
    console.log(`${chalk.gray(theme.icons.info)} ${message}`);
  }
}

/**
 * Display section header with step indication and progress
 * @param {string} title - Section title
 */
export function section(title) {
  // Icons for each step category
  const theme = uiRenderer.engine.getTheme();
  const stepIcons = {
    "Package Manager": theme.icons.package,
    "Framework Selection": theme.icons.framework,
    "Next.js Options": theme.icons.rocket,
    "Language Options": theme.icons.language,
    "Code Quality": theme.icons.tools,
    "Styling Solution": theme.icons.styling,
    "Git Options": theme.icons.git,
    "Editor Options": theme.icons.editor,
    // default icon if no match
    default: theme.icons.bullet,
  };

  // Extract step number if present (e.g., "Step 1/8: Package Manager")
  const stepMatch = title.match(/Step (\d+)\/(\d+): (.*)/);

  if (stepMatch) {
    const currentStep = parseInt(stepMatch[1]);
    const totalSteps = parseInt(stepMatch[2]);
    const stepTitle = stepMatch[3];
    const icon = stepIcons[stepTitle] || stepIcons.default;

    uiRenderer.stepIndicator(currentStep, totalSteps, stepTitle, icon);
  } else {
    // Fallback for sections that don't follow the step pattern
    uiRenderer.section(title);
  }
}

/**
 * Display main header
 * @param {string} title - Header title
 */
export function mainHeader(title) {
  uiRenderer.header(title, { width: 54 });
}

/**
 * Display sub header
 * @param {string} title - Sub header title
 */
export function subHeader(title) {
  const theme = uiRenderer.engine.getTheme();
  uiRenderer.section(title, theme.icons.arrow, { width: 40 });
}

/**
 * Display divider line
 */
export function divider() {
  console.log(chalk.hex(COLORS.ui.separator)("─".repeat(process.stdout.columns || 80)));
}

/**
 * Display bullet point
 * @param {string} text - Bullet text
 */
export function bullet(text) {
  const theme = uiRenderer.engine.getTheme();
  uiRenderer.bulletList([text], { indent: 2, bullet: theme.icons.bullet });
}

/**
 * Display framework-specific log message
 * @param {string} message - Framework message
 */
export function frameworkLog(message) {
  const theme = uiRenderer.engine.getTheme();
  console.log(`${chalk.hex(COLORS.accent.cyan)(theme.icons.sparkles)} ${message}`);
}

/**
 * Display styling-specific log message
 * @param {string} message - Styling message
 */
export function stylingLog(message) {
  const theme = uiRenderer.engine.getTheme();
  console.log(`${chalk.magenta(theme.icons.styling)} ${message}`);
}

/**
 * Display step section with items
 * @param {string} emoji - Section emoji
 * @param {string} title - Section title
 * @param {Array} items - Array of items to display
 */
export function stepSection(emoji, title, items = []) {
  uiRenderer.stepSection(emoji, title, items);
}

/**
 * Display progress bar
 * @param {number} percentage - Progress percentage
 * @param {string} label - Progress label
 * @param {number} size - Progress bar size
 */
export function progressBar(percentage, label = "", size = 30) {
  const output = uiRenderer.progressBar(percentage, label, { size });
  const theme = uiRenderer.engine.getTheme();
  console.log(`  ${theme.icons.info} ${output}`);
}

/**
 * Display file generation info
 * @param {string} projectPath - Project path
 */
export function fileGenerationInfo(projectPath) {
  // This will be moved to use consolidated filesystem utilities
  const theme = uiRenderer.engine.getTheme();
  console.log(
    `  ${theme.icons.package} Project files generated at ${chalk.cyan(projectPath)}`,
  );
}

// Inline progress state
let __progressInterval = null;
let __progressPercent = 0;
let __progressLabel = "";
let __progressSize = 24;
let __progressActive = false;
let __bufferedMessages = [];

// Dynamic status messages that rotate during progress
const progressMessages = [
  "Setting up your project",
  "Creating project structure",
  "Configuring dependencies",
  "Adding the finishing touches",
];

/**
 * Start an inline updating progress bar (single-line, terminal-friendly)
 * @param {string} label - Label to show before the bar
 * @param {object} options - Optional settings { size?: number }
 */
export function startProgress(label = "", options = {}) {
  // Compute bar size adaptively for small terminals
  const columns = process.stdout.columns || 80;
  const requestedSize = typeof options.size === "number" ? options.size : null;
  __progressSize = requestedSize || Math.max(10, Math.min(40, columns - 40));

  // Reset any existing progress
  stopProgress(false);

  __progressLabel = label;
  __progressPercent = 0;

  // Use template engine directly to avoid auto-logging
  const renderProgress = uiRenderer.engine.createRenderer("progressBar");

  // Initial draw
  const initial = renderProgress(__progressPercent, __progressLabel, {
    size: __progressSize,
  });
  process.stdout.write(`  ${initial}`);

  __progressInterval = setInterval(() => {
    // Smoothly advance up to 95% while work is ongoing
    if (__progressPercent < 95) {
      const step = __progressPercent < 50 ? 2 : 1;
      __progressPercent = Math.min(95, __progressPercent + step);
    }

    // Rotate through dynamic messages based on progress
    let currentMessage = __progressLabel;
    if (__progressPercent > 0) {
      const messageIndex = Math.floor(
        (__progressPercent / 100) * progressMessages.length,
      );
      const boundedIndex = Math.min(messageIndex, progressMessages.length - 1);
      currentMessage = progressMessages[boundedIndex];
    }

    const line = renderProgress(__progressPercent, currentMessage, {
      size: __progressSize,
      animated: true,
    });
    // Clear the entire line before writing new content to prevent leftover characters
    const terminalWidth = process.stdout.columns || 80;
    process.stdout.write(`\r${" ".repeat(terminalWidth)}\r  ${line}`);
  }, 150);
}

/**
 * Stop the inline progress bar and optionally complete it at 100%
 * @param {boolean} complete - When true, show 100% before finalizing
 */
export function stopProgress(complete = true) {
  if (__progressInterval) {
    clearInterval(__progressInterval);
    __progressInterval = null;
  }

  if (__progressLabel) {
    const renderProgress = uiRenderer.engine.createRenderer("progressBar");
    const finalPercent = complete ? 100 : __progressPercent;

    if (complete) {
      // Clear the current line completely first
      process.stdout.write("\r" + " ".repeat(process.stdout.columns || 80) + "\r");

      // Show completion
      const finalLine = renderProgress(finalPercent, "", {
        size: __progressSize,
        animated: true,
      });
      process.stdout.write(`  ${finalLine}\n\n`);
    } else {
      const finalLine = renderProgress(finalPercent, __progressLabel, {
        size: __progressSize,
      });
      // Clear the entire line before writing final content
      const terminalWidth = process.stdout.columns || 80;
      process.stdout.write(`\r${" ".repeat(terminalWidth)}\r  ${finalLine}\n\n\n\n`);
    }
  }

  __progressPercent = 0;
  __progressLabel = "";
}
