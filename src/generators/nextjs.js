const fs = require("fs-extra");
const path = require("path");

async function generateNextjsProject(projectPath, projectName, userChoices) {
  console.log("Creating a Next.js React project...");

  // create package.json
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

  // write package.json
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // create basic folder structure
  const pagesDir = path.join(projectPath, "pages");
  const publicDir = path.join(projectPath, "public");
  const stylesDir = path.join(projectPath, "styles");

  fs.ensureDirSync(pagesDir);
  fs.ensureDirSync(publicDir);
  fs.ensureDirSync(stylesDir);

  // create Next.js config file
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
  fs.writeFileSync(path.join(projectPath, "next.config.js"), nextConfig);

  // create page file
  const indexContent = `export default function Home() {
  return (
    <div>
      <h1>Welcome to React Kickstart</h1>
      <p>Edit <code>pages/index.js</code> to get started</p>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(pagesDir, "index.js"), indexContent);

  // create _app.js
  const appContent = `import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
  fs.writeFileSync(path.join(pagesDir, "_app.js"), appContent);

  // add CSS file
  const cssContent = `html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
`;
  fs.writeFileSync(path.join(stylesDir, "globals.css"), cssContent);

  // create basic gitignore
  const gitignore = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel
`;
  fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

  return true;
}

module.exports = generateNextjsProject;
