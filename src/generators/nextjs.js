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

  // add TypeScript if selected
  if (userChoices.typescript) {
    packageJson.dependencies.typescript = "^5.3.2";
    packageJson.dependencies["@types/node"] = "^20.10.0";
    packageJson.dependencies["@types/react"] = "^18.2.39";
    packageJson.dependencies["@types/react-dom"] = "^18.2.17";
  }

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

  // determine file extensions
  const fileExt = userChoices.typescript ? "tsx" : "jsx";

  // create Next.js config file (always .js regardless of TS choice)
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
  fs.writeFileSync(path.join(projectPath, "next.config.js"), nextConfig);

  // Create index page
  const indexContent = `export default function Home() {
  return (
    <div>
      <h1>Welcome to React Kickstart</h1>
      <p>Edit <code>pages/index.${fileExt}</code> to get started</p>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(pagesDir, `index.${fileExt}`), indexContent);

  // Create _app page
  const appContent = `import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
  fs.writeFileSync(path.join(pagesDir, `_app.${fileExt}`), appContent);

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

  // create gitignore
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

# typescript
*.tsbuildinfo
next-env.d.ts
`;
  fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

  // if using TypeScript, create tsconfig.json
  if (userChoices.typescript) {
    const tsConfig = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        paths: {
          "@/*": ["./*"],
        },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"],
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2)
    );

    // create next-env.d.ts
    const nextEnvDts = `/// <reference types="next" />
/// <reference types="next/navigation-types/compat/navigation" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;
    fs.writeFileSync(path.join(projectPath, "next-env.d.ts"), nextEnvDts);
  }

  return true;
}

module.exports = generateNextjsProject;
