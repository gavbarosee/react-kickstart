import chalk from "chalk";
import symbols from "log-symbols";
import figures from "figures";

// to track steps during prompts selection
let currentStep = 0;
let totalSteps = 0;

export function initSteps(total) {
  totalSteps = total;
  currentStep = 0;
}

export function nextStep(message) {
  currentStep++;
  console.log();
  console.log(
    chalk.cyan(
      `${figures.pointer} [Step ${currentStep}/${totalSteps}] ${message}`
    )
  );
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
  console.error(`${chalk.red(symbols.error)} ${message}`);
}

export function debug(message, isVerbose = false) {
  if (isVerbose) {
    console.log(`${chalk.gray(figures.info)} ${message}`);
  }
}

export function mainHeader(title) {
  console.log("\n");
  console.log(
    chalk.bold.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  );
  console.log(chalk.bold.cyan(`  ${title}`));
  console.log(
    chalk.bold.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  );
  console.log("\n");
}

export function subHeader(title) {
  console.log("\n");
  console.log(chalk.cyan(`  ${figures.play} ${chalk.bold(title)}`));
  console.log(chalk.cyan("  " + "─".repeat(40)));
  console.log("\n");
}

export function divider() {
  console.log(
    "\n" +
      chalk.gray("· · · · · · · · · · · · · · · · · · · · · · · · · · · ·") +
      "\n"
  );
}

export function section(title) {
  console.log();
  console.log(chalk.cyan("╭─────────────────────────────────────────────╮"));
  console.log(chalk.cyan(`│ ${title.padEnd(41)} │`));
  console.log(chalk.cyan("╰─────────────────────────────────────────────╯"));
  console.log();
}

export function bullet(text) {
  console.log(`  ${chalk.cyan(figures.bullet)} ${text}`);
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
