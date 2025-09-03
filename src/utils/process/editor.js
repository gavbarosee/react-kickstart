import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";
import path from "path";

import { createErrorHandler, ERROR_TYPES } from "../../errors/index.js";
import { UI_UTILS, CORE_UTILS } from "../index.js";

export async function openEditor(projectPath, editor = "vscode", userChoices) {
  const errorHandler = createErrorHandler();
  const { framework, typescript, styling } = userChoices || {};

  errorHandler.setContext({
    projectPath,
    editor,
    framework,
  });

  const spinner = ora({
    text: `Preparing to open project in your editor...`,
    color: "magenta",
    spinner: "simpleDotsScrolling",
  }).start();

  return errorHandler.withErrorHandling(
    async () => {
      const resolveEditorCommand = (ed) => {
        if (ed === "vscode") return process.platform === "win32" ? "code.cmd" : "code";
        if (ed === "cursor")
          return process.platform === "win32" ? "cursor.cmd" : "cursor";
        return null;
      };

      const isEditorAvailable = async (ed) => {
        const cmd = resolveEditorCommand(ed);
        if (!cmd) return false;
        try {
          await execa(cmd, ["--version"], { stdio: "ignore" });
          return true;
        } catch {
          return false;
        }
      };

      const humanName = (ed) =>
        ed === "vscode" ? "VS Code" : ed === "cursor" ? "Cursor" : "editor";

      const isExplicitChoice = editor === "vscode" || editor === "cursor";

      const preferredOrder = isExplicitChoice ? [editor] : ["cursor", "vscode"]; // prefer Cursor when auto/unspecified

      let selectedEditor = null;
      for (const candidate of preferredOrder) {
        if (await isEditorAvailable(candidate)) {
          selectedEditor = candidate;
          break;
        }
      }

      if (!selectedEditor) {
        if (isExplicitChoice) {
          spinner.fail(`${humanName(editor)} CLI not found in PATH.`);
          UI_UTILS.warning(
            `Install ${humanName(editor)} CLI and ensure it's in your PATH.`,
          );
        } else {
          spinner.fail("No supported editor found in PATH (Cursor or VS Code).");
          UI_UTILS.warning(
            "Install Cursor (`cursor`) or VS Code (`code`) CLI and ensure it's in your PATH.",
          );
        }
        return false;
      }

      // Create editor configuration compatible with both VS Code and Cursor
      createEditorConfig(projectPath, selectedEditor, userChoices);

      spinner.stop();

      const tried = new Set();
      let command = resolveEditorCommand(selectedEditor);
      let args = [projectPath];

      const tryOpen = async (ed) => {
        const cmd = resolveEditorCommand(ed);
        tried.add(ed);
        try {
          await execa(cmd, args);
          return { success: true };
        } catch (err) {
          return { success: false, error: err };
        }
      };

      const firstAttempt = await tryOpen(selectedEditor);
      if (firstAttempt.success) return true;

      // Fallback to the other editor only when auto-selected (not an explicit choice)
      if (preferredOrder.length > 1) {
        const fallback = ["cursor", "vscode"].find((ed) => !tried.has(ed));
        if (fallback && (await isEditorAvailable(fallback))) {
          UI_UTILS.warning(
            `Couldn't open ${humanName(
              selectedEditor,
            )}. Falling back to ${humanName(fallback)}...`,
          );
          const secondAttempt = await tryOpen(fallback);
          if (secondAttempt.success) return true;
        }
      }

      UI_UTILS.warning(
        `Couldn't open ${humanName(
          selectedEditor,
        )}. It might not be installed or not in PATH.`,
      );
      UI_UTILS.warning(
        `To open your project manually, run: ${resolveEditorCommand(
          "cursor",
        )} ${projectPath} or ${resolveEditorCommand("vscode")} ${projectPath}`,
      );
      return false;
    },
    {
      type: ERROR_TYPES.PROCESS,
      onError: (error) => {
        spinner.fail("Failed to open project in your editor");
        return false; // Continue without opening editor
      },
    },
  );
}

function createEditorConfig(projectPath, editor, userChoices) {
  if (editor !== "vscode" && editor !== "cursor") return;

  const { typescript, styling, framework } = userChoices || {};

  // create .vscode directory (works for both VS Code and Cursor)
  const vscodeDir = CORE_UTILS.createProjectDirectory(projectPath, ".vscode");

  // extensions.json with recommended extensions
  const extensions = {
    recommendations: ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"],
  };

  // ts extensions
  if (typescript) {
    extensions.recommendations.push("ms-typescript.typescript-language-features");
  }

  // styling extensions
  if (styling === "tailwind") {
    extensions.recommendations.push("bradlc.vscode-tailwindcss");
  } else if (styling === "styled-components") {
    extensions.recommendations.push("styled-components.vscode-styled-components");
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
  const launchPort = framework === "nextjs" ? 3000 : 5173; // default for Vite

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
