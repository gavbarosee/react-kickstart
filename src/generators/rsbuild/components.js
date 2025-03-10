import fs from "fs-extra";
import path from "path";

export function createSourceFiles(projectPath, userChoices) {
  const srcDir = path.join(projectPath, "src");
  const fileExt = userChoices.typescript ? "tsx" : "jsx";
  // entry point file
  createIndexFile(srcDir, fileExt, userChoices);
  createAppComponent(srcDir, fileExt, userChoices);
}

export function createIndexFile(srcDir, fileExt, userChoices) {
  const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${
  userChoices.styling === "tailwind" || userChoices.styling === "css"
    ? "import './index.css';"
    : ""
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  fs.writeFileSync(path.join(srcDir, `index.${fileExt}`), indexContent);
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
  return `import React from 'react';
import styled from 'styled-components';

const Container = styled.div\`
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

export function getTailwindApp(fileExt) {
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

export function getBasicCssApp(fileExt) {
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
