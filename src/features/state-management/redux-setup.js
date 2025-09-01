import fs from "fs-extra";
import path from "path";

import { BaseStateSetup } from "./base-state-setup.js";
import { createAppWithCounter } from "../../templates/features/redux-counter-template.js";
import { createCommonTemplateBuilder } from "../../templates/index.js";
import { CORE_UTILS, UI_UTILS } from "../../utils/index.js";

/**
 * Redux Toolkit setup implementation
 */
export class ReduxSetup extends BaseStateSetup {
  constructor(framework) {
    super(framework, "redux");
  }

  /**
   * Create Redux store files
   */
  createStoreFiles(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);

    if (this.framework === "nextjs") {
      this.createNextjsStoreFile(directories.store, userChoices, extensions);
      this.createNextjsHooksFile(directories.store, userChoices, extensions);
      this.createCounterSlice(directories.counter, userChoices, extensions, true);
    } else {
      this.createStandardStoreFile(directories.store, userChoices, extensions);
      this.createStandardHooksFile(directories.store, userChoices, extensions);
      this.createCounterSlice(directories.store, userChoices, extensions, false);
    }
  }

  createStandardStoreFile(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxStore(userChoices, false);

    fs.writeFileSync(path.join(storeDir, `store.${extensions.script}`), content);
  }

  createNextjsStoreFile(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxStore(userChoices, true);

    fs.writeFileSync(path.join(storeDir, `store.${extensions.script}`), content);
  }

  createStandardHooksFile(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxHooks(userChoices, false);

    fs.writeFileSync(path.join(storeDir, `hooks.${extensions.script}`), content);
  }

  createNextjsHooksFile(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxHooks(userChoices, true);

    fs.writeFileSync(path.join(storeDir, `hooks.${extensions.script}`), content);
  }

  createCounterSlice(sliceDir, userChoices, extensions, isNextjs) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxSlice(userChoices, isNextjs);

    fs.writeFileSync(path.join(sliceDir, `counterSlice.${extensions.script}`), content);
  }

  /**
   * Create Redux components
   */
  createComponents(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const imports = this.getReduxImports();
    const storeLogic = this.getReduxStoreLogic();

    const counterContent = this.generateCounterComponent(
      userChoices,
      imports,
      storeLogic,
      "Redux Toolkit Counter",
    );

    fs.writeFileSync(
      path.join(directories.components, `Counter.${extensions.component}`),
      counterContent,
    );

    // Create App with Counter
    // For Next.js, directories.store is "/path/to/project/lib", so we go up one level
    // For other frameworks, directories.store is "/path/to/project/src/store", so we go up two levels
    const projectRoot =
      this.framework === "nextjs"
        ? path.dirname(directories.store) // Go up from "/path/to/project/lib" to "/path/to/project"
        : path.dirname(path.dirname(directories.store)); // Go up two levels from "/path/to/project/src/store" to "/path/to/project"
    createAppWithCounter(projectRoot, userChoices);
  }

  getReduxImports() {
    if (this.framework === "nextjs") {
      return "import { useAppSelector, useAppDispatch } from '../lib/hooks';\nimport { decrement, increment } from '../lib/features/counter/counterSlice';";
    } else {
      return "import { useAppSelector, useAppDispatch } from '../store/hooks';\nimport { decrement, increment } from '../store/counterSlice';";
    }
  }

  getReduxStoreLogic() {
    return `  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();`;
  }

  /**
   * Update entry points for Redux
   */
  updateEntryPoints(projectPath, directories, userChoices) {
    try {
      if (this.framework === "nextjs") {
        this.createStoreProvider(projectPath, userChoices);
        this.updateNextjsLayout(projectPath, userChoices);
        this.validateNextjsReduxSetup(projectPath, userChoices, true); // Silent during progress
      } else {
        this.updateStandardEntryPoint(directories.src, userChoices);
      }
    } catch (error) {
      UI_UTILS.log(
        `Warning: Redux setup encountered an issue: ${error.message}`,
        "warn",
      );
      UI_UTILS.log(
        "You may need to manually configure the Redux Provider in your layout file.",
        "warn",
      );
    }
  }

  /**
   * Validate Next.js Redux setup
   * @param {string} projectPath - Project path
   * @param {object} userChoices - User choices
   * @param {boolean} silent - Whether to suppress console output (default: false)
   */
  validateNextjsReduxSetup(projectPath, userChoices, silent = false) {
    const extensions = this.getExtensions(userChoices);

    // Check if StoreProvider was created
    const storeProviderPath =
      userChoices.nextRouting === "app"
        ? path.join(projectPath, "app", `StoreProvider.${extensions.component}`)
        : path.join(projectPath, "components", `StoreProvider.${extensions.component}`);

    if (!fs.existsSync(storeProviderPath)) {
      if (!silent) {
        UI_UTILS.log(
          "Warning: StoreProvider component was not created successfully",
          "warn",
        );
      }
      return false;
    }

    // Check if layout was updated
    const layoutPath =
      userChoices.nextRouting === "app"
        ? path.join(projectPath, "app", `layout.${extensions.component}`)
        : path.join(projectPath, "pages", `_app.${extensions.component}`);

    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, "utf-8");
      if (!layoutContent.includes("StoreProvider")) {
        if (!silent) {
          UI_UTILS.log(
            "Warning: Layout file was not updated with StoreProvider",
            "warn",
          );
          UI_UTILS.log(
            `Please manually add StoreProvider to your ${userChoices.nextRouting === "app" ? "app/layout" : "pages/_app"} file`,
            "warn",
          );
        }
        return false;
      }
    }

    // Check if store files exist
    const storePath = path.join(projectPath, "lib", `store.${extensions.script}`);
    const hooksPath = path.join(projectPath, "lib", `hooks.${extensions.script}`);
    const slicePath = path.join(
      projectPath,
      "lib",
      "features",
      "counter",
      `counterSlice.${extensions.script}`,
    );

    const missingFiles = [];
    if (!fs.existsSync(storePath)) missingFiles.push("store");
    if (!fs.existsSync(hooksPath)) missingFiles.push("hooks");
    if (!fs.existsSync(slicePath)) missingFiles.push("counterSlice");

    if (missingFiles.length > 0) {
      if (!silent) {
        UI_UTILS.log(
          `Warning: Missing Redux files: ${missingFiles.join(", ")}`,
          "warn",
        );
      }
      return false;
    }

    if (!silent) {
      UI_UTILS.log("Redux setup validation completed successfully", "success");
    }
    return true;
  }

  updateStandardEntryPoint(srcDir, userChoices) {
    const extensions = this.getExtensions(userChoices);
    let entryFile;

    if (userChoices.framework === "vite") {
      entryFile = path.join(srcDir, `main.${extensions.component}`);
    } else {
      entryFile = path.join(srcDir, `index.${extensions.component}`);
    }

    if (!fs.existsSync(entryFile)) return;

    let content = fs.readFileSync(entryFile, "utf-8");

    // Add Redux Provider
    if (content.includes("ReactDOM.createRoot")) {
      // React 18
      content = content.replace(
        /import React from ['"]react['"];/,
        `import React from 'react';\nimport { Provider } from 'react-redux';\nimport { store } from './store/store';`,
      );

      content = content.replace(
        /<React.StrictMode>/,
        `<React.StrictMode>\n    <Provider store={store}>`,
      );

      content = content.replace(
        /<\/React.StrictMode>/,
        `    </Provider>\n  </React.StrictMode>`,
      );
    } else {
      // Older React versions
      content = content.replace(
        /import React from ['"]react['"];/,
        `import React from 'react';\nimport { Provider } from 'react-redux';\nimport { store } from './store/store';`,
      );

      content = content.replace(
        /<App \/>/,
        `<Provider store={store}>\n      <App />\n    </Provider>`,
      );
    }

    fs.writeFileSync(entryFile, content);
  }

  createStoreProvider(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    let targetDir;
    let storeImportPath;

    if (userChoices.nextRouting === "app") {
      targetDir = path.join(projectPath, "app");
      storeImportPath = "../lib/store";
    } else {
      // For Pages Router, create StoreProvider directly in components directory
      targetDir = CORE_UTILS.createProjectDirectory(projectPath, "components");
      storeImportPath = "../lib/store";
    }

    const useClientDirective =
      userChoices.nextRouting === "app" ? "'use client';\n\n" : "";
    const content = `${useClientDirective}import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore${userChoices.typescript ? ", AppStore" : ""} } from '${storeImportPath}';

export default function StoreProvider({
  children
}${userChoices.typescript ? ": {\n  children: React.ReactNode\n}" : ""}) {
  const storeRef = useRef${userChoices.typescript ? "<AppStore | null>" : ""}(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
`;

    fs.writeFileSync(
      path.join(targetDir, `StoreProvider.${extensions.component}`),
      content,
    );
  }

  updateNextjsLayout(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    let layoutPath;

    if (userChoices.nextRouting === "app") {
      layoutPath = path.join(projectPath, "app", `layout.${extensions.component}`);
    } else {
      layoutPath = path.join(projectPath, "pages", `_app.${extensions.component}`);
    }

    if (!fs.existsSync(layoutPath)) return;

    let content = fs.readFileSync(layoutPath, "utf-8");

    if (userChoices.nextRouting === "app") {
      // App Router
      const importLine = "import StoreProvider from './StoreProvider';";

      if (!content.includes(importLine)) {
        if (content.includes("'use client'")) {
          content = content.replace("'use client'", "'use client';\n" + importLine);
        } else {
          content = importLine + "\n" + content;
        }
      }

      // Handle different layout structures, especially with styled-components
      let layoutUpdated = false;

      // Check if StyledComponentsRegistry exists (styled-components setup)
      if (
        content.includes("StyledComponentsRegistry") &&
        !content.includes("<StoreProvider>")
      ) {
        // Wrap StyledComponentsRegistry with StoreProvider
        content = content.replace(
          /<StyledComponentsRegistry>/,
          "<StoreProvider><StyledComponentsRegistry>",
        );
        content = content.replace(
          /<\/StyledComponentsRegistry>/,
          "</StyledComponentsRegistry></StoreProvider>",
        );
        layoutUpdated = true;
      } else if (!content.includes("<StoreProvider>")) {
        // Try multiple patterns for layouts without StyledComponentsRegistry
        const patterns = [
          // Pattern 1: <body>...</body> with children inside
          {
            search: /<body([^>]*)>([\s\S]*?){children}([\s\S]*?)<\/body>/,
            replace: "<body$1>$2<StoreProvider>{children}</StoreProvider>$3</body>",
          },
          // Pattern 2: Just {children} without body wrapper
          {
            search: /(\s*){children}(\s*)/,
            replace: "$1<StoreProvider>{children}</StoreProvider>$2",
          },
        ];

        for (const pattern of patterns) {
          if (pattern.search.test(content)) {
            content = content.replace(pattern.search, pattern.replace);
            layoutUpdated = true;
            break;
          }
        }

        // If no pattern matched, add it manually
        if (!layoutUpdated) {
          // Find {children} and wrap it
          content = content.replace(
            /{children}/g,
            "<StoreProvider>{children}</StoreProvider>",
          );
        }
      }
    } else {
      // Pages Router
      const importLine = "import StoreProvider from '../components/StoreProvider';";

      if (!content.includes("StoreProvider")) {
        // Try to find existing imports first
        const hasImports = /import\s+/m.test(content);

        if (hasImports) {
          // Find all import lines and add after the last one
          const lines = content.split("\n");
          let lastImportIndex = -1;

          for (let i = 0; i < lines.length; i++) {
            if (/^\s*import\s+/.test(lines[i])) {
              lastImportIndex = i;
            }
          }

          if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, importLine);
            content = lines.join("\n");
          } else {
            // Fallback - add at top
            content = importLine + "\n\n" + content;
          }
        } else {
          // No imports exist - add at the very top
          content = importLine + "\n\n" + content;
        }
      }

      // More flexible regex to match the Component rendering
      content = content.replace(
        /<Component\s+{\.\.\.pageProps}\s*\/>/,
        "<StoreProvider><Component {...pageProps} /></StoreProvider>",
      );

      // Fallback: try a more general pattern if the specific one didn't match
      if (!content.includes("<StoreProvider>")) {
        content = content.replace(
          /<Component\s+[^>]*\/>/,
          "<StoreProvider><Component {...pageProps} /></StoreProvider>",
        );
      }
    }

    fs.writeFileSync(layoutPath, content);
  }

  // Counter component handlers for Redux
  getDecrementHandler() {
    return "() => dispatch(decrement())";
  }

  getIncrementHandler() {
    return "() => dispatch(increment())";
  }

  getIncrementByAmountHandler() {
    return "() => dispatch(incrementByAmount(5))";
  }

  getCountValue() {
    return "count";
  }
}
