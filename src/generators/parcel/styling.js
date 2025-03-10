import fs from "fs-extra";
import path from "path";

export function setupStyling(projectPath, userChoices) {
  const srcDir = path.join(projectPath, "src");

  if (userChoices.styling === "tailwind") {
    setupTailwind(projectPath, srcDir);
  } else if (userChoices.styling === "css") {
    setupBasicCss(srcDir);
  }
}

export function setupTailwind(projectPath, srcDir) {
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  fs.writeFileSync(path.join(srcDir, "styles.css"), cssContent);

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
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

  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
  fs.writeFileSync(path.join(projectPath, "postcss.config.js"), postcssConfig);
}

export function setupBasicCss(srcDir) {
  const cssContent = `body {
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
`;
  fs.writeFileSync(path.join(srcDir, "styles.css"), cssContent);
}
