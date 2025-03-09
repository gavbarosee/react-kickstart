import fs from "fs-extra";
import path from "path";

// for css and tailwind only, styled-components doesn't require config files and is setup in getStylecComponents
export function setupStyling(projectPath, userChoices) {
  const srcDir = path.join(projectPath, "src");

  if (userChoices.styling === "tailwind") {
    setupTailwind(projectPath, srcDir);
  } else {
    setupBasicCss(srcDir);
  }
}

export function setupTailwind(projectPath, srcDir) {
  // tailwind CSS file
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  fs.writeFileSync(path.join(srcDir, "index.css"), cssContent);

  // tailwind conf
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

  // postCSS config
  const postcssConfig = `export default {
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
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
`;
  fs.writeFileSync(path.join(srcDir, "index.css"), cssContent);

  // basic app css
  const appCssContent = `
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
`;
  fs.writeFileSync(path.join(srcDir, "App.css"), appCssContent);
}
