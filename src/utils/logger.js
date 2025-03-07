const chalk = require("chalk");

function log(message) {
  console.log(`${chalk.blue("info")} ${message}`);
}

function success(message) {
  console.log(`${chalk.green("success")} ${message}`);
}

function warning(message) {
  console.log(`${chalk.yellow("warning")} ${message}`);
}

function error(message) {
  console.error(`${chalk.red("error")} ${message}`);
}

function debug(message, isVerbose = false) {
  if (isVerbose) {
    console.log(`${chalk.gray("debug")} ${message}`);
  }
}

module.exports = {
  log,
  success,
  warning,
  error,
  debug,
};
