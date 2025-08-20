import { BaseContentGenerator } from "./BaseContentGenerator.js";

/**
 * Content generator for Next.js App Router
 */
export class NextjsAppRouterGenerator extends BaseContentGenerator {
  constructor() {
    super("nextjs", "app");
  }

  generateImports(stylingType, userChoices) {
    const useClientDirective = "'use client';\n\n";

    const stylingImports = {
      "styled-components":
        "import React from 'react';\nimport styled from 'styled-components';\n",
      tailwind: "",
      css: "",
    };

    return useClientDirective + (stylingImports[stylingType] || "");
  }

  generateStyles(stylingType, userChoices) {
    if (stylingType !== "styled-components") return "\n";

    return `
const Container = styled.div\`
  ${this.getContainerStyles("styled-components")}
\`;

const Title = styled.h1\`
  ${this.getTitleStyles("styled-components")}
\`;

const Button = styled.button\`
  ${this.getButtonStyles("styled-components")}
\`;

`;
  }

  generateComponent(structure, fileExt, userChoices) {
    const { type: stylingType } = structure;
    const title = this.getProjectTitle();
    const editInstructions = this.getEditInstructions(fileExt);

    if (stylingType === "styled-components") {
      return `export default function Home() {
  return (
    <Container>
      <Title>${title}</Title>
      <p>${editInstructions}</p>
      <div>
        <Button>Get Started</Button>
      </div>
    </Container>
  );
}
`;
    } else if (stylingType === "tailwind") {
      return `export default function Home() {
  return (
    <main className="${this.getContainerStyles("tailwind")}">
      <h1 className="${this.getTitleStyles("tailwind")}">${title}</h1>
      <p className="mb-4">${editInstructions}</p>
      <div>
        <button className="${this.getButtonStyles("tailwind")}">
          Get Started
        </button>
      </div>
    </main>
  );
}
`;
    } else {
      // CSS
      return `export default function Home() {
  return (
    <main className="${this.getContainerStyles("css")}">
      <h1>${title}</h1>
      <p>${editInstructions}</p>
      <div>
        <button>Get Started</button>
      </div>
    </main>
  );
}
`;
    }
  }

  generateEntryImports(fileExt, userChoices) {
    // App Router doesn't have a traditional entry point
    return "";
  }

  generateRenderLogic(userChoices) {
    // App Router doesn't have a traditional entry point
    return "";
  }

  /**
   * Generate layout file content for App Router
   */
  generateLayout(projectName, stylingType, fileExt) {
    const typeImport =
      fileExt === "tsx" ? `import type { ReactNode } from 'react';\n` : "";
    const childrenType = fileExt === "tsx" ? `: { children: ReactNode }` : "";

    if (stylingType === "tailwind" || stylingType === "css") {
      return `${typeImport}import './globals.css';

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
    } else if (stylingType === "styled-components") {
      return `${typeImport}import StyledComponentsRegistry from './styled-components-registry.${fileExt}';

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
    } else {
      return `export const metadata = {
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
  }

  /**
   * Generate styled-components registry for SSR
   */
  generateStyledComponentsRegistry(fileExt) {
    if (fileExt === "tsx") {
      return `"use client";
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
`;
    } else {
      return `"use client";
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
    }
  }

  /**
   * Generate API route content
   */
  generateApiRoute() {
    return `export async function GET(request) {
  return Response.json({ 
    message: 'Hello from Next.js!',
    time: new Date().toISOString()
  });
}
`;
  }
}
