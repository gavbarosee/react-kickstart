import fs from "fs-extra";
import path from "path";
import { createAppWithCounter } from "./app-with-counter.js";

/**
 * Sets up Zustand for standard frameworks (Vite, Parcel, Rsbuild)
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupZustandStore(projectPath, userChoices) {
  if (userChoices.stateManagement !== "zustand") return;

  const ext = userChoices.typescript ? "ts" : "js";
  const srcDir = path.join(projectPath, "src");

  // create store directory
  const storeDir = path.join(srcDir, "store");
  fs.ensureDirSync(storeDir);

  // create counter store
  createCounterStore(storeDir, userChoices);

  // create the components directory for the Counter
  const componentsDir = path.join(srcDir, "components");
  fs.ensureDirSync(componentsDir);

  createCounterComponent(componentsDir, userChoices);
  createAppWithCounter(projectPath, userChoices);
}

function createCounterStore(storeDir, userChoices) {
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

  fs.writeFileSync(path.join(storeDir, `counterStore.${ext}`), content);
}

function createCounterComponent(componentsDir, userChoices) {
  const ext = userChoices.typescript ? "tsx" : "jsx";

  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { useCounterStore } from '../store/counterStore';
  
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
