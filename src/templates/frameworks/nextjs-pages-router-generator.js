import { BaseContentGenerator } from "./base-content-generator.js";

/**
 * Content generator for Next.js Pages Router
 */
export class NextjsPagesRouterGenerator extends BaseContentGenerator {
  constructor() {
    super("nextjs", "pages");
  }

  generateImports(stylingType, userChoices) {
    const baseImports = "import Head from 'next/head';\n";

    const stylingImports = {
      "styled-components": "import styled from 'styled-components';\n",
      tailwind: "",
      css: "",
    };

    return baseImports + (stylingImports[stylingType] || "");
  }

  generateStyles(stylingType, userChoices) {
    if (stylingType !== "styled-components") return "\n";

    return `
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
  ${this.getButtonStyles("styled-components")}
  margin-top: 1rem;
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
      <Head>
        <title>Next.js Project</title>
        <meta name="description" content="Created with React Kickstart" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <Title>${title}</Title>
        <p>${editInstructions}</p>
        <Button>Get Started</Button>
      </Main>
    </Container>
  );
}
`;
    } else if (stylingType === "tailwind") {
      return `export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-2">
      <Head>
        <title>Next.js Project</title>
        <meta name="description" content="Created with React Kickstart" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          ${title}
        </h1>

        <p className="mt-3 text-2xl">
          ${editInstructions}
        </p>

        <button className="mt-6 ${this.getButtonStyles("tailwind")}">
          Get Started
        </button>
      </main>
    </div>
  );
}
`;
    } else {
      // CSS
      return `export default function Home() {
  return (
    <div className="${this.getContainerStyles("css")}">
      <Head>
        <title>Next.js Project</title>
        <meta name="description" content="Created with React Kickstart" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>${title}</h1>
        <p>${editInstructions}</p>
        <button>Get Started</button>
      </main>
    </div>
  );
}
`;
    }
  }

  generateEntryImports(fileExt, userChoices) {
    // Pages Router doesn't have a custom entry point like Vite
    return "";
  }

  generateRenderLogic(userChoices) {
    // Pages Router doesn't have a custom entry point like Vite
    return "";
  }

  /**
   * Generate _app.js/tsx file content
   */
  generateAppFile(stylingType, fileExt) {
    if (stylingType === "tailwind" || stylingType === "css") {
      return `import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
    } else {
      return `function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
    }
  }

  /**
   * Generate _document.js/tsx file for styled-components
   */
  generateDocumentFile(fileExt) {
    return `import Document, { Html, Head, Main, NextScript } from 'next/document';
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
  }

  /**
   * Generate API route content for pages router
   */
  generateApiRoute() {
    return `export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Hello from Next.js!',
    time: new Date().toISOString()
  });
}
`;
  }
}
