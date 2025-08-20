import fs from "fs-extra";
import path from "path";

import {
  getStyledComponentsApp,
  getTailwindApp,
  getBasicCssApp,
} from "../../shared/components.js";
import { setupStyling } from "../../shared/styling.js";

export function createAppRouterStructure(
  projectPath,
  projectName,
  userChoices
) {
  const appDir = path.join(projectPath, "app");
  fs.ensureDirSync(appDir);

  const ext = userChoices.typescript ? "tsx" : "jsx";

  createLayoutFile(appDir, projectName, userChoices, ext);

  let pageContent;

  if (userChoices.styling === "styled-components") {
    pageContent = getStyledComponentsApp(ext, "nextjs", true);
  } else if (userChoices.styling === "tailwind") {
    pageContent = getTailwindApp(ext, "nextjs", true);
  } else {
    pageContent = getBasicCssApp(ext, "nextjs", true);
  }

  fs.writeFileSync(path.join(appDir, `page.${ext}`), pageContent);

  // Ensure styling setup for all styling options (tailwind, styled-components, plain css)
  setupStyling(projectPath, userChoices, "nextjs");

  createApiRoute(appDir, userChoices);
}

function createLayoutFile(appDir, projectName, userChoices, ext) {
  let layoutContent = ``;

  if (userChoices.styling === "tailwind" || userChoices.styling === "css") {
    const typeImport =
      ext === "tsx" ? `import type { ReactNode } from 'react';\n` : "";
    const childrenType = ext === "tsx" ? `: { children: ReactNode }` : "";
    layoutContent = `${typeImport}import './globals.css';

export const metadata = {
  title: '${projectName}',
  description: 'Created with React Kickstart',
}

export default function RootLayout({ children }${childrenType}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
  } else if (userChoices.styling === "styled-components") {
    // Use Styled Components Registry for proper SSR in App Router
    const typeImport =
      ext === "tsx" ? `import type { ReactNode } from 'react';\n` : "";
    const childrenType = ext === "tsx" ? `: { children: ReactNode }` : "";
    layoutContent = `${typeImport}import StyledComponentsRegistry from './styled-components-registry.${ext}';

export const metadata = {
  title: '${projectName}',
  description: 'Created with React Kickstart',
}

export default function RootLayout({ children }${childrenType}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
`;
    // Create the Styled Components Registry file alongside layout
    const registryContent =
      ext === "tsx"
        ? `"use client";
import React, { useState, type ReactNode } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
`
        : `"use client";
import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({ children }) {
  const [styledComponentsStyleSheet] = React.useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
`;
    fs.writeFileSync(
      path.join(appDir, `styled-components-registry.${ext}`),
      registryContent
    );
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
