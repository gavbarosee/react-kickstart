const execa = require("execa");

async function openEditor(projectPath, editor = "vscode") {
  try {
    console.log(`Opening project in ${editor}...`);

    let command;
    let args = [projectPath];

    // determine which command to run based on the editor choice
    switch (editor) {
      case "vscode":
        command = process.platform === "win32" ? "code.cmd" : "code";
        break;
      case "cursor":
        command = process.platform === "win32" ? "cursor.cmd" : "cursor";
        break;
      default:
        console.warn(`Unsupported editor: ${editor}`);
        return false;
    }

    try {
      await execa(command, args);
      console.log(`Project opened in ${editor}!`);
      return true;
    } catch (err) {
      console.warn(
        `Couldn't open ${editor}. It might not be installed or not in PATH.`
      );
      console.warn(
        `To open your project in ${editor}, run: ${command} ${projectPath}`
      );
      return false;
    }
  } catch (err) {
    console.warn(`Failed to open project in ${editor}`);
    return false;
  }
}

module.exports = {
  openEditor,
};
