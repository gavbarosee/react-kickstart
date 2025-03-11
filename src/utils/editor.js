import execa from "execa";
import ora from "ora";
import { log, warning } from "./logger.js";

export async function openEditor(projectPath, editor = "vscode") {
  // const spinner = ora(`Opening project in ${editor}...`).start();
  const spinner = ora({
    text: `Opening project in ${editor}...`,
    color: "magenta",
    spinner: "simpleDotsScrolling",
  }).start();

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
      spinner.warn(
        `Couldn't open ${editor}. It might not be installed or not in PATH.`
      );
      warning(
        `To open your project in ${editor}, run: ${command} ${projectPath}`
      );
      return false;
    }
  } catch (err) {
    spinner.fail(`Failed to open project in ${editor}`);
    return false;
  }
}
