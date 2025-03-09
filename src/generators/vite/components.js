import fs from "fs-extra";
import path from "path";

export function createSourceFiles(projectPath, userChoices) {
  const srcDir = path.join(projectPath, "src");
  const fileExt = userChoices.typescript ? "tsx" : "jsx";

  // creates entry point file (i.e main.jsx/tsx)
  createMainFile(srcDir, fileExt, userChoices);

  // App.jsx/tsx etc
  createAppComponent(srcDir, fileExt, userChoices);
}

export function createMainFile(srcDir, fileExt, userChoices) {
  const mainContent = `import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.${fileExt}';
  ${userChoices.styling === "tailwind" ? "import './index.css';" : ""}
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  `;
  fs.writeFileSync(path.join(srcDir, `main.${fileExt}`), mainContent);
}

export function createAppComponent(srcDir, fileExt, userChoices) {
  let appContent;

  if (userChoices.styling === "styled-components") {
    appContent = getStyledComponentsApp(fileExt);
  } else if (userChoices.styling === "tailwind") {
    appContent = getTailwindApp(fileExt);
  } else {
    appContent = getBasicCssApp(fileExt);
  }

  fs.writeFileSync(path.join(srcDir, `App.${fileExt}`), appContent);
}

export function getStyledComponentsApp(fileExt) {
  return `import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div\`
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
}

export function getTailwindApp(fileExt) {
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
}

export function getBasicCssApp(fileExt) {
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
}
