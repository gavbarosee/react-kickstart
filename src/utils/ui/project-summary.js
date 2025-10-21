import chalk from "chalk";

import { COLORS } from "./colors.js";

function getReduxInfo() {
  return {
    docs: "https://redux-toolkit.js.org/introduction/getting-started",
  };
}

function getZustandInfo() {
  return {
    docs: "https://zustand-demo.pmnd.rs/",
  };
}

export function getFrameworkDocumentation(framework) {
  const info = {
    vite: {
      docs: "https://vitejs.dev/guide/",
      port: 5173,
      buildDir: "dist",
    },
    nextjs: {
      docs: "https://nextjs.org/docs",
      port: 3000,
      buildDir: ".next",
    },
  };

  return (
    info[framework] || {
      docs: "",
      port: 3000,
      buildDir: "dist",
    }
  );
}

function getRoutingInfo(routing) {
  const info = {
    "react-router": {
      docs: "https://reactrouter.com/en/main",
    },
  };
  return info[routing] || { docs: "" };
}

function getStylingInfo(styling) {
  const info = {
    tailwind: {
      docs: "https://tailwindcss.com/docs",
    },
    "styled-components": {
      docs: "https://styled-components.com/docs",
    },
    css: {
      docs: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    },
  };

  return (
    info[styling] || {
      docs: "",
    }
  );
}

function getLanguageInfo(typescript) {
  if (typescript) {
    return {
      docs: "https://www.typescriptlang.org/docs/",
    };
  }

  return {
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  };
}

function getCommandExamples(packageManager, framework) {
  const pmRun = packageManager === "yarn" ? "yarn" : "npm run";
  const devCommand = `${pmRun} dev`;

  const frameworkInfo = getFrameworkDocumentation(framework);

  return {
    dev: {
      command: devCommand,
      description: `Starts development server (http://localhost:${frameworkInfo.port})`,
    },
    build: {
      command: `${pmRun} build`,
      description: `Creates production build in ${frameworkInfo.buildDir}/`,
    },
    preview:
      framework !== "nextjs"
        ? {
            command: `${pmRun} preview`,
            description: "Preview production build locally",
          }
        : null,
    start:
      framework === "nextjs"
        ? {
            command: `${pmRun} start`,
            description: "Start production server",
          }
        : null,
  };
}

