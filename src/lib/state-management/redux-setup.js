import fs from "fs-extra";
import path from "path";
import { BaseStateSetup } from "./base-state-setup.js";
import { createAppWithCounter } from "../../features/redux/counter-template.js";
import { createCommonTemplateBuilder } from "../../templates/index.js";
import { CORE_UTILS } from "../../utils/index.js";

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
      this.createCounterSlice(
        directories.counter,
        userChoices,
        extensions,
        true
      );
    } else {
      this.createStandardStoreFile(directories.store, userChoices, extensions);
      this.createStandardHooksFile(directories.store, userChoices, extensions);
      this.createCounterSlice(
        directories.store,
        userChoices,
        extensions,
        false
      );
    }
  }

  createStandardStoreFile(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxStore(userChoices, false);

    fs.writeFileSync(
      path.join(storeDir, `store.${extensions.script}`),
      content
    );
  }

  createNextjsStoreFile(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxStore(userChoices, true);

    fs.writeFileSync(
      path.join(storeDir, `store.${extensions.script}`),
      content
    );
  }

  createStandardHooksFile(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxHooks(userChoices, false);

    fs.writeFileSync(
      path.join(storeDir, `hooks.${extensions.script}`),
      content
    );
  }

  createNextjsHooksFile(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxHooks(userChoices, true);

    fs.writeFileSync(
      path.join(storeDir, `hooks.${extensions.script}`),
      content
    );
  }

  createCounterSlice(sliceDir, userChoices, extensions, isNextjs) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateReduxSlice(userChoices, isNextjs);

    fs.writeFileSync(
      path.join(sliceDir, `counterSlice.${extensions.script}`),
      content
    );
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
      "Redux Toolkit Counter"
    );

    fs.writeFileSync(
      path.join(directories.components, `Counter.${extensions.component}`),
      counterContent
    );

    // Create App with Counter
    // Fix: Use the project root, not the parent of the store directory
    const projectRoot = path.dirname(path.dirname(directories.store)); // Go up two levels from src/store to project root
    createAppWithCounter(projectRoot, userChoices);
  }

  getReduxImports() {
    if (this.framework === "nextjs") {
      return "import { useAppSelector, useAppDispatch } from '../lib/hooks';\nimport { decrement, increment, incrementByAmount } from '../lib/features/counter/counterSlice';";
    } else {
      return "import { useAppSelector, useAppDispatch } from '../store/hooks';\nimport { decrement, increment, incrementByAmount } from '../store/counterSlice';";
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
    if (this.framework === "nextjs") {
      this.createStoreProvider(projectPath, userChoices);
      this.updateNextjsLayout(projectPath, userChoices);
    } else {
      this.updateStandardEntryPoint(directories.src, userChoices);
    }
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
        `import React from 'react';\nimport { Provider } from 'react-redux';\nimport { store } from './store/store';`
      );

      content = content.replace(
        /<React.StrictMode>/,
        `<React.StrictMode>\n    <Provider store={store}>`
      );

      content = content.replace(
        /<\/React.StrictMode>/,
        `    </Provider>\n  </React.StrictMode>`
      );
    } else {
      // Older React versions
      content = content.replace(
        /import React from ['"]react['"];/,
        `import React from 'react';\nimport { Provider } from 'react-redux';\nimport { store } from './store/store';`
      );

      content = content.replace(
        /<App \/>/,
        `<Provider store={store}>\n      <App />\n    </Provider>`
      );
    }

    fs.writeFileSync(entryFile, content);
  }

  createStoreProvider(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const appDir = path.join(
      projectPath,
      userChoices.nextRouting === "app" ? "app" : "pages"
    );

    const content = `'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, ${
      userChoices.typescript ? "AppStore" : ""
    } } from '../lib/store';

export default function StoreProvider({
  children
}${userChoices.typescript ? ": {\n  children: React.ReactNode\n}" : ""}) {
  const storeRef = useRef${
    userChoices.typescript ? "<AppStore | null>" : ""
  }(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
`;

    fs.writeFileSync(
      path.join(appDir, `StoreProvider.${extensions.component}`),
      content
    );
  }

  updateNextjsLayout(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    let layoutPath;

    if (userChoices.nextRouting === "app") {
      layoutPath = path.join(
        projectPath,
        "app",
        `layout.${extensions.component}`
      );
    } else {
      layoutPath = path.join(
        projectPath,
        "pages",
        `_app.${extensions.component}`
      );
    }

    if (!fs.existsSync(layoutPath)) return;

    let content = fs.readFileSync(layoutPath, "utf-8");

    if (userChoices.nextRouting === "app") {
      // App Router
      const importLine = "import StoreProvider from './StoreProvider';";

      if (!content.includes(importLine)) {
        if (content.includes("'use client'")) {
          content = content.replace(
            "'use client'",
            "'use client';\n" + importLine
          );
        } else {
          content = importLine + "\n" + content;
        }
      }

      content = content.replace(
        /<body>(.*?){children}<\/body>/s,
        "<body>$1<StoreProvider>{children}</StoreProvider></body>"
      );
    } else {
      // Pages Router
      const importLine =
        "import StoreProvider from '../components/StoreProvider';";
      const componentsDir = CORE_UTILS.createProjectDirectory(
        projectPath,
        "components"
      );

      // Move StoreProvider to components directory
      const providerPath = path.join(
        projectPath,
        "pages",
        `StoreProvider.${extensions.component}`
      );
      if (fs.existsSync(providerPath)) {
        const destPath = path.join(
          componentsDir,
          `StoreProvider.${extensions.component}`
        );
        fs.moveSync(providerPath, destPath, { overwrite: true });
      }

      if (!content.includes(importLine)) {
        content = content.replace(
          /import .* from ['"].*['"];/,
          "$&\n" + importLine
        );
      }

      content = content.replace(
        /<Component {.*?} \/>/,
        "<StoreProvider><Component {...pageProps} /></StoreProvider>"
      );
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
