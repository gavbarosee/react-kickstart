import chalk from "chalk";
import figures from "figures";
import path from "path";
import fs from "fs-extra";

function estimatePackageSize(projectPath) {
  try {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const dependencies = Object.keys(packageData.dependencies || {}).length;
    const devDependencies = Object.keys(
      packageData.devDependencies || {}
    ).length;
    const totalPackages = dependencies + devDependencies;

    // estimate size (very rough approximation)
    return totalPackages * 4; // ~4MB per package on average
  } catch (error) {
    console.error("Error reading package.json:", error.message);
    return null;
  }
}

function getProjectMetrics(projectPath) {
  try {
    const estimatedSize = estimatePackageSize(projectPath);

    return {
      totalPackages,
      dependencies,
      devDependencies,
      estimatedSize: `~${estimatedSize}MB`,
    };
  } catch (err) {
    return {
      totalPackages: "N/A",
      dependencies: "N/A",
      devDependencies: "N/A",
      estimatedSize: "N/A",
    };
  }
}

// get framework-specific information
export function getFrameworkInfo(framework) {
  const info = {
    vite: {
      docs: "https://vitejs.dev/guide/",
      port: 5173,
      buildDir: "dist",
      tips: [
        "Enable Vite-specific features with plugins in vite.config.js",
        "Fast HMR makes development highly responsive",
      ],
    },
    nextjs: {
      docs: "https://nextjs.org/docs",
      port: 3000,
      buildDir: ".next",
      tips: [
        "Create API routes in the 'api' directory",
        "Use next/image for optimized image loading",
      ],
    },
    parcel: {
      docs: "https://parceljs.org/docs/",
      port: 1234,
      buildDir: "dist",
      tips: [
        "Zero-configuration by default",
        "Add transformations via package.json if needed",
      ],
    },
    rsbuild: {
      docs: "https://rsbuild.dev/",
      port: 8080,
      buildDir: "dist",
      tips: [
        "Performance-focused building with extensive optimizations",
        "Configure in rsbuild.config.js",
      ],
    },
  };

  return (
    info[framework] || {
      docs: "",
      port: 3000,
      buildDir: "dist",
      tips: [],
    }
  );
}

// styling-specific information
function getStylingInfo(styling) {
  const info = {
    tailwind: {
      docs: "https://tailwindcss.com/docs",
      tips: [
        "Install Tailwind CSS IntelliSense extension for your editor",
        "Configure custom themes in tailwind.config.js",
      ],
    },
    "styled-components": {
      docs: "https://styled-components.com/docs",
      tips: [
        "Use ThemeProvider for consistent styling across components",
        "Consider the Babel plugin for better debugging",
      ],
    },
    css: {
      docs: "https://developer.mozilla.org/en-US/docs/Web/CSS",
      tips: [
        "CSS files are automatically processed by your bundler",
        "Consider adding a CSS methodology like BEM",
      ],
    },
  };

  return (
    info[styling] || {
      docs: "",
      tips: [],
    }
  );
}

// js or ts specific information
function getLanguageInfo(typescript) {
  if (typescript) {
    return {
      docs: "https://www.typescriptlang.org/docs/",
      tips: [
        "Configure strictness levels in tsconfig.json",
        "Use type assertion only when necessary",
      ],
    };
  }

  return {
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    tips: [
      "Consider adding JSDoc comments for better code understanding",
      "Use modern JavaScript features for cleaner code",
    ],
  };
}

