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
    `${chalk.green("✓")} ${chalk.white("Project Created")}`,
    `   ${chalk.dim("Name:")} ${chalk.white(projectName)}`,
    `   ${chalk.dim("Location:")} ${chalk.dim(projectPath)}`,
    `   ${chalk.dim("Stack:")} ${chalk.white(techStack.map((t) => t.toLowerCase()).join(" • "))}`,
    `   ${chalk.dim("Dev Server:")} ${chalk.white.underline(`http://localhost:${frameworkInfo.port}`)}`,
    "",
    chalk.dim("─".repeat(process.stdout.columns || 80)),
  ].join("\n");

  // STEP 2: next steps with commands
  const commandLines = [];

  commandLines.push(`   ${chalk.white("1.")} Open in browser`);
  commandLines.push(
    `      ${chalk.white.underline(`http://localhost:${frameworkInfo.port}`)} ${chalk.dim("→ Server is running")}`,
  );
  commandLines.push("");

  commandLines.push(`   ${chalk.white("2.")} Navigate to project folder`);
  commandLines.push(`      ${chalk.white(`cd ${projectName}`)}`);
  commandLines.push("");

  let cmdIndex = 3;

  if (commandExamples.dev) {
    commandLines.push(`   ${chalk.white(`${cmdIndex}.`)} Restart server if needed`);
    commandLines.push(`      ${chalk.white(`${commandExamples.dev.command}`)}`);
    commandLines.push("");
    cmdIndex++;
  }

  if (commandExamples.build) {
    commandLines.push(`   ${chalk.white(`${cmdIndex}.`)} Production build`);
    commandLines.push(
      `      ${chalk.white(`${commandExamples.build.command}`)} ${chalk.dim(
        `→ ${commandExamples.build.description}`,
      )}`,
    );
    cmdIndex++;
  }

  const nextStepsSection = ["", chalk.dim("Next Steps"), ...commandLines].join("\n");

  // STEP 3: tech-specific tips
  // (Quick Tips removed)

  // STEP 4: documentation links
  const docsSection = [
    "",
    chalk.dim("Documentation"),
    `   • ${chalk.white(userChoices.framework.toLowerCase())}: ${chalk.white.underline(frameworkInfo.docs)}`,
    `   • ${chalk.white(userChoices.styling)}: ${chalk.white.underline(stylingInfo.docs)}`,
    ...(userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? [
          `   • ${chalk.white(userChoices.routing)}: ${chalk.white.underline(
            getRoutingInfo(userChoices.routing).docs,
          )}`,
        ]
      : []),
    ...(userChoices.typescript
      ? [
          `   • ${chalk.white("typescript")}: ${chalk.white.underline(languageInfo.docs)}`,
        ]
      : []),
    ...(userChoices.stateManagement === "redux"
      ? [`   • ${chalk.white("redux")}: ${chalk.white.underline(getReduxInfo().docs)}`]
      : []),
    ...(userChoices.stateManagement === "zustand"
      ? [
          `   • ${chalk.white("zustand")}: ${chalk.white.underline(getZustandInfo().docs)}`,
        ]
      : []),
  ].join("\n");

  return [successHeader, nextStepsSection, docsSection]
    .filter((section) => section)
    .join("\n");
}
