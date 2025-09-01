import fs from "fs-extra";
import path from "path";

import { CORE_UTILS } from "../../utils/index.js";

/**
 * Abstract base class for state management setup
 * Eliminates duplication between Redux and Zustand implementations
 */
export class BaseStateSetup {
  constructor(framework, stateManager) {
    this.framework = framework; // 'standard' or 'nextjs'
    this.stateManager = stateManager; // 'redux' or 'zustand'
  }

  /**
   * Main setup method - Template Method pattern
   */
  setup(projectPath, userChoices) {
    if (userChoices.stateManagement !== this.stateManager) return;

    // Step 1: Create directory structure
    const directories = this.createDirectoryStructure(projectPath, userChoices);

    // Step 2: Create store files
    this.createStoreFiles(directories, userChoices);

    // Step 3: Create components
    this.createComponents(directories, userChoices);

    // Step 4: Update entry points/layouts
    this.updateEntryPoints(projectPath, directories, userChoices);

    // Step 5: Framework-specific post-setup
    this.performFrameworkSpecificSetup(projectPath, directories, userChoices);
  }

  /**
   * Step 1: Create common directory structure
   */
  createDirectoryStructure(projectPath, userChoices) {
    const directories = this.getDirectoryPaths(projectPath, userChoices);
    return CORE_UTILS.createProjectDirectories(projectPath, directories);
  }

  /**
   * Get directory paths based on framework
   */
  getDirectoryPaths(projectPath, userChoices) {
    if (this.framework === "nextjs") {
      return {
        store: "lib",
        components: "components",
        features: "lib/features",
        counter: "lib/features/counter",
      };
    } else {
      // Standard frameworks (Vite, etc.)
      return {
        src: "src",
        store: "src/store",
        components: "src/components",
      };
    }
  }

  /**
   * Utility: Get file extensions based on user choices
   */
  getExtensions(userChoices) {
    return CORE_UTILS.getExtensions(userChoices);
  }

  /**
   * Utility: Get styling classes for components
   */
  getStylingClasses(userChoices) {
    if (userChoices.styling === "styled-components") {
      return {
        container: "",
        title: "",
        buttonRow: "",
        count: "",
        button: (_color) => "",
        fullButton: "",
      };
    } else if (userChoices.styling !== "tailwind") {
      return {
        container: "",
        title: "",
        buttonRow: "",
        count: "",
        button: (color) =>
          `style={{ padding: '8px 16px', backgroundColor: '${this.getButtonColor(
            color,
          )}', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}`,
        fullButton: `style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}`,
      };
    }

    return {
      container: ' className="p-4 border rounded shadow-sm my-4 max-w-sm mx-auto"',
      title: ' className="text-xl font-bold mb-4"',
      buttonRow: ' className="flex items-center justify-center space-x-4 mb-4"',
      count: ' className="text-2xl font-bold"',
      button: (color) =>
        `className="px-4 py-2 ${this.getTailwindButtonColor(
          color,
        )} text-white rounded"`,
      fullButton: 'className="px-4 py-2 bg-green-500 text-white rounded w-full"',
    };
  }

  getButtonColor(color) {
    const colors = {
      red: "#f44336",
      blue: "#2196f3",
      green: "#4caf50",
    };
    return colors[color] || colors.blue;
  }

  getTailwindButtonColor(color) {
    const colors = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
    };
    return colors[color] || colors.blue;
  }

  /**
   * Generate counter component content (common across all state managers)
   */
  generateCounterComponent(userChoices, imports, storeLogic, title) {
    const extensions = this.getExtensions(userChoices);
    const styles = this.getStylingClasses(userChoices);
    const useClientDirective = this.framework === "nextjs" ? "'use client';\n\n" : "";
    const reactImport = userChoices.typescript ? "import React from 'react';\n" : "";

    if (userChoices.styling === "styled-components") {
      return `${useClientDirective}${reactImport}${imports}
import styled from 'styled-components';

const CounterContainer = styled.div\`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin: 1rem auto;
  max-width: 20rem;
  text-align: center;
\`;

const CounterTitle = styled.h2\`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 0;
\`;

const ButtonRow = styled.div\`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
\`;

const CountDisplay = styled.span\`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  min-width: 80px;
  text-align: center;
\`;

const CounterButton = styled.button\`
  background-color: #2563eb;
  color: white;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    background-color: #1d4ed8;
  }
\`;

export function Counter() {
${storeLogic}

  return (
    <CounterContainer>
      <CounterTitle>${title}</CounterTitle>
      <ButtonRow>
        <CounterButton onClick={${this.getDecrementHandler()}}>
          -
        </CounterButton>
        <CountDisplay>count is {${this.getCountValue()}}</CountDisplay>
        <CounterButton onClick={${this.getIncrementHandler()}}>
          +
        </CounterButton>
      </ButtonRow>
    </CounterContainer>
  );
}
`;
    }

    return `${useClientDirective}${reactImport}${imports}
  
export function Counter() {
${storeLogic}

  return (
    <div${styles.container}>
      <h2${styles.title}>${title}</h2>
      <div${styles.buttonRow}>
        <button
          ${styles.button("blue")}
          onClick={${this.getDecrementHandler()}}
        >
          -
        </button>
        <span${styles.count}>count is {${this.getCountValue()}}</span>
        <button
          ${styles.button("blue")}
          onClick={${this.getIncrementHandler()}}
        >
          +
        </button>
      </div>
    </div>
  );
}
`;
  }

  // Abstract methods that must be implemented by subclasses
  createStoreFiles(directories, userChoices) {
    throw new Error("createStoreFiles must be implemented by subclass");
  }

  createComponents(directories, userChoices) {
    throw new Error("createComponents must be implemented by subclass");
  }

  updateEntryPoints(projectPath, directories, userChoices) {
    throw new Error("updateEntryPoints must be implemented by subclass");
  }

  performFrameworkSpecificSetup(projectPath, directories, userChoices) {
    // Optional override for framework-specific logic
  }

  // Abstract methods for counter component generation
  getDecrementHandler() {
    throw new Error("getDecrementHandler must be implemented by subclass");
  }

  getIncrementHandler() {
    throw new Error("getIncrementHandler must be implemented by subclass");
  }

  getIncrementByAmountHandler() {
    throw new Error("getIncrementByAmountHandler must be implemented by subclass");
  }

  getCountValue() {
    throw new Error("getCountValue must be implemented by subclass");
  }
}
