import fs from "fs-extra";
import path from "path";

/**
 * Sets up styling configuration for a React project
 *
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used (vite, nextjs, rsbuild, parcel)
 * @returns {void}
 */
export function setupStyling(projectPath, userChoices, framework = "vite") {
  const srcDir = path.join(
    projectPath,
    framework === "nextjs" && userChoices.nextRouting === "app" ? "app" : "src"
  );

  if (userChoices.styling === "tailwind") {
    setupTailwind(projectPath, srcDir, framework, userChoices);
  } else if (userChoices.styling === "css") {
    setupBasicCss(srcDir, framework);
  }
  // styled-components doesn't require config files and is setup in component templates
}

/**
 * Sets up Tailwind CSS for a project
 */
export function setupTailwind(projectPath, srcDir, framework, userChoices) {
  // Determine the correct CSS filename based on framework
  const cssFilename = getCssFilename(framework, userChoices);

  // Standard Tailwind CSS content
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  // Write CSS file to appropriate location
  fs.writeFileSync(path.join(srcDir, cssFilename), cssContent);

  // Create tailwind.config.js with framework-specific content paths
  const contentPaths = getContentPaths(framework);

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
${framework === "vite" ? "export default" : "module.exports ="} {
  content: [
    ${contentPaths.map((path) => `"${path}"`).join(",\n    ")}
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

  // Create postcss.config.js with framework-specific format
  const isEsm = framework === "vite";
  const postcssConfig = `${isEsm ? "export default" : "module.exports ="} {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

  fs.writeFileSync(path.join(projectPath, "postcss.config.js"), postcssConfig);
}

/**
 * Sets up basic CSS for a project
 */
export function setupBasicCss(srcDir, framework) {
  // Determine CSS filename based on framework
  const cssFilename = framework === "vite" ? "App.css" : "styles.css";
  const indexCssFilename = getCssFilename(framework);

  // Common CSS content
  const cssContent = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
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

  fs.writeFileSync(path.join(srcDir, indexCssFilename), cssContent);

  // Only create App.css for vite and similar frameworks
  if (framework === "vite") {
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
}

/**
 * Determines the content paths for Tailwind configuration based on framework
 */
function getContentPaths(framework) {
  switch (framework) {
    case "nextjs":
      return [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
      ];
    case "vite":
      return ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"];
    case "parcel":
      return ["./src/**/*.{html,js,jsx,ts,tsx}"];
    case "rsbuild":
      return ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"];
    default:
      return ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"];
  }
}

/**
 * Determines the CSS filename based on framework
 */
function getCssFilename(framework, userChoices = {}) {
  if (framework === "nextjs") {
    return userChoices.nextRouting === "app" ? "globals.css" : "globals.css";
  } else if (framework === "vite") {
    return "index.css";
  } else {
    return "styles.css";
  }
}