export function generateCompletionSummary(
  projectPath,
  projectName,
  userChoices,
  vulnerabilities,
  packageCount = null,
) {
  const frameworkInfo = getFrameworkDocumentation(userChoices.framework);
  const stylingInfo = getStylingInfo(userChoices.styling);
  const languageInfo = getLanguageInfo(userChoices.typescript);
  const commandExamples = getCommandExamples(
    userChoices.packageManager,
    userChoices.framework,
  );

  // STEP 1: project success header
  const techStack = [];
  techStack.push(userChoices.framework);
  if (userChoices.typescript) techStack.push("TypeScript");
  if (userChoices.styling && userChoices.styling !== "css")
    techStack.push(userChoices.styling);
  if (userChoices.stateManagement && userChoices.stateManagement !== "none")
    techStack.push(userChoices.stateManagement);
  if (userChoices.routing && userChoices.routing !== "none")
    techStack.push(userChoices.routing);
  if (userChoices.api && userChoices.api !== "none") techStack.push(userChoices.api);
  if (userChoices.testing && userChoices.testing !== "none")
    techStack.push(userChoices.testing);

  // Helper to format header lines with consistent padding
  const formatHeaderLine = (label, value) => {
    const paddedLabel = `   ${label}`.padEnd(15); // 3 spaces + 12 chars = 15
    return `${chalk.hex(COLORS.text.dim)(paddedLabel)} ${value}`;
  };

  const successHeader = [
    "",
    `${chalk.hex(COLORS.status.success)("✓")} ${chalk.hex(COLORS.text.primary)("Project Created")}`,
    formatHeaderLine("Name", chalk.hex(COLORS.text.tertiary)(projectName)),
    formatHeaderLine("Location", chalk.hex(COLORS.text.dim)(projectPath)),
    formatHeaderLine(
      "Stack",
      chalk.hex(COLORS.text.tertiary)(
        techStack.map((t) => t.toLowerCase()).join(" • "),
      ),
    ),
    formatHeaderLine(
      "Dev Server",
      chalk.hex(COLORS.accent.cyan).underline(`http://localhost:${frameworkInfo.port}`),
    ),
    "",
    chalk.hex(COLORS.ui.separator)("─".repeat(process.stdout.columns || 80)),
  ].join("\n");

  // STEP 2: next steps with commands
  const commandLines = [];

  commandLines.push(`   ${chalk.hex(COLORS.text.tertiary)("1.")} Open in browser`);
  commandLines.push(
    `      ${chalk.hex(COLORS.accent.cyan).underline(`http://localhost:${frameworkInfo.port}`)} ${chalk.hex(COLORS.text.dim)(" → Server is running")}`,
  );
  commandLines.push("");

  commandLines.push(
    `   ${chalk.hex(COLORS.text.tertiary)("2.")} Navigate to project folder`,
  );
  commandLines.push(`      ${chalk.hex(COLORS.text.tertiary)(`cd ${projectName}`)}`);
  commandLines.push("");

  let cmdIndex = 3;

  if (commandExamples.dev) {
    commandLines.push(
      `   ${chalk.hex(COLORS.text.tertiary)(`${cmdIndex}.`)} Restart server if needed`,
    );
    commandLines.push(
      `      ${chalk.hex(COLORS.text.tertiary)(`${commandExamples.dev.command}`)}`,
    );
    commandLines.push("");
    cmdIndex++;
  }

  if (commandExamples.build) {
    commandLines.push(
      `   ${chalk.hex(COLORS.text.tertiary)(`${cmdIndex}.`)} Production build`,
    );
    commandLines.push(
      `      ${chalk.hex(COLORS.text.tertiary)(`${commandExamples.build.command}`)} ${chalk.hex(COLORS.text.dim)(` → ${commandExamples.build.description}`)}`,
    );
    cmdIndex++;
  }

  const nextStepsSection = [
    "",
    chalk.hex(COLORS.text.muted)("Next Steps"),
    "",
    ...commandLines,
  ].join("\n");

  // STEP 3: tech-specific tips
  // (Quick Tips removed)

  // STEP 4: documentation links
  const docsSection = [
    "",
    chalk.hex(COLORS.text.muted)("Documentation"),
    "",
    `   • ${chalk.hex(COLORS.text.muted)(userChoices.framework.toLowerCase())}: ${chalk.hex(COLORS.text.dim)(frameworkInfo.docs)}`,
    `   • ${chalk.hex(COLORS.text.muted)(userChoices.styling)}: ${chalk.hex(COLORS.text.dim)(stylingInfo.docs)}`,
    ...(userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? [
          `   • ${chalk.hex(COLORS.text.muted)(userChoices.routing)}: ${chalk.hex(
            COLORS.text.dim,
          )(getRoutingInfo(userChoices.routing).docs)}`,
        ]
      : []),
    ...(userChoices.typescript
      ? [
          `   • ${chalk.hex(COLORS.text.muted)("typescript")}: ${chalk.hex(COLORS.text.dim)(languageInfo.docs)}`,
        ]
      : []),
    ...(userChoices.stateManagement === "redux"
      ? [
          `   • ${chalk.hex(COLORS.text.muted)("redux")}: ${chalk.hex(COLORS.text.dim)(getReduxInfo().docs)}`,
        ]
      : []),
    ...(userChoices.stateManagement === "zustand"
      ? [
          `   • ${chalk.hex(COLORS.text.muted)("zustand")}: ${chalk.hex(COLORS.text.dim)(getZustandInfo().docs)}`,
        ]
      : []),
  ].join("\n");

  return [successHeader, nextStepsSection, docsSection]
    .filter((section) => section)
    .join("\n");
}
