import fs from "fs-extra";
import path from "path";

export function createPackageJson(projectPath, projectName, userChoices) {
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "rsbuild dev",
      build: "rsbuild build",
      preview: "rsbuild preview",
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    devDependencies: {
      "@rsbuild/core": "^0.2.3",
      "@rsbuild/plugin-react": "^0.2.3",
    },
  };

  if (userChoices.typescript) {
    packageJson.devDependencies.typescript = "^5.3.2";
    packageJson.devDependencies["@types/react"] = "^18.2.39";
    packageJson.devDependencies["@types/react-dom"] = "^18.2.17";
  }

  if (userChoices.styling === "tailwind") {
    packageJson.devDependencies.tailwindcss = "^3.3.5";
    packageJson.devDependencies.postcss = "^8.4.31";
    packageJson.devDependencies.autoprefixer = "^10.4.16";
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies["styled-components"] = "^6.1.1";
  }

  if (userChoices.linting) {
    packageJson.devDependencies.eslint = "^8.55.0";
    packageJson.devDependencies["eslint-plugin-react"] = "^7.33.2";
    packageJson.devDependencies["eslint-plugin-react-hooks"] = "^4.6.0";
    packageJson.devDependencies.prettier = "^3.1.0";
    packageJson.devDependencies["eslint-plugin-prettier"] = "^5.0.1";
    packageJson.devDependencies["eslint-config-prettier"] = "^9.1.0";

    if (userChoices.typescript) {
      packageJson.devDependencies["@typescript-eslint/eslint-plugin"] =
        "^6.13.1";
      packageJson.devDependencies["@typescript-eslint/parser"] = "^6.13.1";
    }
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
  const rsbuildConfig = `import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  ${
    userChoices.styling === "tailwind"
      ? `tools: {
    postcss: (config) => {
      const tailwindcss = require('tailwindcss');
      const autoprefixer = require('autoprefixer');
      
      config.postcssOptions = {
        plugins: [tailwindcss, autoprefixer],
      };
      
      return config;
    },
  },`
      : ""
  }
});
`;
  fs.writeFileSync(
    path.join(projectPath, `rsbuild.config.${configExt}`),
    rsbuildConfig
  );
}

export function setupLinting(projectPath, userChoices) {
  const eslintConfig = {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:prettier/recommended",
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: ["react", "prettier"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": ["error", { singleQuote: true }],
    },
  };

  if (userChoices.typescript) {
    eslintConfig.extends.push("plugin:@typescript-eslint/recommended");
    eslintConfig.parser = "@typescript-eslint/parser";
    eslintConfig.plugins.push("@typescript-eslint");
  }

  fs.writeFileSync(
    path.join(projectPath, ".eslintrc.json"),
    JSON.stringify(eslintConfig, null, 2)
  );

  const prettierConfig = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: "es5",
  };

  fs.writeFileSync(
    path.join(projectPath, ".prettierrc"),
    JSON.stringify(prettierConfig, null, 2)
  );
}
