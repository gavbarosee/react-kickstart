import fs from "fs-extra";
import path from "path";

/**
 * Sets up MobX for Next.js with App Router considerations
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupNextjsMobxStore(projectPath, userChoices) {
  if (userChoices.stateManagement !== "mobx") return;

  const ext = userChoices.typescript ? "ts" : "js";
  const componentExt = userChoices.typescript ? "tsx" : "jsx";

  const libDir = path.join(projectPath, "lib");
  fs.ensureDirSync(libDir);

  createCounterStore(libDir, userChoices);

  createStoreProvider(libDir, projectPath, userChoices);

  createCounterComponent(projectPath, userChoices);

  updateMainPage(projectPath, userChoices);
}

function createCounterStore(libDir, userChoices) {
  const ext = userChoices.typescript ? "ts" : "js";

  let content;

  if (userChoices.typescript) {
    content = `import { makeAutoObservable } from 'mobx';

export class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.count += 1;
  }

  decrement() {
    this.count -= 1;
  }

  incrementByAmount(amount: number) {
    this.count += amount;
  }
}
`;
  } else {
    content = `import { makeAutoObservable } from 'mobx';

export class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.count += 1;
  }

  decrement() {
    this.count -= 1;
  }

  incrementByAmount(amount) {
    this.count += amount;
  }
}
`;
  }

  fs.writeFileSync(path.join(libDir, `counterStore.${ext}`), content);
}

function createStoreProvider(libDir, projectPath, userChoices) {
  const componentExt = userChoices.typescript ? "tsx" : "jsx";

  let content;

  if (userChoices.typescript) {
    content = `'use client';
  
  import React, { createContext, useContext } from 'react';
  import { CounterStore } from './counterStore';
  import { enableStaticRendering } from 'mobx-react-lite';
  
  enableStaticRendering(typeof window === 'undefined');
  
  type StoreContextValue = {
    counterStore: CounterStore;
  };
  
  const StoreContext = createContext<StoreContextValue | null>(null);
  
  export function useMobxStores() {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error('useStores must be used within StoreProvider');
    }
    return context;
  }
  
  export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [stores] = React.useState(() => ({
      counterStore: new CounterStore()
    }));
  
    return (
      <StoreContext.Provider value={stores}>
        {children}
      </StoreContext.Provider>
    );
  }
  `;
  } else {
    content = `'use client';
  
  import React, { createContext, useContext } from 'react';
  import { CounterStore } from './counterStore';
  import { enableStaticRendering } from 'mobx-react-lite';
  

  enableStaticRendering(typeof window === 'undefined');
  

  const StoreContext = createContext(null);
  

  export function useMobxStores() {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error('useStores must be used within StoreProvider');
    }
    return context;
  }
  
  export function StoreProvider({ children }) {

    const [stores] = React.useState(() => ({
      counterStore: new CounterStore()
    }));
  
    return (
      <StoreContext.Provider value={stores}>
        {children}
      </StoreContext.Provider>
    );
  }
  `;
  }

  fs.writeFileSync(path.join(libDir, `storeProvider.${componentExt}`), content);

  if (userChoices.nextRouting === "app") {
    updateLayoutWithProvider(projectPath, userChoices);
  } else {
    updateAppWithProvider(projectPath, userChoices);
  }
}

function updateLayoutWithProvider(projectPath, userChoices) {
  const componentExt = userChoices.typescript ? "tsx" : "jsx";
  const layoutPath = path.join(projectPath, "app", `layout.${componentExt}`);

  if (!fs.existsSync(layoutPath)) return;

  let content = fs.readFileSync(layoutPath, "utf-8");

  const clientLayoutPath = path.join(
    projectPath,
    "app",
    `ClientLayout.${componentExt}`
  );
  const clientLayoutContent = userChoices.typescript
    ? `'use client';
  
  import React from 'react';
  import { StoreProvider } from '../lib/storeProvider';
  
  export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return <StoreProvider>{children}</StoreProvider>;
  }
  `
    : `'use client';
  
  import React from 'react';
  import { StoreProvider } from '../lib/storeProvider';
  
  export default function ClientLayout({ children }) {
    return <StoreProvider>{children}</StoreProvider>;
  }
  `;

  fs.writeFileSync(clientLayoutPath, clientLayoutContent);

  const newLayoutContent = userChoices.typescript
    ? `import ClientLayout from './ClientLayout';
  import './globals.css';
  
  export const metadata = {
    title: '${path.basename(projectPath)}',
    description: 'Created with React Kickstart',
  };
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body><ClientLayout>{children}</ClientLayout></body>
      </html>
    );
  }
  `
    : `import ClientLayout from './ClientLayout';
  import './globals.css';
  
  export const metadata = {
    title: '${path.basename(projectPath)}',
    description: 'Created with React Kickstart',
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body><ClientLayout>{children}</ClientLayout></body>
      </html>
    );
  }
  `;

  fs.writeFileSync(layoutPath, newLayoutContent);
}

function updateAppWithProvider(projectPath, userChoices) {
  const componentExt = userChoices.typescript ? "tsx" : "jsx";
  const appPath = path.join(projectPath, "pages", `_app.${componentExt}`);

  if (!fs.existsSync(appPath)) return;

  let content = fs.readFileSync(appPath, "utf-8");

  // Add import for StoreProvider
  if (!content.includes("import { StoreProvider }")) {
    if (content.includes("import")) {
      // Add after existing imports
      content = content.replace(
        /import [^;]*;(?![^]*?import)/,
        "$&\nimport { StoreProvider } from '../lib/storeProvider';"
      );
    } else {
      // Add at the beginning
      content =
        "import { StoreProvider } from '../lib/storeProvider';\n" + content;
    }
  }

  // Wrap Component with StoreProvider
  if (!content.includes("<StoreProvider>")) {
    content = content.replace(
      /<Component\s+{[\s\S]*?}.*?\/>/,
      "<StoreProvider><Component {...pageProps} /></StoreProvider>"
    );
  }

  fs.writeFileSync(appPath, content);
}

function createCounterComponent(projectPath, userChoices) {
  const ext = userChoices.typescript ? "tsx" : "jsx";
  const componentsDir = path.join(projectPath, "components");
  fs.ensureDirSync(componentsDir);

  const content = `'use client';
  
  ${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { observer } from 'mobx-react-lite';
  import { useMobxStores } from '../lib/storeProvider';
    
  export const Counter = observer(() => {
    const { counterStore } = useMobxStores();
  
    return (
      <div${
        userChoices.styling === "tailwind"
          ? ' className="p-4 border rounded shadow-sm my-4 max-w-sm mx-auto"'
          : ""
      }>
        <h2${
          userChoices.styling === "tailwind"
            ? ' className="text-xl font-bold mb-4"'
            : ""
        }>MobX Counter</h2>
        <div${
          userChoices.styling === "tailwind"
            ? ' className="flex items-center justify-center space-x-4 mb-4"'
            : ""
        }>
          <button
            ${
              userChoices.styling === "tailwind"
                ? 'className="px-4 py-2 bg-red-500 text-white rounded"'
                : "style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}"
            }
            onClick={() => counterStore.decrement()}
          >
            -
          </button>
          <span${
            userChoices.styling === "tailwind"
              ? ' className="text-2xl font-bold"'
              : ""
          }>{counterStore.count}</span>
          <button
            ${
              userChoices.styling === "tailwind"
                ? 'className="px-4 py-2 bg-blue-500 text-white rounded"'
                : "style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}"
            }
            onClick={() => counterStore.increment()}
          >
            +
          </button>
        </div>
        <button
          ${
            userChoices.styling === "tailwind"
              ? 'className="px-4 py-2 bg-green-500 text-white rounded w-full"'
              : "style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}"
          }
          onClick={() => counterStore.incrementByAmount(5)}
        >
          Add 5
        </button>
      </div>
    );
  });`;

  fs.writeFileSync(path.join(componentsDir, `Counter.${ext}`), content);
}

function updateMainPage(projectPath, userChoices) {
  const ext = userChoices.typescript ? "tsx" : "jsx";
  let pagePath;

  if (userChoices.nextRouting === "app") {
    pagePath = path.join(projectPath, "app", `page.${ext}`);
  } else {
    pagePath = path.join(projectPath, "pages", `index.${ext}`);
  }

  if (!fs.existsSync(pagePath)) return;

  let content = fs.readFileSync(pagePath, "utf-8");
  let updatedContent;

  // add 'use client' directive if it's not already there (for app router)
  if (userChoices.nextRouting === "app" && !content.includes("'use client'")) {
    content = "'use client';\n\n" + content;
  }

  // check if we need to add the Counter import
  if (!content.includes("import { Counter }")) {
    const importStatement =
      "import { Counter } from '../components/Counter';\n";

    // find the right place to add the import
    if (content.includes("import")) {
      const lastImportIndex = content.lastIndexOf("import");
      const endOfImportIndex = content.indexOf("\n", lastImportIndex) + 1;
      updatedContent =
        content.slice(0, endOfImportIndex) +
        importStatement +
        content.slice(endOfImportIndex);
    } else {
      // if no imports, add at the beginning (after 'use client' if present)
      updatedContent = content.startsWith("'use client'")
        ? content.replace(
            "'use client';\n\n",
            "'use client';\n\n" + importStatement
          )
        : importStatement + content;
    }
  } else {
    updatedContent = content;
  }

  // add the Counter component to the JSX if not already there
  if (!updatedContent.includes("<Counter")) {
    if (userChoices.nextRouting === "app") {
      // for app router, find the main JSX return and add the Counter
      updatedContent = updatedContent.replace(
        /(<main.*?>)([\s\S]*?)(<\/main>)/,
        "$1$2<Counter />\n$3"
      );
    } else {
      // for pages router, find the main div or container and add the Counter
      if (updatedContent.includes("<main")) {
        updatedContent = updatedContent.replace(
          /(<main.*?>)([\s\S]*?)(<\/main>)/,
          "$1$2<Counter />\n$3"
        );
      } else {
        // if no main tag, look for a div
        updatedContent = updatedContent.replace(
          /(<div.*?>)([\s\S]*?)(<\/div>)/,
          "$1$2<Counter />\n$3"
        );
      }
    }
  }

  fs.writeFileSync(pagePath, updatedContent);
}
