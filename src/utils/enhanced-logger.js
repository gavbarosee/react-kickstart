import chalk from "chalk";
import figures from "figures";
import fs from "fs-extra";
import path from "path";
import { createUIRenderer } from "../templates/index.js";

export function stepSection(emoji, title, items = []) {
  const uiRenderer = createUIRenderer();
  uiRenderer.stepSection(emoji, title, items);
}

export function progressBar(percentage, label = "", size = 30) {
  const uiRenderer = createUIRenderer();
  const output = uiRenderer.progressBar(percentage, label, { size });
  console.log(`  📊 ${output}`);
}

export function fileGenerationInfo(projectPath) {
  try {
    // count files and get approximate size
    let fileCount = 0;
    let totalSize = 0;

    function countFilesRecursive(directory) {
      const items = fs.readdirSync(directory);

      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory() && !item.includes("node_modules")) {
          countFilesRecursive(fullPath);
        } else if (stats.isFile()) {
          fileCount++;
          totalSize += stats.size;
        }
      }
    }

    if (!fs.existsSync(projectPath)) {
      console.log(
        `  ⚠️ Project path '${projectPath}' doesn't exist to count files`
      );
      return;
    }

    countFilesRecursive(projectPath);

    // convert to KB for readability
    const sizeInKB = (totalSize / 1024).toFixed(0);

    console.log(
      `  📦 Generated ${chalk.cyan(fileCount)} files (${chalk.cyan(
        sizeInKB + "KB"
      )} on disk)`
    );
    console.log();
  } catch (err) {
    // log the error but don't crash the application
    console.log(`  ⚠️ Error calculating project stats: ${err.message}`);
    console.log(
      `  📦 Project files generated successfully but couldn't count them`
    );
    console.log();

    // if in verbose mode (tba later), show the stack trace
    // if (verbose) {
    //   console.error(err);
    // }
  }
}

// categorize dependencies from package.json
export function categorizeDependencies(packageJsonPath) {
  try {
    const packageData = fs.readJsonSync(packageJsonPath);
    const dependencies = packageData.dependencies || {};
    const devDependencies = packageData.devDependencies || {};

    //  dependencies by type
    const categories = {
      "React ecosystem": [],
      "UI frameworks": [],
      "Build tools": [],
      "Dev tools": [],
      Routing: [],
      Others: [],
    };

    // helper to categorize a dependency
    function categorize(name, version, isDev) {
      const dep = `${name}@${version}`;

      if (name.includes("react") || name.includes("jsx")) {
        categories["React ecosystem"].push(dep);
      } else if (
        name.includes("tailwind") ||
        name.includes("style") ||
        name.includes("css") ||
        name.includes("sass") ||
        name.includes("less") ||
        name.includes("postcss")
      ) {
        categories["UI frameworks"].push(dep);
      } else if (
        name.includes("vite") ||
        name.includes("webpack") ||
        name.includes("babel") ||
        name.includes("build")
      ) {
        categories["Build tools"].push(dep);
      } else if (
        name.includes("eslint") ||
        name.includes("prettier") ||
        name.includes("typescript") ||
        name.includes("test") ||
        name.includes("jest") ||
        isDev
      ) {
        categories["Dev tools"].push(dep);
      } else if (name.includes("router") || name.includes("navigation")) {
        categories["Routing"].push(dep);
      } else {
        categories["Others"].push(dep);
      }
    }

    // categorize all dependencies
    Object.entries(dependencies).forEach(([name, version]) => {
      categorize(name, version, false);
    });

    Object.entries(devDependencies).forEach(([name, version]) => {
      categorize(name, version, true);
    });

    // filter out empty categories and format for display
    const result = Object.entries(categories)
      .filter(([_, deps]) => deps.length > 0)
      .map(([category, deps]) => {
        // limit to first 3 deps and count remaining
        const displayed = deps.slice(0, 3);
        const remaining = deps.length > 3 ? deps.length - 3 : 0;

        return {
          category,
          // add a nice checkmark to each category
          deps:
            "✓ " +
            displayed.join(", ") +
            (remaining ? ` (+${remaining} more)` : ""),
        };
      });

    return result;
  } catch (err) {
    // return minimal info if package.json can't be read
    return [{ category: "Dependencies", deps: "package.json dependencies" }];
  }
}

// get structure information based on framework
export function getProjectStructure(framework) {
  const commonStructure = [
    { label: "src/", description: "Main application code" },
    { label: "public/", description: "Static assets" },
  ];

  if (framework === "vite") {
    return [
      ...commonStructure,
      { label: "index.html", description: "Entry HTML file" },
    ];
  } else if (framework === "nextjs") {
    return [
      { label: "pages/" || "app/", description: "Route components" },
      { label: "public/", description: "Static assets" },
      { label: "styles/", description: "CSS/styling files" },
    ];
  }

  return commonStructure;
}

// get configuration files based on framework and options
export function getConfigurationFiles(
  framework,
  typescript,
  styling,
  linting,
  stateManagement
) {
  const configs = [];

  if (framework === "vite") {
    configs.push({
      label: `vite.config.${typescript ? "ts" : "js"}`,
      description: "React plugin, aliases, build options",
    });
  } else if (framework === "nextjs") {
    configs.push({
      label: "next.config.js",
      description: "Next.js configuration",
    });
  }

  if (typescript) {
    configs.push({
      label: "tsconfig.json",
      description: "TypeScript configuration",
    });
  }

  if (styling === "tailwind") {
    configs.push({
      label: "tailwind.config.js",
      description: "Tailwind CSS configuration",
    });
    configs.push({
      label: "postcss.config.js",
      description: "PostCSS for Tailwind",
    });
  }

  if (linting) {
    configs.push({
      label: ".eslintrc.json",
      description: `React${typescript ? " + TS" : ""} rules with Prettier`,
    });
    configs.push({
      label: ".prettierrc",
      description: "Code formatting rules",
    });
  }

  if (stateManagement === "redux") {
    if (framework === "nextjs") {
      configs.push({
        label: `lib/store.${typescript ? "ts" : "js"}`,
        description: "Redux Toolkit store configuration",
      });
      configs.push({
        label: `lib/hooks.${typescript ? "ts" : "js"}`,
        description: "Redux hooks with TypeScript support",
      });
    } else {
      configs.push({
        label: `src/store/store.${typescript ? "ts" : "js"}`,
        description: "Redux Toolkit store configuration",
      });
      configs.push({
        label: `src/store/counterSlice.${typescript ? "ts" : "js"}`,
        description: "Redux Toolkit counter slice",
      });
    }
  }

  return configs;
}
