import fs from "fs-extra";
import path from "path";

/**
 * Sets up styling configuration for a React project
 *
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used (vite, nextjs)
 * @returns {void}
 */
export function setupStyling(projectPath, userChoices, framework = "vite") {
  const stylingInfo = getStylingInfo(framework, userChoices);

  if (userChoices.styling === "tailwind") {
    setupTailwind(projectPath, stylingInfo, userChoices);
  } else if (userChoices.styling === "css") {
    setupBasicCss(projectPath, stylingInfo);
  } else if (userChoices.styling === "styled-components") {
    setupStyledComponents(projectPath, stylingInfo);
  }
}

/**
 * Returns styling-related info for the specific framework
 * This centralizes all framework-specific CSS paths and conventions
 */
function getStylingInfo(framework, userChoices) {
  // default CSS location and filenames
  const info = {
    cssDir: "src", //  where CSS files should be placed
    mainCssFilename: "index.css", // main CSS file used for imports/global styles
    componentCssFilename: "App.css", // component-specific CSS file (if needed)
    usesComponentCss: false, //     // whether this framework uses a separate component CSS file
    tailwindContentPaths: ["./src/**/*.{js,ts,jsx,tsx}"], // path patterns for Tailwind content configuration
    createPostcssConfig: true, // whether to create PostCSS config as a separate file
    skipCssSetup: false, // whether the framework handles CSS setup internally
  };

  // override defaults with framework-specific settings
  switch (framework) {
    case "vite":
      info.usesComponentCss = true;
      info.tailwindContentPaths = [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ];
      break;

    case "nextjs":
      info.skipCssSetup = true; // next.js has its own CSS setup
      info.mainCssFilename = "globals.css";

      if (userChoices.nextRouting === "app") {
        info.cssDir = "app";
      } else {
        info.cssDir = "styles";
      }

      info.tailwindContentPaths = [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
      ];
      break;
  }

  return info;
}

/**
 * Sets up Tailwind CSS for a project
 */
export function setupTailwind(projectPath, stylingInfo, userChoices) {
  // skip if the framework handles CSS setup internally
  if (stylingInfo.skipCssSetup) {
    setupTailwindForNextjs(projectPath, userChoices.nextRouting);
    return;
  }

  const cssDir = path.join(projectPath, stylingInfo.cssDir);
  fs.ensureDirSync(cssDir);

  // create the main CSS file with Tailwind directives
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  fs.writeFileSync(path.join(cssDir, stylingInfo.mainCssFilename), cssContent);

  createTailwindConfig(projectPath, stylingInfo.tailwindContentPaths);

  if (stylingInfo.createPostcssConfig) {
    createPostcssConfig(projectPath);
  }
}

/**
 * Sets up basic CSS for a project
 */
export function setupBasicCss(projectPath, stylingInfo) {
  if (stylingInfo.skipCssSetup) {
    return;
  }

  const cssDir = path.join(projectPath, stylingInfo.cssDir);
  fs.ensureDirSync(cssDir);

  const mainCssContent = `body {
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
  fs.writeFileSync(
    path.join(cssDir, stylingInfo.mainCssFilename),
    mainCssContent
  );

  if (stylingInfo.usesComponentCss) {
    const componentCssContent = `
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
    fs.writeFileSync(
      path.join(cssDir, stylingInfo.componentCssFilename),
      componentCssContent
    );
  }
}

/**
 * Sets up styled-components for a project
 */
export function setupStyledComponents(projectPath, stylingInfo) {
  // styled-components is CSS-in-JS, so no additional CSS files needed
  // The dependencies are handled by the generator configs
  // This function mainly serves as a placeholder for consistency
  if (stylingInfo.skipCssSetup) {
    // Framework handles CSS setup internally (like Next.js)
    return;
  }

  // For frameworks like Vite, no additional setup is required
  // since styled-components works out of the box after installing dependencies
}

/**
 * Creates a Tailwind CSS configuration file
 */
function createTailwindConfig(projectPath, contentPaths) {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
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
}

/**
 * Creates a PostCSS configuration file
 */
function createPostcssConfig(projectPath) {
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
`;
  fs.writeFileSync(path.join(projectPath, "postcss.config.js"), postcssConfig);
}

/**
 * Sets up Tailwind CSS specifically for Next.js projects
 * This handles both app and pages router types
 */
function setupTailwindForNextjs(projectPath, routingType) {
  const cssDir =
    routingType === "app"
      ? path.join(projectPath, "app")
      : path.join(projectPath, "styles");

  fs.ensureDirSync(cssDir);

  // create globals.css for Tailwind
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  fs.writeFileSync(path.join(cssDir, "globals.css"), cssContent);

  // next.js uses CommonJS for its config files
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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

  // next.js also uses CommonJS for PostCSS config
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
  fs.writeFileSync(path.join(projectPath, "postcss.config.js"), postcssConfig);
}
