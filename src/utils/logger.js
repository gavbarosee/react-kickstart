const chalk = require("chalk");
const symbols = require("log-symbols");

function log(message) {
  console.log(`${chalk.blue(symbols.info)} ${message}`);
}

function success(message) {
  console.log(`${chalk.green(symbols.success)} ${message}`);
}

function warning(message) {
  console.log(`${chalk.yellow(symbols.warning)} ${message}`);
}

function error(message) {
  console.error(`${chalk.red(symbols.error)} ${message}`);
}

function debug(message, isVerbose = false) {
  if (isVerbose) {
    console.log(`${chalk.gray("debug")} ${message}`);
  }
}

function section(title) {
  console.log();
  console.log(chalk.cyan("╭─────────────────────────────────────────────╮"));
  console.log(chalk.cyan(`│ ${title.padEnd(41)} │`));
  console.log(chalk.cyan("╰─────────────────────────────────────────────╯"));
  console.log();
}

function bullet(text) {
  console.log(`  ${chalk.cyan("•")} ${text}`);
}

module.exports = {
  log,
  success,
  warning,
  error,
  debug,
  section,
  bullet,
};
