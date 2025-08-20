import { BaseContentGenerator } from "./base-content-generator.js";

/**
 * Content generator for Vite framework
 */
export class ViteContentGenerator extends BaseContentGenerator {
  constructor() {
    super("vite");
  }

  generateImports(stylingType, userChoices) {
    const baseImports = "import { useState } from 'react';\n";

    const stylingImports = {
      "styled-components": "import styled from 'styled-components';\n",
      css: "import './App.css';\n",
      tailwind: "",
    };

    return baseImports + (stylingImports[stylingType] || "");
  }

  generateStyles(stylingType, userChoices) {
    if (stylingType !== "styled-components") return "\n";

    return `
const Container = styled.div\`
  ${this.getContainerStyles("styled-components")}
\`;

const Header = styled.h1\`
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
      return `function App() {
  const [count, setCount] = useState(0);

  return (
    <Container>
      <Header>${title}</Header>
      <p>${editInstructions}</p>
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
    } else if (stylingType === "tailwind") {
      return `function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="${this.getContainerStyles("tailwind")}">
      <h1 className="${this.getTitleStyles("tailwind")}">${title}</h1>
      <p className="mb-4">${editInstructions}</p>
      <div>
        <button
          className="${this.getButtonStyles("tailwind")}"
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
    } else {
      // CSS
      return `function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>${title}</h1>
      <p>${editInstructions}</p>
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
  }

  generateEntryImports(fileExt, userChoices) {
    const hasCss =
      userChoices.styling === "tailwind" || userChoices.styling === "css";

    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.${fileExt}';${hasCss ? `\nimport './index.css';` : ""}`;
  }

  generateRenderLogic(userChoices) {
    return `
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
  }
}
