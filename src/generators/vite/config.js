import fs from "fs-extra";
import path from "path";

export function createPackageJson(projectPath, projectName, userChoices) {
  const packageJson = {
    name: projectName,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.2.0",
      vite: "^5.0.0",
    },
  };

  if (userChoices.typescript) {
    packageJson.devDependencies["@types/react"] = "^18.2.40";
    packageJson.devDependencies["@types/react-dom"] = "^18.2.17";
    packageJson.devDependencies.typescript = "^5.3.2";
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

  if (userChoices.styling === "tailwind") {
    packageJson.devDependencies.tailwindcss = "^3.3.5";
    packageJson.devDependencies.postcss = "^8.4.31";
    packageJson.devDependencies.autoprefixer = "^10.4.16";
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies["styled-components"] = "^6.1.1";
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}

export function createHtmlFile(projectPath, projectName, userChoices) {
  const fileExt = userChoices.typescript ? "tsx" : "jsx";
  const indexHtml = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${projectName}</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.${fileExt}"></script>
    </body>
  </html>
  `;
  fs.writeFileSync(path.join(projectPath, "index.html"), indexHtml);
}

export function createViteConfig(projectPath, userChoices) {
  const configExt = userChoices.typescript ? "ts" : "js";
  const viteConfig = `import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  
  // https://vitejs.dev/config/
  export default defineConfig({
    plugins: [react()],
  });
  `;
  fs.writeFileSync(
    path.join(projectPath, `vite.config.${configExt}`),
    viteConfig
  );
}

export function setupLinting(projectPath, userChoices) {
  if (!userChoices.linting) return;

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
