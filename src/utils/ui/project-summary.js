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
    chalk.bgGreen(`[✓] Project Successfully Created!`),
    `   ${chalk.cyan("Name:")} ${chalk.bold(projectName)}`,
    `   ${chalk.cyan("Location:")} ${projectPath}`,
    `   ${chalk.cyan("Tech Stack:")} ${techStack.join(", ")}`,
    `   ${chalk.cyan("Package Manager:")} ${userChoices.packageManager}`,
    `   ${chalk.cyan("Dev Server:")} ${chalk.underline(`http://localhost:${frameworkInfo.port}`)}`,
  ].join("\n");

  // STEP 2: next steps with commands
  const commandLines = [];

  commandLines.push(`   ${chalk.bold("1.")} Navigate to project folder`);
  commandLines.push(`      ${chalk.cyan(`cd ${projectName}`)}`);
  commandLines.push("");

  let cmdIndex = 2;

  commandLines.push(
    `   ${chalk.bold(`${cmdIndex}.`)} Development server starting automatically`,
  );
  commandLines.push(
    `      ${chalk.gray(
      `→ Opening your default browser to http://localhost:${frameworkInfo.port}`,
    )}`,
  );
  commandLines.push("");
  cmdIndex++;

  if (commandExamples.dev) {
    commandLines.push(`   ${chalk.bold(`${cmdIndex}.`)} Manual server control`);
    commandLines.push(
      `      ${chalk.cyan(`${commandExamples.dev.command}`)} ${chalk.gray(
        `→ Restart development server if needed`,
      )}`,
    );
    commandLines.push("");
    cmdIndex++;
  }

  if (commandExamples.build) {
    commandLines.push(`   ${chalk.bold(`${cmdIndex}.`)} Build for production`);
    commandLines.push(
      `      ${chalk.cyan(`${commandExamples.build.command}`)} ${chalk.gray(
        `→ ${commandExamples.build.description}`,
      )}`,
    );
    cmdIndex++;
  }

  const nextStepsSection = [
    "",
    chalk.bgMagenta(`[i] Next Steps:`),
    ...commandLines,
  ].join("\n");

  // STEP 3: tech-specific tips
  // (Quick Tips removed)

  // STEP 4: documentation links
  const docsSection = [
    "",
    chalk.bgBlue(`[i] Documentation:`),
    `   • ${userChoices.framework}: ${chalk.underline(frameworkInfo.docs)}`,
    `   • ${userChoices.styling}: ${chalk.underline(stylingInfo.docs)}`,
    ...(userChoices.framework !== "nextjs" &&
    userChoices.routing &&
    userChoices.routing !== "none"
      ? [
          `   • ${userChoices.routing}: ${chalk.underline(
            getRoutingInfo(userChoices.routing).docs,
          )}`,
        ]
      : []),
    ...(userChoices.typescript
      ? [`   • TypeScript: ${chalk.underline(languageInfo.docs)}`]
      : []),
    ...(userChoices.stateManagement === "redux"
      ? [`   • Redux Toolkit: ${chalk.underline(getReduxInfo().docs)}`]
      : []),
    ...(userChoices.stateManagement === "zustand"
      ? [`   • Zustand: ${chalk.underline(getZustandInfo().docs)}`]
      : []),
  ].join("\n");

  return [successHeader, nextStepsSection, docsSection]
    .filter((section) => section)
    .join("\n");
}
