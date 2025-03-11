import fs from "fs-extra";
import path from "path";

export function createAppRouterStructure(
  projectPath,
  projectName,
  userChoices
) {
  const appDir = path.join(projectPath, "app");
  fs.ensureDirSync(appDir);

  const ext = userChoices.typescript ? "tsx" : "jsx";

  createLayoutFile(appDir, projectName, userChoices, ext);

  // create page file
  const pageContent = getPageStyleForAppRouter(userChoices, ext);
  fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);

  if (userChoices.styling === "tailwind") {
    setupTailwindForAppRouter(projectPath, appDir);
  }

  // API route example
  createApiRoute(appDir, userChoices);
}

function createLayoutFile(appDir, projectName, userChoices, ext) {
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
}

function setupTailwindForAppRouter(projectPath, appDir) {
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
  fs.writeFileSync(path.join(projectPath, "postcss.config.js"), postcssConfig);
}

function createApiRoute(appDir, userChoices) {
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

export function getPageStyleForAppRouter(userChoices, fileExt) {
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
