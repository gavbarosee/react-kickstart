import fs from "fs-extra";
import path from "path";

/**
 * Creates a replacement App component that includes the Counter
 * @param {string} projectPath - Project root path
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function createAppWithCounter(projectPath, userChoices) {
  if (userChoices.stateManagement !== "mobx") return;

  const srcDir = path.join(projectPath, "src");
  const ext = userChoices.typescript ? "tsx" : "jsx";
  const appFile = path.join(srcDir, `App.${ext}`);

  if (!fs.existsSync(appFile)) return;

  // generate a new App component with Counter properly integrated
  let content;

  if (userChoices.styling === "tailwind") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import { Counter } from './components/Counter';

function App() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">React Kickstart</h1>
      <p className="mb-4">Edit <code className="bg-gray-100 p-1 rounded">src/App.${ext}</code> and save to test HMR</p>
      
      {/* MobX Counter */}
      <Counter />
    </div>
  );
}

export default App;
`;
  } else if (userChoices.styling === "styled-components") {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import styled from 'styled-components';
import { Counter } from './components/Counter';

const Container = styled.div\`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
\`;

const Header = styled.h1\`
  font-size: 2.5rem;
  margin-bottom: 1rem;
\`;

function App() {
  return (
    <Container>
      <Header>React Kickstart</Header>
      <p>Edit <code>src/App.${ext}</code> and save to test HMR</p>
      
      {/* MobX Counter */}
      <Counter />
    </Container>
  );
}

export default App;
`;
  } else {
    content = `${
      userChoices.typescript ? "import React from 'react';\n" : ""
    }import './App.css';
import { Counter } from './components/Counter';

function App() {
  return (
    <div className="container">
      <h1>React Kickstart</h1>
      <p>Edit <code>src/App.${ext}</code> and save to test HMR</p>
      
      {/* MobX Counter */}
      <Counter />
    </div>
  );
}

export default App;
`;
  }

  // backup the original file
  fs.copyFileSync(appFile, `${appFile}.bak`);

  // write the new App file
  fs.writeFileSync(appFile, content);
}
