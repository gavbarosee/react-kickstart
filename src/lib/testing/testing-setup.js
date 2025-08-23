import fs from "fs-extra";
import path from "path";

/**
 * Generate example test files for the testing framework
 */
export class TestingSetup {
  constructor(projectPath, userChoices) {
    this.projectPath = projectPath;
    this.userChoices = userChoices;
  }

  /**
   * Generate example test files based on framework and language
   */
  async generateExampleTests() {
    if (!this.userChoices.testing || this.userChoices.testing === "none") {
      return;
    }

    const isTypeScript = this.userChoices.typescript;
    const fileExt = isTypeScript ? "tsx" : "jsx";
    const testExt = isTypeScript ? "ts" : "js";

    // Determine the test import based on testing framework
    const testFrameworkImport =
      this.userChoices.testing === "vitest" ? "vitest" : "@jest/globals";

    // Create example component test
    const exampleTest = this.generateExampleComponentTest(testFrameworkImport, fileExt);

    // Write the test file
    const testDir = path.join(this.projectPath, "src", "__tests__");
    await fs.ensureDir(testDir);

    const testFilePath = path.join(testDir, `App.test.${testExt}x`);
    await fs.writeFile(testFilePath, exampleTest);

    // Create utility test helper if using TypeScript
    if (isTypeScript) {
      const testUtilsContent = this.generateTestUtils();
      const utilsPath = path.join(
        this.projectPath,
        "src",
        "test",
        `test-utils.${testExt}`,
      );
      await fs.writeFile(utilsPath, testUtilsContent);
    }
  }

  /**
   * Generate example component test content
   */
  generateExampleComponentTest(testFrameworkImport, fileExt) {
    const isNextJs = this.userChoices.framework === "nextjs";
    const appImportPath = isNextJs ? "../pages/_app" : "../App";
    const componentName = isNextJs ? "MyApp" : "App";
    const hasStateManagement =
      this.userChoices.stateManagement && this.userChoices.stateManagement !== "none";
    const stateManagement = this.userChoices.stateManagement;
    const hasRouting = this.userChoices.routing && this.userChoices.routing !== "none";
    const isViteWithRouting = this.userChoices.framework === "vite" && hasRouting;

    return `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '${testFrameworkImport}';
import userEvent from '@testing-library/user-event';
${
  isNextJs
    ? `import { AppProps } from 'next/app';
import MyApp from '${appImportPath}';

// Mock a simple component for testing
const MockComponent = () => <div>Test Component</div>;

const mockAppProps: AppProps = {
  Component: MockComponent,
  pageProps: {},
};`
    : `import ${componentName} from '${appImportPath}';${
        hasStateManagement
          ? `
${
  stateManagement === "redux"
    ? "import { Provider } from 'react-redux';\nimport { store } from '../store/store';"
    : ""
}${stateManagement === "zustand" ? "\n// Zustand store is automatically available" : ""}

// Test wrapper for state management
const TestWrapper = ({ children }) => {
  ${
    stateManagement === "redux"
      ? "return <Provider store={store}>{children}</Provider>;"
      : "return <>{children}</>;"
  }
};`
          : ""
      }`
}

describe('${componentName}', () => {
  ${
    hasStateManagement && stateManagement === "redux"
      ? `const renderWithProvider = (component) => {
    return render(<TestWrapper>{component}</TestWrapper>);
  };`
      : ""
  }

  it('renders without crashing', () => {
    ${
      isNextJs
        ? `render(<MyApp {...mockAppProps} />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();`
        : hasStateManagement && stateManagement === "redux"
          ? `renderWithProvider(<${componentName} />);
    expect(screen.getByText(/react kickstart/i)).toBeInTheDocument();`
          : `render(<${componentName} />);
    expect(screen.getByText(/react kickstart/i)).toBeInTheDocument();`
    }
  });

  ${
    !isNextJs
      ? `it('renders main content', () => {
    ${
      hasStateManagement && stateManagement === "redux"
        ? `renderWithProvider(<${componentName} />);`
        : `render(<${componentName} />);`
    }
    
    // Check for the main heading
    expect(screen.getByText(/react kickstart/i)).toBeInTheDocument();${
      hasStateManagement
        ? `
    
    // Check for state management components
    ${
      stateManagement === "redux" || stateManagement === "zustand"
        ? `// Counter component should be present
    expect(screen.getByText(/count/i)).toBeInTheDocument();`
        : ""
    }`
        : ""
    }
  });

  ${
    hasStateManagement && (stateManagement === "redux" || stateManagement === "zustand")
      ? `it('handles counter interactions', async () => {
    const user = userEvent.setup();
    ${
      stateManagement === "redux"
        ? `renderWithProvider(<${componentName} />);`
        : `render(<${componentName} />);`
    }
    
    // Find and click the increment button
    const incrementButton = screen.getByRole('button', { name: /increment|\\+/i });
    await user.click(incrementButton);
    
    // The counter should update (this test may need adjustment based on actual counter implementation)
    // expect(screen.getByText(/1/)).toBeInTheDocument();
  });`
      : `it('handles basic interactions', async () => {
    const user = userEvent.setup();
    ${
      hasStateManagement && stateManagement === "redux"
        ? `renderWithProvider(<${componentName} />);`
        : `render(<${componentName} />);`
    }
    
    // Example interaction test - adjust based on your app structure
    // const button = screen.getByRole('button');
    // await user.click(button);
    // expect(screen.getByText(/clicked/i)).toBeInTheDocument();
  });`
  }`
      : ""
  }
});`;
  }

  /**
   * Generate test utilities for TypeScript projects
   */
  generateTestUtils() {
    return `import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };`;
  }
}
