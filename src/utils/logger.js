import chalk from "chalk";
import symbols from "log-symbols";

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
    console.log(`${chalk.gray("debug")} ${message}`);
  }
}

export function section(title) {
  console.log();
  console.log(chalk.cyan("╭─────────────────────────────────────────────╮"));
  console.log(chalk.cyan(`│ ${title.padEnd(41)} │`));
  console.log(chalk.cyan("╰─────────────────────────────────────────────╯"));
  console.log();
}

export function bullet(text) {
  console.log(`  ${chalk.cyan("•")} ${text}`);
}
