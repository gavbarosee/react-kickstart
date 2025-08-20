/**
 * Provides component templates for different styling approaches
 *
 * This module centralizes all the component templates for different styling methods
 * to avoid duplication across generator implementations.
 */

import { createFileTemplateEngine } from "../templates/index.js";

/**
 * Creates a React component using styled-components
 *
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {string} framework - Framework name (vite, nextjs)
 * @param {boolean} isNextAppRouter - Whether this is a Next.js app router component
 * @returns {string} Component code
 */
export function getStyledComponentsApp(
  fileExt,
  framework = "vite",
  isNextAppRouter = false
) {
  const useClientDirective = isNextAppRouter ? "'use client';\n\n" : "";

  let imports = "";

  if (framework === "vite") {
    imports = `import { useState } from 'react';\nimport styled from 'styled-components';\n\n`;
  } else {
    imports = `${useClientDirective}import React from 'react';\nimport styled from 'styled-components';\n\n`;
  }

  if (framework === "vite") {
    return `${imports}const Container = styled.div\`
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    \`
    
    const Header = styled.h1\`
      font-size: 2.5rem;
      margin-bottom: 1rem;
    \`
    
    const Button = styled.button\`
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
      
      &:hover {
        border-color: #646cff;
      }
    \`
    
    function App() {
      const [count, setCount] = useState(0);
    
      return (
        <Container>
          <Header>React Kickstart</Header>
          <p>Edit <code>src/App.${fileExt}</code> and save to test HMR</p>
          <div>
            <Button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </Button>
          </div>
        </Container>
      );
    }
    
    export default App;
    `;
  } else if (framework === "nextjs" && isNextAppRouter) {
    return `${imports}const Container = styled.div\`
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
  } else {
    return `${imports}const Container = styled.div\`
      max-width: 1200px;
      margin: 0 auto;
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
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      
      &:hover {
        background-color: #0051a2;
      }
    \`;
    
    function App() {
      return (
        <Container>
          <Title>Welcome to React Kickstart</Title>
          <p>Edit <code>src/App.${fileExt}</code> to get started</p>
          <Button>Get Started</Button>
        </Container>
      );
    }
    
    export default App;
    `;
  }
}

/**
 * Creates a React component using Tailwind CSS
 *
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {string} framework - Framework name (vite, nextjs)
 * @param {boolean} isNextAppRouter - Whether this is a Next.js app router component
 * @returns {string} Component code
 */
export function getTailwindApp(
  fileExt,
  framework = "vite",
  isNextAppRouter = false
) {
  if (framework === "vite") {
    return `import { useState } from 'react';
    
    function App() {
      const [count, setCount] = useState(0);
    
      return (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">React Kickstart</h1>
          <p className="mb-4">Edit <code className="bg-gray-100 p-1 rounded">src/App.${fileExt}</code> and save to test HMR</p>
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setCount((count) => count + 1)}
            >
              count is {count}
            </button>
          </div>
        </div>
      );
    }
    
    export default App;
    `;
  } else if (framework === "nextjs" && isNextAppRouter) {
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
    // Default for other frameworks (Parcel, Next.js pages)
    return `import React from 'react';
    
    function App() {
      return (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to React Kickstart</h1>
          <p className="mb-4">Edit <code className="bg-gray-100 p-1 rounded">src/App.${fileExt}</code> to get started</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Get Started
          </button>
        </div>
      );
    }
    
    export default App;
    `;
  }
}

/**
 * Creates a React component using plain CSS
 *
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {string} framework - Framework name (vite, nextjs)
 * @param {boolean} isNextAppRouter - Whether this is a Next.js app router component
 * @returns {string} Component code
 */
export function getBasicCssApp(
  fileExt,
  framework = "vite",
  isNextAppRouter = false
) {
  if (framework === "vite") {
    return `import { useState } from 'react';
    import './App.css';
    
    function App() {
      const [count, setCount] = useState(0);
    
      return (
        <>
          <h1>React Kickstart</h1>
          <p>Edit <code>src/App.${fileExt}</code> and save to test HMR</p>
          <div>
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
          </div>
        </>
      )
    }
    
    export default App;
    `;
  } else if (framework === "nextjs" && isNextAppRouter) {
    return `export default function Home() {
      return (
        <main className="container">
          <h1>Welcome to Next.js</h1>
          <p>Edit <code>app/page.${fileExt}</code> to get started</p>
          <div>
            <button>Get Started</button>
          </div>
        </main>
      );
    }
    `;
  } else {
    // Default for other frameworks (Parcel, Next.js pages)
    return `import React from 'react';
    import './App.css';
    
    function App() {
      return (
        <div className="container">
          <h1>Welcome to React Kickstart</h1>
          <p>Edit <code>src/App.${fileExt}</code> to get started</p>
          <button>Get Started</button>
        </div>
      );
    }
    
    export default App;
    `;
  }
}

/**
 * Creates an entry point file (main.jsx/tsx or index.jsx/tsx)
 *
 * @param {string} fileExt - File extension (jsx or tsx)
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - Framework name (vite, nextjs)
 * @returns {string} Entry point file code
 */
export function createEntryPointContent(
  fileExt,
  userChoices,
  framework = "vite"
) {
  const hasCss =
    userChoices.styling === "tailwind" || userChoices.styling === "css";

  if (framework === "vite") {
    return `import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App.${fileExt}';
    ${hasCss ? `import './index.css';` : ""}
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    `;
  } else {
    // Default for others
    return `import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    ${hasCss ? `import './index.css';` : ""}
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    `;
  }
}
