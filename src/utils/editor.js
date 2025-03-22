import execa from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { warning } from "./logger.js";
import { displayEditorSetup } from "./enhanced-logger.js";

export async function openEditor(projectPath, editor = "vscode", userChoices) {
  const { framework, typescript, styling } = userChoices || {};

  const spinner = ora({
    text: `Opening project in ${editor}...`,
    color: "magenta",
    spinner: "simpleDotsScrolling",
  }).start();

  try {
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

    // editor configuration files
    createEditorConfig(projectPath, editor, userChoices);

    // stop spinner to show detailed setup info
    spinner.stop();

    // show detailed editor setup information
    displayEditorSetup(editor, framework, styling, typescript);

    try {
      await execa(command, args);
      return true;
    } catch (err) {
      warning(
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

// create editor config files
function createEditorConfig(projectPath, editor, userChoices) {
  if (editor !== "vscode" && editor !== "cursor") return;

  const { typescript, styling, framework } = userChoices || {};

  // .vscode directory
  const vscodeDir = path.join(projectPath, ".vscode");
  fs.ensureDirSync(vscodeDir);

  // extensions.json with recommended extensions
  const extensions = {
    recommendations: ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"],
  };

  // ts extensions
  if (typescript) {
    extensions.recommendations.push(
      "ms-typescript.typescript-language-features"
    );
  }

  // add styling extensions
  if (styling === "tailwind") {
    extensions.recommendations.push("bradlc.vscode-tailwindcss");
  } else if (styling === "styled-components") {
    extensions.recommendations.push(
      "styled-components.vscode-styled-components"
    );
  }

  // add basic framework-specific extensions
  if (framework === "vite") {
    extensions.recommendations.push("antfu.vite");
  } else if (framework === "nextjs") {
    extensions.recommendations.push("mskelton.next-js-snippets");
  }

  // write extensions.json
  fs.writeJsonSync(path.join(vscodeDir, "extensions.json"), extensions, {
    spaces: 2,
  });

  // create settings.json with editor settings
  const settings = {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true,
    },
  };

  // add Tailwind-specific settings
  if (styling === "tailwind") {
    settings["tailwindCSS.includeLanguages"] = {
      javascript: "javascript",
      html: "html",
    };
    if (typescript) {
      settings["tailwindCSS.includeLanguages"]["typescript"] = "typescript";
    }
  }

  // write settings.json
  fs.writeJsonSync(path.join(vscodeDir, "settings.json"), settings, {
    spaces: 2,
  });

  // create launch.json for debugging
  const launch = {
    version: "0.2.0",
    configurations: [
      {
        type: "chrome",
        request: "launch",
        name: "Launch Chrome against localhost",
        url:
          framework === "nextjs"
            ? "http://localhost:3000"
            : framework === "parcel"
            ? "http://localhost:1234"
            : framework === "rsbuild"
            ? "http://localhost:8080"
            : "http://localhost:5173",
        webRoot: "${workspaceFolder}",
      },
    ],
  };

  // write launch.json
  fs.writeJsonSync(path.join(vscodeDir, "launch.json"), launch, { spaces: 2 });
}
