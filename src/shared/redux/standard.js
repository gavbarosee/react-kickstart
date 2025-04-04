import fs from "fs-extra";
import path from "path";
import { createAppWithCounter } from "./app-with-counter.js";

/**
 * Sets up Redux Toolkit for standard frameworks (Vite, Parcel, Rsbuild)
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupReduxToolkit(projectPath, userChoices) {
  if (userChoices.stateManagement !== "redux") return;

  const ext = userChoices.typescript ? "ts" : "js";
  const srcDir = path.join(projectPath, "src");

  // create store directory
  const storeDir = path.join(srcDir, "store");
  fs.ensureDirSync(storeDir);
  createStoreFile(storeDir, userChoices);
  createHooksFile(storeDir, userChoices);
  // create example counter slice
  createCounterSlice(storeDir, userChoices);
  // update main/index entry point to include the provider
  updateEntryPoint(srcDir, userChoices);

  // create the components directory for the Counter
  const componentsDir = path.join(srcDir, "components");
  fs.ensureDirSync(componentsDir);

  createCounterComponent(componentsDir, userChoices);
  createAppWithCounter(projectPath, userChoices);
}

function createStoreFile(storeDir, userChoices) {
  const ext = userChoices.typescript ? "ts" : "js";
  const tsImport = userChoices.typescript
    ? "\nimport { Action, ThunkAction } from '@reduxjs/toolkit';"
    : "";
  const tsExport = userChoices.typescript
    ? `
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;`
    : "";

  const content = `import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';${tsImport}

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;${tsExport}
`;

  fs.writeFileSync(path.join(storeDir, `store.${ext}`), content);
}

function createHooksFile(storeDir, userChoices) {
  const ext = userChoices.typescript ? "ts" : "js";
  const tsImport = userChoices.typescript
    ? "import type { TypedUseSelectorHook } from 'react-redux';\nimport type { RootState, AppDispatch } from './store';"
    : "import { RootState, AppDispatch } from './store';";

  const content = `import { useDispatch, useSelector } from 'react-redux';
${tsImport}

${
  userChoices.typescript
    ? "export const useAppDispatch: () => AppDispatch = useDispatch;\nexport const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;"
    : "export const useAppDispatch = () => useDispatch();\nexport const useAppSelector = useSelector;"
}
`;

  fs.writeFileSync(path.join(storeDir, `hooks.${ext}`), content);
}

function createCounterSlice(storeDir, userChoices) {
  const ext = userChoices.typescript ? "ts" : "js";

  const content = `import { createSlice${
    userChoices.typescript ? ", PayloadAction" : ""
  } } from '@reduxjs/toolkit';

${
  userChoices.typescript
    ? "interface CounterState {\n  value: number;\n}\n\n"
    : ""
}const initialState${userChoices.typescript ? ": CounterState" : ""} = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action${
      userChoices.typescript ? ": PayloadAction<number>" : ""
    }) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
`;

  fs.writeFileSync(path.join(storeDir, `counterSlice.${ext}`), content);
}

function updateEntryPoint(srcDir, userChoices) {
  const ext = userChoices.typescript ? "tsx" : "jsx";
  let entryFile;

  if (userChoices.framework === "vite") {
    entryFile = path.join(srcDir, `main.${ext}`);
  } else {
    entryFile = path.join(srcDir, `index.${ext}`);
  }

  if (!fs.existsSync(entryFile)) return;

  let content = fs.readFileSync(entryFile, "utf-8");

  // add Redux Provider
  if (content.includes("ReactDOM.createRoot")) {
    // for React 18
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
    // for older React versions
    content = content.replace(
      /import React from ['"]react['"];/,
      `import React from 'react';\nimport { Provider } from 'react-redux';\nimport { store } from './store/store';`
    );

    // just add the provider around <App />
    content = content.replace(
      /<App \/>/,
      `<Provider store={store}>\n      <App />\n    </Provider>`
    );
  }

  // write the modified content back
  fs.writeFileSync(entryFile, content);
}

function createCounterComponent(componentsDir, userChoices) {
  const ext = userChoices.typescript ? "tsx" : "jsx";

  const content = `${
    userChoices.typescript ? "import React from 'react';\n" : ""
  }import { useAppSelector, useAppDispatch } from '../store/hooks';
  import { decrement, increment, incrementByAmount } from '../store/counterSlice';
  
  export function Counter() {
    const count = useAppSelector((state) => state.counter.value);
    const dispatch = useAppDispatch();
  
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
        }>Redux Toolkit Counter</h2>
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
            onClick={() => dispatch(decrement())}
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
            onClick={() => dispatch(increment())}
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
          onClick={() => dispatch(incrementByAmount(5))}
        >
          Add 5
        </button>
      </div>
    );
  }
  `;

  fs.writeFileSync(path.join(componentsDir, `Counter.${ext}`), content);
}
