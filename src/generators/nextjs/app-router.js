import fs from "fs-extra";
import path from "path";

import { setupStyling } from "../../shared/styling.js";
import {
  getStyledComponentsApp,
  getTailwindApp,
  getBasicCssApp,
} from "../../shared/components.js";

export function createAppRouterStructure(
  projectPath,
  projectName,
  userChoices
) {
  const appDir = path.join(projectPath, "app");
  fs.ensureDirSync(appDir);

  const ext = userChoices.typescript ? "tsx" : "jsx";

  createLayoutFile(appDir, projectName, userChoices, ext);

  // Create page file using shared component templates
  const pageContent = getStyledComponentsApp(ext, "nextjs", true);
  if (userChoices.styling === "styled-components") {
    const pageContent = getStyledComponentsApp(ext, "nextjs", true);
    fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);
  } else if (userChoices.styling === "tailwind") {
    const pageContent = getTailwindApp(ext, "nextjs", true);
    fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);
  } else {
    const pageContent = getBasicCssApp(ext, "nextjs", true);
    fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);
  }

  // Setup Tailwind if needed (using shared module)
  if (userChoices.styling === "tailwind") {
    setupStyling(projectPath, { ...userChoices, nextRouting: "app" }, "nextjs");
  }

  // Create API route
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
