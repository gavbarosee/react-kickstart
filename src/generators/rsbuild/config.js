import fs from "fs-extra";
import path from "path";
import {
  getCoreDependencies,
  getTypescriptDependencies,
  getTailwindDependencies,
  getStyledComponentsDependencies,
  getLintingDependencies,
  frameworks,
  getReduxDependencies,
  getZustandDependencies,
  getMobxDependencies,
  getRoutingDependencies,
} from "../../config/dependencies.js";

export function createPackageJson(projectPath, projectName, userChoices) {
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "rsbuild dev",
      build: "rsbuild build",
      preview: "rsbuild preview",
    },
    dependencies: {
      ...getCoreDependencies(),
    },
    devDependencies: {
      "@rsbuild/core": frameworks.rsbuild.core,
      "@rsbuild/plugin-react": frameworks.rsbuild.pluginReact,
    },
  };

  if (userChoices.routing && userChoices.routing !== "none") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getRoutingDependencies(userChoices.routing),
    };
  }

  if (userChoices.typescript) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...getTypescriptDependencies(),
    };
  }

  if (userChoices.styling === "tailwind") {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...getTailwindDependencies(),
    };
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getStyledComponentsDependencies(),
    };
  }

  if (userChoices.linting) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...getLintingDependencies(userChoices.typescript),
    };
  }

  if (userChoices.stateManagement === "redux") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getReduxDependencies(),
    };
  }

  if (userChoices.stateManagement === "zustand") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getZustandDependencies(),
    };
  }
  if (userChoices.stateManagement === "mobx") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getMobxDependencies(),
    };
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}

export function createHtmlFile(projectPath, projectName) {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
  fs.writeFileSync(path.join(projectPath, "index.html"), indexHtml);
}

export function createRsbuildConfig(projectPath, userChoices) {
  const configExt = userChoices.typescript ? "ts" : "js";
  const fileExt = userChoices.typescript ? "tsx" : "jsx";

  const rsbuildConfig = `import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/index.${fileExt}'
    }
  },
  dev: {
    port: 8080,
    startUrl: true, // Automatically open browser
  },
  html: {
    title: '${path.basename(projectPath)}'
  }
});
`;
  fs.writeFileSync(
    path.join(projectPath, `rsbuild.config.${configExt}`),
    rsbuildConfig
  );
}
