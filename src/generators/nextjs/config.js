import fs from "fs-extra";
import path from "path";
import {
  getCoreDependencies,
  getTypescriptDependencies,
  getTailwindDependencies,
  getStyledComponentsDependencies,
  frameworks,
  getReduxDependencies,
} from "../../config/dependencies.js";

export function createPackageJson(projectPath, projectName, userChoices) {
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      ...getCoreDependencies(),
      next: frameworks.nextjs.next,
    },
  };

  if (userChoices.typescript) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getTypescriptDependencies(false), // include as regular dependencies for Next.js
    };
  }

  if (userChoices.styling === "tailwind") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getTailwindDependencies(false), // next.js uses these as regular dependencies
    };
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getStyledComponentsDependencies(),
      "babel-plugin-styled-components": styling.babelPluginStyledComponents,
    };
  }

  if (userChoices.stateManagement === "redux") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getReduxDependencies(),
    };
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}

export function createNextConfig(projectPath, userChoices) {
  // create Next.js config file - ALWAYS use .js extension regardless of TypeScript choice
  let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
`;

  if (userChoices.styling === "styled-components") {
    nextConfig += `  compiler: {
    styledComponents: true,
  },
`;
  }

  nextConfig += `};

module.exports = nextConfig;
`;

  // always use .js extension for Next.js config
  fs.writeFileSync(path.join(projectPath, "next.config.js"), nextConfig);
}

export function setupJsConfig(projectPath) {
  const jsConfig = {
    compilerOptions: {
      paths: {
        "@/*": ["./*"],
      },
    },
  };

  fs.writeFileSync(
    path.join(projectPath, "jsconfig.json"),
    JSON.stringify(jsConfig, null, 2)
  );
}
