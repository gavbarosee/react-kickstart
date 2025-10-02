import chalk from "chalk";

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

  const successHeader = [
    "",
    `${chalk.hex("#34d399")("✓")} ${chalk.hex("#f1f5f9")("Project Created")}`,
    `   ${chalk.hex("#64748b")("Name:")} ${chalk.hex("#e2e8f0")(projectName)}`,
    `   ${chalk.hex("#64748b")("Location:")} ${chalk.hex("#64748b")(projectPath)}`,
    `   ${chalk.hex("#64748b")("Stack:")} ${chalk.hex("#e2e8f0")(techStack.map((t) => t.toLowerCase()).join(" • "))}`,
    `   ${chalk.hex("#64748b")("Dev Server:")} ${chalk.hex("#22d3ee").underline(`http://localhost:${frameworkInfo.port}`)}`,
    "",
    chalk.hex("#475569")("─".repeat(process.stdout.columns || 80)),
  ].join("\n");

  // STEP 2: next steps with commands
  const commandLines = [];

  commandLines.push(`   ${chalk.hex("#cbd5e1")("1.")} Open in browser`);
  commandLines.push(
    `      ${chalk.hex("#22d3ee").underline(`http://localhost:${frameworkInfo.port}`)} ${chalk.hex("#64748b")("→ Server is running")}`,
  );
  commandLines.push("");

  commandLines.push(`   ${chalk.hex("#cbd5e1")("2.")} Navigate to project folder`);
  commandLines.push(`      ${chalk.hex("#e2e8f0")(`cd ${projectName}`)}`);
  commandLines.push("");

  let cmdIndex = 3;

  if (commandExamples.dev) {
    commandLines.push(
      `   ${chalk.hex("#cbd5e1")(`${cmdIndex}.`)} Restart server if needed`,
    );
    commandLines.push(
      `      ${chalk.hex("#e2e8f0")(`${commandExamples.dev.command}`)}`,
    );
    commandLines.push("");
    cmdIndex++;
  }

  if (commandExamples.build) {
    commandLines.push(`   ${chalk.hex("#cbd5e1")(`${cmdIndex}.`)} Production build`);
    commandLines.push(
      `      ${chalk.hex("#e2e8f0")(`${commandExamples.build.command}`)} ${chalk.hex(
        "#64748b",
      )(`→ ${commandExamples.build.description}`)}`,
    );
    cmdIndex++;
  }

  const nextStepsSection = [
    "",
    chalk.hex("#94a3b8")("Next Steps"),
    ...commandLines,
  ].join("\n");

  // STEP 3: tech-specific tips
  // (Quick Tips removed)

  // STEP 4: documentation links
  const docsSection = [
    "",
    chalk.hex("#94a3b8")("Documentation"),
    `   • ${chalk.hex("#94a3b8")(userChoices.framework.toLowerCase())}: ${chalk.hex("#22d3ee").underline(frameworkInfo.docs)}`,
    `   • ${chalk.hex("#94a3b8")(userChoices.styling)}: ${chalk.hex("#22d3ee").underline(stylingInfo.docs)}`,
    ...(userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? [
          `   • ${chalk.hex("#94a3b8")(userChoices.routing)}: ${chalk
            .hex("#22d3ee")
            .underline(getRoutingInfo(userChoices.routing).docs)}`,
        ]
      : []),
    ...(userChoices.typescript
      ? [
          `   • ${chalk.hex("#94a3b8")("typescript")}: ${chalk.hex("#22d3ee").underline(languageInfo.docs)}`,
        ]
      : []),
    ...(userChoices.stateManagement === "redux"
      ? [
          `   • ${chalk.hex("#94a3b8")("redux")}: ${chalk.hex("#22d3ee").underline(getReduxInfo().docs)}`,
        ]
      : []),
    ...(userChoices.stateManagement === "zustand"
      ? [
          `   • ${chalk.hex("#94a3b8")("zustand")}: ${chalk.hex("#22d3ee").underline(getZustandInfo().docs)}`,
        ]
      : []),
  ].join("\n");

  return [successHeader, nextStepsSection, docsSection]
    .filter((section) => section)
    .join("\n");
}
