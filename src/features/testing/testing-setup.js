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
    const exampleTest = this.generateExampleComponentTest(
      testFrameworkImport,
      fileExt,
      isTypeScript,
    );

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
  generateExampleComponentTest(testFrameworkImport, fileExt, isTypeScript) {
    const isNextJs = this.userChoices.framework === "nextjs";
    const isNextJsPagesRouter = isNextJs && this.userChoices.nextRouting === "pages";
    const isNextJsAppRouter = isNextJs && this.userChoices.nextRouting === "app";

    let appImportPath, componentName;
    if (isNextJsPagesRouter) {
      appImportPath = "../../pages/_app";
      componentName = "MyApp";
    } else if (isNextJsAppRouter) {
      appImportPath = "../../app/page";
      componentName = "Page";
    } else {
      appImportPath = "../App";
      componentName = "App";
    }
    const hasStateManagement =
      this.userChoices.stateManagement && this.userChoices.stateManagement !== "none";
    const stateManagement = this.userChoices.stateManagement;
    const hasRouting = this.userChoices.routing && this.userChoices.routing !== "none";
    const isViteWithRouting = this.userChoices.framework === "vite" && hasRouting;

    return `import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from '${testFrameworkImport}';
import userEvent from '@testing-library/user-event';
${
  isNextJsPagesRouter
    ? `${isTypeScript ? "import { AppProps } from 'next/app';\n" : ""}import MyApp from '${appImportPath}';

// Mock a simple component for testing
const MockComponent = () => <div>Test Component</div>;

${
  isTypeScript
    ? `const mockAppProps: AppProps = {\n  Component: MockComponent,\n  pageProps: {},\n};`
    : `const mockAppProps = {\n  Component: MockComponent,\n  pageProps: {},\n};`
}`
    : `import ${componentName} from '${appImportPath}';${
        hasStateManagement
          ? `
${
  stateManagement === "redux"
    ? `import { Provider } from 'react-redux';\n${isNextJs ? "import { makeStore } from '../../lib/store';" : "import { store } from '../store/store';"}`
    : ""
}${stateManagement === "zustand" ? "\n// Zustand store is automatically available" : ""}

// Test wrapper for state management
const TestWrapper = ({ children }) => {
  ${
    stateManagement === "redux"
      ? `${isNextJs ? "const store = makeStore();" : ""}\n  return <Provider store={store}>{children}</Provider>;`
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
      isNextJsPagesRouter
        ? `render(<MyApp {...mockAppProps} />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();`
        : isNextJsAppRouter
          ? `${hasStateManagement && stateManagement === "redux" ? "renderWithProvider" : "render"}(<${componentName} />);
    expect(screen.getByText(/welcome to next\.js/i)).toBeInTheDocument();`
          : hasStateManagement && stateManagement === "redux"
            ? `renderWithProvider(<${componentName} />);
    expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();`
            : isViteWithRouting
              ? `render(<${componentName} />);
    expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();`
              : `render(<${componentName} />);
    expect(screen.getByText(/react kickstart/i)).toBeInTheDocument();`
    }
  });

  ${
    !isNextJsPagesRouter
      ? `it('renders main content', () => {
    ${
      hasStateManagement && stateManagement === "redux"
        ? `renderWithProvider(<${componentName} />);`
        : `render(<${componentName} />);`
    }
    
    // Check for the main heading
    ${
      isNextJsAppRouter
        ? `expect(screen.getByText(/welcome to next\.js/i)).toBeInTheDocument();`
        : isViteWithRouting
          ? `expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();`
          : `expect(screen.getByText(/react kickstart/i)).toBeInTheDocument();`
    }${
      hasStateManagement
        ? `
    
    // Check for state management components
    ${
      stateManagement === "redux" || stateManagement === "zustand"
        ? `// Counter component should be present
    expect(screen.getByText(/count is/i)).toBeInTheDocument();`
        : ""
    }`
        : ""
    }
  });

  ${
    hasStateManagement &&
    (stateManagement === "redux" || stateManagement === "zustand") &&
    !isNextJsPagesRouter
      ? `it('handles counter interactions', async () => {
    const user = userEvent.setup();
    ${
      stateManagement === "redux"
        ? `renderWithProvider(<${componentName} />);`
        : `render(<${componentName} />);`
    }
    
    // Find the increment button (+ button)
    const incrementButton = screen.getByRole('button', { name: '+' });
    
    // Click the increment button and verify counter updates
    await act(async () => {
      await user.click(incrementButton);
    });
    
    // Verify the counter text is updated (should show count is 1)
    expect(screen.getByText(/count is 1/i)).toBeInTheDocument();
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