// generate command examples based on package manager and framework
function getCommandExamples(packageManager, framework) {
  const pmRun = packageManager === "yarn" ? "yarn" : "npm run";
  const devCommand =
    framework === "parcel" && packageManager === "npm"
      ? "npm start"
      : `${pmRun} dev`;

  const frameworkInfo = getFrameworkInfo(framework);

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

// generate the complete post-creation summary
export function generateCompletionSummary(
  projectPath,
  projectName,
  userChoices,
  vulnerabilities
) {
  const metrics = getProjectMetrics(projectPath);
  const frameworkInfo = getFrameworkInfo(userChoices.framework);
  const stylingInfo = getStylingInfo(userChoices.styling);
  const languageInfo = getLanguageInfo(userChoices.typescript);
  const commandExamples = getCommandExamples(
    userChoices.packageManager,
    userChoices.framework
  );
  const auditFixCommand =
    userChoices.packageManager === "yarn" ? "yarn audit fix" : "npm audit fix";
  const auditCommand =
    userChoices.packageManager === "yarn" ? "yarn audit" : "npm audit";

  // STEP 1: project success header
  const successHeader = [
    "",
    chalk.green(`${figures.tick} Project Successfully Created!`),
    `   ${chalk.cyan("Name:")} ${chalk.bold(projectName)}`,
    `   ${chalk.cyan("Location:")} ${projectPath}`,
    `   ${chalk.cyan("Size:")} ${metrics.estimatedSize} (${
      metrics.totalPackages
    } packages)`,
    `   ${chalk.cyan("Auto-Start:")} ${
      userChoices.autoStart ? chalk.green("Yes") : chalk.red("No")
    }`,
    ...(userChoices.autoStart
      ? [
          `   ${chalk.cyan("Browser:")} ${chalk.blue(
            userChoices.browser === "default"
              ? "System Default"
              : userChoices.browser
          )}`,
        ]
      : []),
  ].join("\n");

  // STEP 2: next steps with commands
  const commandLines = [];

  commandLines.push(`   ${chalk.bold("1️⃣ ")} Navigate to project folder`);
  commandLines.push(`      ${chalk.cyan(`$ cd ${projectName}`)}`);
  commandLines.push("");

  let cmdIndex = 2;

  if (userChoices.autoStart) {
    const browserName =
      userChoices.browser === "default"
        ? "your default browser"
        : userChoices.browser;

    commandLines.push(
      `   ${chalk.bold(
        `${cmdIndex}️⃣ `
      )} Development server will start automatically`
    );
    commandLines.push(
      `      ${chalk.gray(
        `→ Opening ${browserName} to http://localhost:${frameworkInfo.port}`
      )}`
    );
    commandLines.push("");
    cmdIndex++;
  }

  if (commandExamples.dev) {
    commandLines.push(
      `   ${chalk.bold(`${cmdIndex}️⃣ `)} Start development server`
    );
    commandLines.push(
      `      ${chalk.cyan(`$ ${commandExamples.dev.command}`)} ${chalk.gray(
        `→ ${commandExamples.dev.description}`
      )}`
    );
    commandLines.push("");
    cmdIndex++;
  }

  if (commandExamples.build) {
    commandLines.push(
      `   ${chalk.bold(`${cmdIndex}️⃣ `)} Build for production`
    );
    commandLines.push(
      `      ${chalk.cyan(`$ ${commandExamples.build.command}`)} ${chalk.gray(
        `→ ${commandExamples.build.description}`
      )}`
    );
    cmdIndex++;
  }

  const nextStepsSection = [
    "",
    chalk.cyan(`${figures.pointer} Next Steps:`),
    ...commandLines,
  ].join("\n");

  // STEP 3: tech-specific tips
  const tipsList = [
    ...frameworkInfo.tips.map((tip) => `   • ${userChoices.framework}: ${tip}`),
    ...stylingInfo.tips.map((tip) => `   • ${userChoices.styling}: ${tip}`),
    ...(userChoices.typescript
      ? languageInfo.tips.map((tip) => `   • TypeScript: ${tip}`)
      : []),
  ];

  const tipsSection =
    tipsList.length > 0
      ? [
          "",
          chalk.cyan(`${figures.pointer} Quick Tips for Your Stack:`),
          ...tipsList,
        ].join("\n")
      : "";

  // STEP 4: documentation links
  const docsSection = [
    "",
    chalk.cyan(`${figures.pointer} Documentation:`),
    `   • ${userChoices.framework}: ${chalk.underline(frameworkInfo.docs)}`,
    `   • ${userChoices.styling}: ${chalk.underline(stylingInfo.docs)}`,
    ...(userChoices.typescript
      ? [`   • TypeScript: ${chalk.underline(languageInfo.docs)}`]
      : []),
  ].join("\n");

  // STEP 5: security notice (if any)
  const securitySection =
    vulnerabilities && vulnerabilities.length > 0
      ? [
          chalk.yellow(
            `${figures.pointer} Security Notice: ${vulnerabilities.reduce(
              (sum, v) => sum + v.count,
              0
            )} vulnerabilities found`
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
              vuln.severity
            )} severity ${
              vuln.count === 1 ? "vulnerability" : "vulnerabilities"
            }`;
          }),
          "",
          `   ${chalk.cyan(
            "Fix now (potential breaking changes):"
          )} ${chalk.cyan(`$ cd ${projectName} && ${auditFixCommand}`)}`,
          `   ${chalk.cyan("Learn more:")} ${chalk.cyan(
            `$ cd ${projectName} && ${auditCommand}`
          )}`,
        ].join("\n")
      : "";
  // STEP 6: ready to go
  const readyToGoSection = [
    "",
    chalk.green(`Ready to go! Run:`),
    "",
    `   ${chalk.cyan(`$ cd ${projectName} && ${commandExamples.dev.command}`)}`,
    "",
    chalk.green(`Happy hacking! 🚀`),
    "",
  ].join("\n");

  return [
    securitySection,
    successHeader,
    nextStepsSection,
    tipsSection,
    docsSection,
    readyToGoSection,
  ]
    .filter((section) => section)
    .join("\n");
}
