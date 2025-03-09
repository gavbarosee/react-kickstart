import fs from "fs-extra";
import path from "path";
import { log } from "../utils/logger.js";

export default async function generateNextjsProject(
  projectPath,
  projectName,
  userChoices
) {
  log(
    `Creating a Next.js React project with ${userChoices.nextRouting} router...`
  );

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

  if (userChoices.typescript) {
    packageJson.dependencies.typescript = "^5.3.2";
    packageJson.dependencies["@types/node"] = "^20.10.0";
    packageJson.dependencies["@types/react"] = "^18.2.39";
    packageJson.dependencies["@types/react-dom"] = "^18.2.17";
  }

  if (userChoices.styling === "tailwind") {
    packageJson.dependencies.tailwindcss = "^3.3.5";
    packageJson.dependencies.postcss = "^8.4.31";
    packageJson.dependencies.autoprefixer = "^10.4.16";
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies["styled-components"] = "^6.1.1";
    packageJson.dependencies["babel-plugin-styled-components"] = "^2.1.4";
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // create basic folder structure based on router choice
  const publicDir = path.join(projectPath, "public");
  fs.ensureDirSync(publicDir);

  if (userChoices.nextRouting === "app") {
    createAppRouterStructure(projectPath, projectName, userChoices);
  } else {
    createPagesRouterStructure(projectPath, projectName, userChoices);
  }

  // create Next.js config file - ALWAYS use .js extension regardless of TypeScript choice
  let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
`;

  if (userChoices.styling === "styled-components") {
    nextConfig += `  compiler: {
    styledComponents: true,
  },
`;
  }

  nextConfig += `};

module.exports = nextConfig;
`;

  // always use .js extension for Next.js config
  fs.writeFileSync(path.join(projectPath, "next.config.js"), nextConfig);

  fs.writeFileSync(
    path.join(publicDir, "next.svg"),
    `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_408_134" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
<circle cx="90" cy="90" r="90" fill="black"/>
</mask>
<g mask="url(#mask0_408_134)">
<circle cx="90" cy="90" r="90" fill="black"/>
<path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_134)"/>
<rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_408_134)"/>
</g>
<defs>
<linearGradient id="paint0_linear_408_134" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint1_linear_408_134" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>`
  );

  const gitignore = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

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
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
  fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

  if (userChoices.linting) {
    const eslintConfig = {
      extends: [
        "next/core-web-vitals",
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:prettier/recommended",
      ],
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

    const updatedPackageJson = JSON.parse(
      fs.readFileSync(path.join(projectPath, "package.json"))
    );
    updatedPackageJson.devDependencies = {
      ...(updatedPackageJson.devDependencies || {}),
      "eslint-config-prettier": "^9.0.0",
      "eslint-plugin-prettier": "^5.0.1",
      prettier: "^3.1.0",
    };

    if (userChoices.typescript) {
      updatedPackageJson.devDependencies = {
        ...updatedPackageJson.devDependencies,
        "@typescript-eslint/eslint-plugin": "^6.13.1",
        "@typescript-eslint/parser": "^6.13.1",
      };
    }

    fs.writeFileSync(
      path.join(projectPath, "package.json"),
      JSON.stringify(updatedPackageJson, null, 2)
    );
  }

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
        plugins: [
          {
            name: "next",
          },
        ],
        paths: {
          "@/*": ["./*"],
        },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
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
  } else {
    const jsConfig = {
      compilerOptions: {
        paths: {
          "@/*": ["./*"],
        },
      },
    };

    fs.writeFileSync(
      path.join(projectPath, "jsconfig.json"),
      JSON.stringify(jsConfig, null, 2)
    );
  }

  return true;
}

