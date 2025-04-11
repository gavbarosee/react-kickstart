import fs from "fs-extra";
import path from "path";

/**
 * Sets up Zustand for Next.js with App Router considerations
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupNextjsZustandStore(projectPath, userChoices) {
  if (userChoices.stateManagement !== "zustand") return;

  const ext = userChoices.typescript ? "ts" : "js";
  const componentExt = userChoices.typescript ? "tsx" : "jsx";

  // create lib directory for the store
  const libDir = path.join(projectPath, "lib");
  fs.ensureDirSync(libDir);

  createCounterStore(libDir, userChoices);

  createCounterComponent(projectPath, userChoices);

  // update the main page to use the Counter component
  updateMainPage(projectPath, userChoices);
}

function createCounterStore(libDir, userChoices) {
  const ext = userChoices.typescript ? "ts" : "js";

  let content;

  if (userChoices.typescript) {
    content = `import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  incrementByAmount: (amount: number) => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementByAmount: (amount) => set((state) => ({ count: state.count + amount })),
}));
`;
  } else {
    content = `import { create } from 'zustand';

export const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementByAmount: (amount) => set((state) => ({ count: state.count + amount })),
}));
`;
  }

  fs.writeFileSync(path.join(libDir, `counterStore.${ext}`), content);
}

function createCounterComponent(projectPath, userChoices) {
  const ext = userChoices.typescript ? "tsx" : "jsx";
  const componentsDir = path.join(projectPath, "components");
  fs.ensureDirSync(componentsDir);

  const content = `'use client';

${
  userChoices.typescript ? "import React from 'react';\n" : ""
}import { useCounterStore } from '../lib/counterStore';
  
export function Counter() {
  const { count, increment, decrement, incrementByAmount } = useCounterStore();

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
      }>Zustand Counter</h2>
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
          onClick={decrement}
        >
          -
        </button>
        <span${
          userChoices.styling === "tailwind"
            ? ' className="text-2xl font-bold"'
            : ""
        }>{count}</span>
        <button
          ${
            userChoices.styling === "tailwind"
              ? 'className="px-4 py-2 bg-blue-500 text-white rounded"'
              : "style={{ padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}"
          }
          onClick={increment}
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
        onClick={() => incrementByAmount(5)}
      >
        Add 5
      </button>
    </div>
  );
}
`;

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

  // add 'use client' directive if it's not already there for app router
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
        // ff no main tag, look for a div
        updatedContent = updatedContent.replace(
          /(<div.*?>)([\s\S]*?)(<\/div>)/,
          "$1$2<Counter />\n$3"
        );
      }
    }
  }

  fs.writeFileSync(pagePath, updatedContent);
}
