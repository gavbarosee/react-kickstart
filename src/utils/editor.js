import execa from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { log, warning } from "./logger.js";

export async function openEditor(projectPath, editor = "vscode", userChoices) {
  const { framework, typescript, styling } = userChoices || {};

  const editorName = editor === "vscode" ? "VS Code" : "Cursor";
  const spinner = ora({
    text: `Opening project in ${editorName}...`,
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

    createEditorConfig(projectPath, editor, userChoices);

    spinner.stop();

    console.log(`  🧰 Setting up ${editorName} configuration`);
    console.log(
      "    → Added .vscode/extensions.json with recommended extensions"
    );

    if (typescript) {
      console.log("    → Suggested TypeScript and React extensions");
    }

    if (styling === "tailwind") {
      console.log("    → Configured settings.json with Tailwind IntelliSense");
    } else if (styling === "styled-components") {
      console.log("    → Suggested styled-components syntax highlighting");
    }

    console.log("    → Added debugging configuration for React");
    console.log();

    try {
      await execa(command, args);
      return true;
    } catch (err) {
      warning(
        `Couldn't open ${editorName}. It might not be installed or not in PATH.`
      );
      warning(
        `To open your project in ${editor}, run: ${command} ${projectPath}`
      );
      return false;
    }
  } catch (err) {
    spinner.fail(`Failed to open project in ${editorName}`);
    return false;
  }
}

function createEditorConfig(projectPath, editor, userChoices) {
  if (editor !== "vscode" && editor !== "cursor") return;

  const { typescript, styling, framework } = userChoices || {};

  // create .vscode directory (works for both VS Code and Cursor)
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

  // styling extensions
  if (styling === "tailwind") {
    extensions.recommendations.push("bradlc.vscode-tailwindcss");
  } else if (styling === "styled-components") {
    extensions.recommendations.push(
      "styled-components.vscode-styled-components"
    );
  }

  if (framework === "vite") {
    extensions.recommendations.push("antfu.vite");
  } else if (framework === "nextjs") {
    extensions.recommendations.push("mskelton.next-js-snippets");
  }

  fs.writeJsonSync(path.join(vscodeDir, "extensions.json"), extensions, {
    spaces: 2,
  });

  // settings.json with minimal editor settings
  const settings = {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
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

  fs.writeJsonSync(path.join(vscodeDir, "settings.json"), settings, {
    spaces: 2,
  });

  // create launch.json for debugging
  const launchPort =
    framework === "nextjs"
      ? 3000
      : framework === "parcel"
      ? 1234
      : framework === "rsbuild"
      ? 8080
      : 5173; // default for Vite

  const launch = {
    version: "0.2.0",
    configurations: [
      {
        type: "chrome",
        request: "launch",
        name: "Launch Chrome against localhost",
        url: `http://localhost:${launchPort}`,
        webRoot: "${workspaceFolder}",
      },
    ],
  };

  fs.writeJsonSync(path.join(vscodeDir, "launch.json"), launch, { spaces: 2 });
}
