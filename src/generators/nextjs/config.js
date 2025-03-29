import fs from "fs-extra";
import path from "path";

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
      next: "^14.0.3",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
  };

  if (userChoices.typescript) {
    packageJson.dependencies.typescript = "^5.3.2";
    packageJson.dependencies["@types/node"] = "^20.10.0";
    packageJson.dependencies["@types/react"] = "^18.2.39";
    packageJson.dependencies["@types/react-dom"] = "^18.2.17";
  }

  if (userChoices.styling === "tailwind") {
    packageJson.dependencies.tailwindcss = "^3.3.5";
    packageJson.dependencies.postcss = "^8.4.31";
    packageJson.dependencies.autoprefixer = "^10.4.16";
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies["styled-components"] = "^6.1.1";
    packageJson.dependencies["babel-plugin-styled-components"] = "^2.1.4";
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
