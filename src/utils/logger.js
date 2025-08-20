import chalk from "chalk";
import symbols from "log-symbols";
import figures from "figures";
import { createUserErrorReporter } from "../errors/index.js";
import { createUIRenderer } from "../templates/index.js";

// to track steps during prompts selection
let currentStep = 0;
let totalSteps = 0;

// Create UI renderer instance
const uiRenderer = createUIRenderer();

export function initSteps(total) {
  totalSteps = total;
  currentStep = 0;
}

export function nextStep(message) {
  currentStep++;
  uiRenderer.stepIndicator(currentStep, totalSteps, message, figures.pointer);
}

export function log(message) {
  console.log(`${chalk.blue(symbols.info)} ${message}`);
}

export function success(message) {
  console.log(`${chalk.green(symbols.success)} ${message}`);
}

export function warning(message) {
  console.log(`${chalk.yellow(symbols.warning)} ${message}`);
}

export function error(message) {
  // Use standardized error reporting when possible
  const userReporter = createUserErrorReporter();
  userReporter.formatError("Error", message);
}

export function debug(message, isVerbose = false) {
  if (isVerbose) {
    console.log(`${chalk.gray(figures.info)} ${message}`);
  }
}

// icons for each step category
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

// section header with step indication and progress
export function section(title) {
  // extract step number if present (e.g., "Step 1/8: Package Manager")
  const stepMatch = title.match(/Step (\d+)\/(\d+): (.*)/);

  if (stepMatch) {
    const currentStep = parseInt(stepMatch[1]);
    const totalSteps = parseInt(stepMatch[2]);
    const stepTitle = stepMatch[3];
    const icon = stepIcons[stepTitle] || stepIcons.default;

    uiRenderer.stepIndicator(currentStep, totalSteps, stepTitle, icon);
  } else {
    // fallback for sections that don't follow the step pattern
    uiRenderer.section(title);
  }
}

export function mainHeader(title) {
  uiRenderer.header(title, { width: 54 });
}

export function subHeader(title) {
  uiRenderer.section(title, figures.play, { width: 40 });
}

export function divider() {
  uiRenderer.divider("·", 47);
}

export function bullet(text) {
  uiRenderer.bulletList([text], { indent: 2, bullet: figures.bullet });
}

export function frameworkLog(message) {
  console.log(`${chalk.blue(figures.star)} ${message}`);
}

export function stylingLog(message) {
  console.log(`${chalk.magenta(figures.star)} ${message}`);
}

export function languageLog(message) {
  console.log(`${chalk.cyan(figures.star)} ${message}`);
}

export function toolingLog(message) {
  console.log(`${chalk.yellow(figures.star)} ${message}`);
}
