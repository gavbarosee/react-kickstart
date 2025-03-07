const execa = require("execa");
const ora = require("ora");
const chalk = require("chalk");
const { log } = require("./logger");

async function openEditor(projectPath, editor = "vscode") {
  const spinner = ora(`Opening project in ${editor}...`).start();

  try {
    log(`Opening project in ${editor}...`);

    let command;
    let args = [projectPath];

    switch (editor) {
      case "vscode":
        command = process.platform === "win32" ? "code.cmd" : "code";
        break;
      case "cursor":
        command = process.platform === "win32" ? "cursor.cmd" : "cursor";
        break;
      default:
        spinner.fail(`Unsupported editor: ${editor}`);
        return false;
    }

    try {
      await execa(command, args);
      spinner.succeed(`Project opened in ${editor}!`);
      return true;
    } catch (err) {
      spinner.fail(`Couldn't open ${editor}.`);
      console.log();
      console.log(chalk.yellow("This might be because:"));
      console.log(`  • ${editor} is not installed`);
      console.log(`  • ${editor} is not in your PATH`);
      console.log(
        `  • You need to install the shell command: ${chalk.cyan(
          `${editor} --install-extension`
        )}`
      );
      console.log();
      console.log(`To open your project manually, run:`);
      console.log(chalk.cyan(`  ${command} ${projectPath}`));
      console.log();
      return false;
    }
  } catch (err) {
    spinner.fail(`Failed to open project in ${editor}`);
    return false;
  }
}

module.exports = {
  openEditor,
};
