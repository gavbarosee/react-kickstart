import chalk from "chalk";
import symbols from "log-symbols";
import figures from "figures";
import { createUIRenderer } from "../../templates/index.js";
import { createUserErrorReporter } from "../../errors/index.js";

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
  uiRenderer.stepIndicator(currentStep, totalSteps, message, figures.pointer);
}

/**
 * Display informational message
 * @param {string} message - Message to display
 */
export function log(message) {
  console.log(`${chalk.blue(symbols.info)} ${message}`);
}

/**
 * Display success message
 * @param {string} message - Message to display
 */
export function success(message) {
  console.log(`${chalk.green(symbols.success)} ${message}`);
}

/**
 * Display warning message
 * @param {string} message - Message to display
 */
export function warning(message) {
  console.log(`${chalk.yellow(symbols.warning)} ${message}`);
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
    console.log(`${chalk.gray(figures.info)} ${message}`);
  }
}

/**
 * Display section header with step indication and progress
 * @param {string} title - Section title
 */
export function section(title) {
  // Icons for each step category
  const stepIcons = {
    "Package Manager": "📦",
    "Framework Selection": "🚀",
    "Next.js Options": "▲ ",
    "Language Options": "🔤",
    "Code Quality": "✨",
    "Styling Solution": "🎨",
    "Git Options": "🔄",
    "Editor Options": "📝",
    // default icon if no match
    default: "•",
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
  uiRenderer.section(title, figures.play, { width: 40 });
}

/**
 * Display divider line
 */
export function divider() {
  uiRenderer.divider("·", 47);
}

/**
 * Display bullet point
 * @param {string} text - Bullet text
 */
export function bullet(text) {
  uiRenderer.bulletList([text], { indent: 2, bullet: figures.bullet });
}

/**
 * Display framework-specific log message
 * @param {string} message - Framework message
 */
export function frameworkLog(message) {
  console.log(`${chalk.blue(figures.star)} ${message}`);
}

/**
 * Display styling-specific log message
 * @param {string} message - Styling message
 */
export function stylingLog(message) {
  console.log(`${chalk.magenta(figures.play)} ${message}`);
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
  console.log(`  📊 ${output}`);
}

/**
 * Display file generation info
 * @param {string} projectPath - Project path
 */
export function fileGenerationInfo(projectPath) {
  // This will be moved to use consolidated filesystem utilities
  console.log(`  📦 Project files generated at ${chalk.cyan(projectPath)}`);
}

// Inline progress state
let __progressInterval = null;
let __progressPercent = 0;
let __progressLabel = "";
let __progressSize = 24;

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

    const line = renderProgress(__progressPercent, __progressLabel, {
      size: __progressSize,
    });
    process.stdout.write(`\r  ${line}`);
  }, 120);
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
    const finalLine = renderProgress(finalPercent, __progressLabel, {
      size: __progressSize,
    });
    process.stdout.write(`\r  ${finalLine}\n\n`);
  }

  __progressPercent = 0;
  __progressLabel = "";
}
