import fs from "fs-extra";
import path from "path";
import { setupStyling } from "../../shared/styling.js";

export function createPagesRouterStructure(
  projectPath,
  projectName,
  userChoices
) {
  const pagesDir = path.join(projectPath, "pages");
  const apiDir = path.join(pagesDir, "api");
  const stylesDir = path.join(projectPath, "styles");

  fs.ensureDirSync(pagesDir);
  fs.ensureDirSync(apiDir);
  fs.ensureDirSync(stylesDir);

  const ext = userChoices.typescript ? "tsx" : "jsx";

  createAppFile(pagesDir, userChoices, ext);

  if (userChoices.styling === "styled-components") {
    createDocumentFile(pagesDir, ext);
  }

  const indexContent = getPageContent(userChoices, ext);
  fs.writeFileSync(path.join(pagesDir, `index.${ext}`), indexContent);

  if (userChoices.styling === "tailwind") {
    setupStyling(projectPath, userChoices, "nextjs");
  }

  createApiRoute(apiDir, userChoices);
}

function createAppFile(pagesDir, userChoices, ext) {
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
}

function createDocumentFile(pagesDir, ext) {
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

function createApiRoute(apiDir, userChoices) {
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

function getPageContent(userChoices, fileExt) {
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
