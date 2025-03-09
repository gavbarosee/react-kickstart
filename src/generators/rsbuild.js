import fs from "fs-extra";
import path from "path";
import { log } from "../utils/logger.js";

export default async function generateRsbuildProject(
  projectPath,
  projectName,
  userChoices
) {
  log("Creating an Rsbuild React project...");

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

  const srcDir = path.join(projectPath, "src");
  fs.ensureDirSync(srcDir);
  fs.ensureDirSync(path.join(projectPath, "public"));

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

  const indexExt = userChoices.typescript ? "tsx" : "jsx";
  const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${userChoices.styling === "tailwind" ? "import './index.css';" : ""}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  fs.writeFileSync(path.join(srcDir, `index.${indexExt}`), indexContent);

  let appContent;

  if (userChoices.styling === "styled-components") {
    appContent = `import React from 'react';
import styled from 'styled-components';

const Container = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
\`;

const Title = styled.h1\`
  font-size: 2.5rem;
  margin-bottom: 1rem;
\`;

const Button = styled.button\`
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #0051a2;
  }
\`;

function App() {
  return (
    <Container>
      <Title>Welcome to React Kickstart</Title>
      <p>Edit <code>src/App.${indexExt}</code> to get started</p>
      <Button>Get Started</Button>
    </Container>
  );
}

export default App;
`;
  } else if (userChoices.styling === "tailwind") {
    appContent = `import React from 'react';

function App() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to React Kickstart</h1>
      <p className="mb-4">Edit <code className="bg-gray-100 p-1 rounded">src/App.${indexExt}</code> to get started</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Get Started
      </button>
    </div>
  );
}

export default App;
`;
  } else {
    appContent = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="container">
      <h1>Welcome to React Kickstart</h1>
      <p>Edit <code>src/App.${indexExt}</code> to get started</p>
      <button>Get Started</button>
    </div>
  );
}

export default App;
`;
  }

  fs.writeFileSync(path.join(srcDir, `App.${indexExt}`), appContent);

  if (userChoices.styling === "css" || userChoices.styling === "tailwind") {
    let cssContent = "";

    if (userChoices.styling === "tailwind") {
      cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
      fs.writeFileSync(
        path.join(projectPath, "tailwind.config.js"),
        tailwindConfig
      );
    } else {
      cssContent = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
`;
    }

    fs.writeFileSync(path.join(srcDir, "index.css"), cssContent);

    if (userChoices.styling === "css") {
      fs.writeFileSync(
        path.join(srcDir, "App.css"),
        `
h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

button {
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

button:hover {
  background-color: #0051a2;
}
`
      );
    }
  }

  if (userChoices.linting) {
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

  const gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;
  fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

  if (userChoices.typescript) {
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ["src"],
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  return true;
}
