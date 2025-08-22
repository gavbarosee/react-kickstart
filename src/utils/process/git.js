import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { UI_UTILS } from "../index.js";
import { createErrorHandler, ERROR_TYPES } from "../../errors/index.js";

export async function initGit(projectPath, userChoices) {
  const errorHandler = createErrorHandler();
  const { framework, typescript, linting, styling } = userChoices || {};

  errorHandler.setContext({
    projectPath,
    framework,
    operation: "git_init",
  });

  const spinner = ora({
    text: "Initializing git repository...",
    color: "blue",
    spinner: "dots",
  }).start();

  return errorHandler.withErrorHandling(
    async () => {
      // Check if git is available
      try {
        await execa("git", ["--version"]);
      } catch (err) {
        spinner.warn("Git is not installed. Skipping git initialization.");
        return false;
      }

      await execa("git", ["init"], { cwd: projectPath });

      // framework-specific gitignore patterns
      const frameworkIgnores = {
        vite: ["# Vite build output", "/dist/", "*.local", ""],
        nextjs: [
          "# Next.js build output",
          "/.next/",
          "/out/",
          "next-env.d.ts",
          "",
        ],
      };

      const gitignoreContent = `# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

${frameworkIgnores[framework]?.join("\n") || "# build output\n/dist/\n"}

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/launch.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;

      fs.writeFileSync(
        path.join(projectPath, ".gitignore"),
        gitignoreContent.trim()
      );

      spinner.stop();

      console.log("  🔄 Initializing Git repository");
      console.log("    → Created .gitignore with framework-specific patterns");

      if (frameworkIgnores[framework]) {
        const frameworkName =
          {
            vite: "Vite",
            nextjs: "Next.js",
          }[framework] || framework;

        console.log(
          `    → Added ${frameworkName}-specific build artifacts to .gitignore`
        );
      }

      console.log(
        "    → Added node_modules/ and environment files to .gitignore"
      );
      console.log();

      return true;
    },
    {
      type: ERROR_TYPES.PROCESS,
      onError: (error) => {
        spinner.fail("Failed to initialize git repository");
        return false; // Continue without git
      },
    }
  );
}
