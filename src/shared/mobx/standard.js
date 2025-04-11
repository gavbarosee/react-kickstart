import fs from "fs-extra";
import path from "path";
import { createAppWithCounter } from "./app-with-counter.js";

/**
 * Sets up MobX for standard frameworks (Vite, Parcel, Rsbuild)
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupMobxStore(projectPath, userChoices) {
  if (userChoices.stateManagement !== "mobx") return;

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
    content = `import { makeAutoObservable } from 'mobx';

class CounterStore {
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

// Create a singleton instance
const counterStore = new CounterStore();
export default counterStore;
`;
  } else {
    content = `import { makeAutoObservable } from 'mobx';

class CounterStore {
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

// Create a singleton instance
const counterStore = new CounterStore();
export default counterStore;
`;
  }

  fs.writeFileSync(path.join(storeDir, `counterStore.${ext}`), content);
}

function createCounterComponent(componentsDir, userChoices) {
  const ext = userChoices.typescript ? "tsx" : "jsx";

  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { observer } from 'mobx-react-lite';
import counterStore from '../store/counterStore';
  
export const Counter = observer(() => {
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