function createAppRouterStructure(projectPath, projectName, userChoices) {
  const appDir = path.join(projectPath, "app");
  fs.ensureDirSync(appDir);

  const ext = userChoices.typescript ? "tsx" : "jsx";

  let layoutContent = ``;

  if (userChoices.styling === "tailwind") {
    layoutContent = `import './globals.css'

export const metadata = {
  title: '${projectName}',
  description: 'Created with React Kickstart',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
  } else {
    layoutContent = `export const metadata = {
  title: '${projectName}',
  description: 'Created with React Kickstart',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
  }

  fs.writeFileSync(path.join(appDir, `layout.${ext}`), layoutContent);

  if (userChoices.styling === "tailwind") {
    const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
    fs.writeFileSync(path.join(appDir, "globals.css"), cssContent);

    // create Tailwind config
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

    const postcssConfig = `module.exports = {
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
  }

  // create page file
  const pageContent = getPageStyleForAppRouter(userChoices, ext);
  fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);

  // create api route example if using App Router
  const apiDir = path.join(appDir, "api");
  const helloDir = path.join(apiDir, "hello");
  fs.ensureDirSync(helloDir);

  const routeHandler = `export async function GET(request) {
  return Response.json({ 
    message: 'Hello from Next.js!',
    time: new Date().toISOString()
  });
}
`;

  fs.writeFileSync(
    path.join(helloDir, `route.${userChoices.typescript ? "ts" : "js"}`),
    routeHandler
  );
}

function createPagesRouterStructure(projectPath, projectName, userChoices) {
  const pagesDir = path.join(projectPath, "pages");
  const apiDir = path.join(pagesDir, "api");
  const stylesDir = path.join(projectPath, "styles");

  fs.ensureDirSync(pagesDir);
  fs.ensureDirSync(apiDir);
  fs.ensureDirSync(stylesDir);

  const ext = userChoices.typescript ? "tsx" : "jsx";

  let appContent;

  if (userChoices.styling === "tailwind") {
    appContent = `import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
  } else {
    appContent = `function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
  }

  fs.writeFileSync(path.join(pagesDir, `_app.${ext}`), appContent);

  // create _document file if using styled-components
  if (userChoices.styling === "styled-components") {
    const documentContent = `import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
`;
    fs.writeFileSync(path.join(pagesDir, `_document.${ext}`), documentContent);
  }

  // add CSS file if using Tailwind
  if (userChoices.styling === "tailwind") {
    const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
    fs.writeFileSync(path.join(stylesDir, "globals.css"), cssContent);

    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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

    // PostCSS config
    const postcssConfig = `module.exports = {
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
  }

  const indexContent = getPageStyleForPagesRouter(userChoices, ext);
  fs.writeFileSync(path.join(pagesDir, `index.${ext}`), indexContent);

  // create example API endpoint
  const apiRouteContent = `export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Hello from Next.js!',
    time: new Date().toISOString()
  });
}
`;
  fs.writeFileSync(
    path.join(apiDir, `hello.${userChoices.typescript ? "ts" : "js"}`),
    apiRouteContent
  );
}

function getPageStyleForAppRouter(userChoices, fileExt) {
  if (userChoices.styling === "styled-components") {
    return `'use client';

import styled from 'styled-components';

const Container = styled.div\`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
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
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0051a2;
  }
\`;

export default function Home() {
  return (
    <Container>
      <Title>Welcome to Next.js</Title>
      <p>Edit <code>app/page.${fileExt}</code> to get started</p>
      <div>
        <Button>Get Started</Button>
      </div>
    </Container>
  );
}
`;
  } else if (userChoices.styling === "tailwind") {
    return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Next.js</h1>
      <p className="mb-4">Edit <code className="bg-gray-100 p-1 rounded">app/page.${fileExt}</code> to get started</p>
      <div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Get Started
        </button>
      </div>
    </main>
  );
}
`;
  } else {
    return `export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>Edit <code>app/page.${fileExt}</code> to get started</p>
      <div>
        <button>Get Started</button>
      </div>
    </main>
  );
}
`;
  }
}

function getPageStyleForPagesRouter(userChoices, fileExt) {
  if (userChoices.styling === "styled-components") {
    return `import Head from 'next/head';
import styled from 'styled-components';

const Container = styled.div\`
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
\`;

const Main = styled.main\`
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
\`;

const Title = styled.h1\`
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  text-align: center;
\`;

const Button = styled.button\`
  background-color: #0070f3;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0051a2;
  }
\`;

export default function Home() {
  return (
    <Container>
      <Head>
        <title>Next.js Project</title>
        <meta name="description" content="Created with React Kickstart" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <Title>Welcome to Next.js</Title>
        <p>Get started by editing <code>pages/index.${fileExt}</code></p>
        <Button>Get Started</Button>
      </Main>
    </Container>
  );
}
`;
  } else if (userChoices.styling === "tailwind") {
    return `import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-2">
      <Head>
        <title>Next.js Project</title>
        <meta name="description" content="Created with React Kickstart" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to Next.js
        </h1>

        <p className="mt-3 text-2xl">
          Get started by editing{' '}
          <code className="bg-gray-100 rounded-md p-1 font-mono">pages/index.${fileExt}</code>
        </p>

        <button className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Get Started
        </button>
      </main>
    </div>
  );
}
`;
  } else {
    return `import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Next.js Project</title>
        <meta name="description" content="Created with React Kickstart" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to Next.js</h1>
        <p>Get started by editing <code>pages/index.${fileExt}</code></p>
        <button>Get Started</button>
      </main>
    </div>
  );
}
`;
  }
}
