const fs = require("fs-extra");
const path = require("path");

async function generateViteProject(projectPath, projectName, userChoices) {
  console.log("Creating a Vite React project...");

  // create package.json
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

  // add TypeScript if selected
  if (userChoices.typescript) {
    packageJson.devDependencies["@types/react"] = "^18.2.40";
    packageJson.devDependencies["@types/react-dom"] = "^18.2.17";
    packageJson.devDependencies.typescript = "^5.3.2";
  }

  // add styling dependencies
  if (userChoices.styling === "tailwind") {
    packageJson.devDependencies.tailwindcss = "^3.3.5";
    packageJson.devDependencies.postcss = "^8.4.31";
    packageJson.devDependencies.autoprefixer = "^10.4.16";
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies["styled-components"] = "^6.1.1";
  }

  // write package.json
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // create the basic project structure
  const srcDir = path.join(projectPath, "src");
  fs.ensureDirSync(srcDir);
  fs.ensureDirSync(path.join(projectPath, "public"));

  // create index.html
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

  // create vite.config.js
  const configExt = userChoices.typescript ? "ts" : "js";
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`;
  fs.writeFileSync(
    path.join(projectPath, `vite.config.${configExt}`),
    viteConfig
  );

  // create main file
  const mainContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.${fileExt}'
${userChoices.styling === "tailwind" ? "import './index.css'" : ""}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
  fs.writeFileSync(path.join(srcDir, `main.${fileExt}`), mainContent);

  // create App component based on styling choice
  let appContent;

  if (userChoices.styling === "styled-components") {
    appContent = `import { useState } from 'react'
import styled from 'styled-components'

const Container = styled.div\`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
\`

const Header = styled.h1\`
  font-size: 2.5rem;
  margin-bottom: 1rem;
\`

const Button = styled.button\`
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
  
  &:hover {
    border-color: #646cff;
  }
\`

function App() {
  const [count, setCount] = useState(0)

  return (
    <Container>
      <Header>React Kickstart</Header>
      <p>Edit <code>src/App.${fileExt}</code> and save to test HMR</p>
      <div>
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
      </div>
    </Container>
  )
}

export default App
`;
  } else if (userChoices.styling === "tailwind") {
    appContent = `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">React Kickstart</h1>
      <p className="mb-4">Edit <code className="bg-gray-100 p-1 rounded">src/App.${fileExt}</code> and save to test HMR</p>
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
`;
  } else {
    appContent = `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>React Kickstart</h1>
      <p>Edit <code>src/App.${fileExt}</code> and save to test HMR</p>
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}

export default App
`;
  }

  fs.writeFileSync(path.join(srcDir, `App.${fileExt}`), appContent);

  // create CSS file if needed
  if (userChoices.styling === "css" || userChoices.styling === "tailwind") {
    let cssContent = "";

    if (userChoices.styling === "tailwind") {
      cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

      // create Tailwind config
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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

      // create PostCSS config
      const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
      fs.writeFileSync(
        path.join(projectPath, "postcss.config.js"),
        postcssConfig
      );
    } else {
      cssContent = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

#root {
  max-width: 1280px;
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
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}
`
      );
    }
  }

  // create basic gitignore
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

# editor directories and files need to add for Cursor etc but leaving it for now
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

  // if using TypeScript, create tsconfig.json
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
      references: [{ path: "./tsconfig.node.json" }],
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2)
    );

    const tsConfigNode = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: "ESNext",
        moduleResolution: "bundler",
        allowSyntheticDefaultImports: true,
      },
      include: ["vite.config.ts"],
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.node.json"),
      JSON.stringify(tsConfigNode, null, 2)
    );
  }

  return true;
}

module.exports = generateViteProject;
