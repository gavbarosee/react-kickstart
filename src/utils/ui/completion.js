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

  // get project size in MB (approximate)
  let projectSizeText = "N/A";
  if (packageCount) {
    // very rough estimate: each package ~200KB on average
    const approximateSizeMB = Math.round(packageCount * 0.2);
    projectSizeText = `~${packageCount} packages (${approximateSizeMB}MB)`;
  }

  // STEP 1: project success header with updated size info
  const successHeader = [
    "",
    chalk.bgGreen(`[✓] Project Successfully Created!`),
    `   ${chalk.cyan("Name:")} ${chalk.bold(projectName)}`,
    `   ${chalk.cyan("Location:")} ${projectPath}`,
    `   ${chalk.cyan("Size:")} ${projectSizeText}`,
    `   ${chalk.cyan("Auto-Start:")} ${chalk.green("Yes (in default browser)")}`,
  ].join("\n");

  // STEP 2: next steps with commands
  const commandLines = [];

  commandLines.push(`   ${chalk.bold("1️⃣ ")} Navigate to project folder`);
  commandLines.push(`      ${chalk.cyan(`$ cd ${projectName}`)}`);
  commandLines.push("");

  let cmdIndex = 2;

  commandLines.push(
    `   ${chalk.bold(`${cmdIndex}️⃣ `)} Development server starting automatically`,
  );
  commandLines.push(
    `      ${chalk.gray(
      `→ Opening your default browser to http://localhost:${frameworkInfo.port}`,
    )}`,
  );
  commandLines.push("");
  cmdIndex++;

  if (commandExamples.dev) {
    commandLines.push(`   ${chalk.bold(`${cmdIndex}️⃣ `)} Manual server control`);
    commandLines.push(
      `      ${chalk.cyan(`$ ${commandExamples.dev.command}`)} ${chalk.gray(
        `→ Restart development server if needed`,
      )}`,
    );
    commandLines.push("");
    cmdIndex++;
  }

  if (commandExamples.build) {
    commandLines.push(`   ${chalk.bold(`${cmdIndex}️⃣ `)} Build for production`);
    commandLines.push(
      `      ${chalk.cyan(`$ ${commandExamples.build.command}`)} ${chalk.gray(
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

  // STEP 5: security notice (if any)
  const auditFixCommand =
    userChoices.packageManager === "yarn" ? "yarn audit fix" : "npm audit fix";
  const auditCommand =
    userChoices.packageManager === "yarn" ? "yarn audit" : "npm audit";

  const securitySection =
    vulnerabilities && vulnerabilities.length > 0
      ? [
          "",
          chalk.bgYellow(
            `[!] Security Notice: ${vulnerabilities.reduce(
              (sum, v) => sum + v.count,
              0,
            )} vulnerabilities found`,
          ),
          ...vulnerabilities.map((vuln) => {
            const severityColor =
              {
                critical: chalk.red.bold,
                high: chalk.red,
                moderate: chalk.yellow,
                low: chalk.blue,
              }[vuln.severity] || chalk.gray;

            return `   • ${severityColor(vuln.count)} ${severityColor(
              vuln.severity,
            )} severity ${vuln.count === 1 ? "vulnerability" : "vulnerabilities"}`;
          }),
          "",
          `   ${chalk.cyan(
            "Fix now (potential breaking changes):",
          )} ${chalk.cyan(`$ cd ${projectName} && ${auditFixCommand}`)}`,
          `   ${chalk.cyan("Learn more:")} ${chalk.cyan(
            `$ cd ${projectName} && ${auditCommand}`,
          )}`,
        ].join("\n")
      : "";

  return [securitySection, successHeader, nextStepsSection, docsSection]
    .filter((section) => section)
    .join("\n");
}
