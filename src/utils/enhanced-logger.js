import chalk from "chalk";
import figures from "figures";
import fs from "fs-extra";
import path from "path";

export function stepSection(emoji, title, items = []) {
  console.log(`  ${emoji} ${chalk.bold(title)}`);

  if (items && items.length > 0) {
    items.forEach((item) => {
      const label = item.label.padEnd(20);
      const description = item.description
        ? chalk.dim(`✓ ${item.description}`)
        : "";
      console.log(`     ${label} ${description}`);
    });
  }

  console.log();
}

export function progressBar(percentage, label = "", size = 30) {
  const displayPercentage = Math.max(5, percentage);
  const completed = Math.floor(size * (displayPercentage / 100));
  const remaining = size - completed;

  const bar =
    chalk.cyan("█".repeat(completed)) + chalk.gray("░".repeat(remaining));

  const percentText = `${Math.floor(percentage)}%`.padStart(4);

  if (label) {
    console.log(`  📊 ${label}: ${bar} ${percentText}`);
  } else {
    console.log(`  📊 Progress: ${bar} ${percentText}`);
  }
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
    // silently fail but return minimal information
    console.log(`  📦 Project files generated successfully`);
    console.log();
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
        name.includes("parcel") ||
        name.includes("babel") ||
        name.includes("build") ||
        name.includes("rsbuild")
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
  } else if (framework === "rsbuild") {
    return [
      ...commonStructure,
      { label: "config/", description: "Build configuration" },
    ];
  } else if (framework === "parcel") {
    return [
      ...commonStructure,
      { label: "src/index.html", description: "Entry HTML file" },
    ];
  }

  return commonStructure;
}

// get configuration files based on framework and options
export function getConfigurationFiles(framework, typescript, styling, linting) {
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
  } else if (framework === "rsbuild") {
    configs.push({
      label: `rsbuild.config.${typescript ? "ts" : "js"}`,
      description: "Rsbuild configuration",
    });
  } else if (framework === "parcel") {
    configs.push({
      label: ".parcelrc",
      description: "Parcel configuration",
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

  return configs;
}
