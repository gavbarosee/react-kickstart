import fs from "fs-extra";
import path from "path";

/**
 * Sets up Redux Toolkit for Next.js with App Router considerations
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @returns {void}
 */
export function setupNextjsReduxToolkit(projectPath, userChoices) {
  if (userChoices.stateManagement !== "redux") return;

  const ext = userChoices.typescript ? "ts" : "js";
  const componentExt = userChoices.typescript ? "tsx" : "jsx";

  // create lib directory for Redux
  const libDir = path.join(projectPath, "lib");
  fs.ensureDirSync(libDir);

  const featuresDir = path.join(libDir, "features");
  fs.ensureDirSync(featuresDir);

  // create counter feature directory
  const counterDir = path.join(featuresDir, "counter");
  fs.ensureDirSync(counterDir);

  createStoreFile(libDir, userChoices);
  createHooksFile(libDir, userChoices);
  createCounterSlice(counterDir, userChoices);

  // create StoreProvider component
  createStoreProvider(projectPath, userChoices);

  // update layout to include StoreProvider
  updateLayout(projectPath, userChoices);
}

function createStoreFile(libDir, userChoices) {
  const ext = userChoices.typescript ? "ts" : "js";

  const content = `import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer
    }
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
`;

  fs.writeFileSync(path.join(libDir, `store.${ext}`), content);
}

function createHooksFile(libDir, userChoices) {
  const ext = userChoices.typescript ? "ts" : "js";

  const content = `import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

// Use throughout your app instead of plain \`useDispatch\` and \`useSelector\`
export const useAppDispatch = ${
    userChoices.typescript
      ? "useDispatch.withTypes<AppDispatch>()"
      : "() => useDispatch()"
  };
export const useAppSelector = ${
    userChoices.typescript
      ? "useSelector.withTypes<RootState>()"
      : "useSelector"
  };
export const useAppStore = ${
    userChoices.typescript ? "useStore.withTypes<AppStore>()" : "useStore"
  };
`;

  fs.writeFileSync(path.join(libDir, `hooks.${ext}`), content);
}

function createCounterSlice(counterDir, userChoices) {
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
    // Special case for initializing counter from SSR
    initializeCount: (state, action${
      userChoices.typescript ? ": PayloadAction<number>" : ""
    }) => {
      state.value = action.payload;
    }
  },
});

export const { increment, decrement, incrementByAmount, initializeCount } = counterSlice.actions;
export default counterSlice.reducer;
`;

  fs.writeFileSync(path.join(counterDir, `counterSlice.${ext}`), content);
}

function createStoreProvider(projectPath, userChoices) {
  const componentExt = userChoices.typescript ? "tsx" : "jsx";
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

  fs.writeFileSync(path.join(appDir, `StoreProvider.${componentExt}`), content);
}

function updateLayout(projectPath, userChoices) {
  const componentExt = userChoices.typescript ? "tsx" : "jsx";
  let layoutPath;

  if (userChoices.nextRouting === "app") {
    layoutPath = path.join(projectPath, "app", `layout.${componentExt}`);
  } else {
    layoutPath = path.join(projectPath, "pages", `_app.${componentExt}`);
  }

  if (!fs.existsSync(layoutPath)) return;

  let content = fs.readFileSync(layoutPath, "utf-8");

  if (userChoices.nextRouting === "app") {
    // for App Router
    // import StoreProvider
    const importLine = "import StoreProvider from './StoreProvider';";

    if (!content.includes(importLine)) {
      // add import at the beginning of the file after any 'use' directives
      if (content.includes("'use client'")) {
        content = content.replace(
          "'use client'",
          "'use client';\n" + importLine
        );
      } else {
        content = importLine + "\n" + content;
      }
    }

    // wrap children with StoreProvider
    content = content.replace(
      /<body>(.*?){children}<\/body>/s,
      "<body>$1<StoreProvider>{children}</StoreProvider></body>"
    );
  } else {
    // Pages Router
    const importLine =
      "import StoreProvider from '../components/StoreProvider';";

    // make sure the provider directory exists
    const componentsDir = path.join(projectPath, "components");
    fs.ensureDirSync(componentsDir);

    // move the StoreProvider to components directory
    const providerPath = path.join(
      projectPath,
      "pages",
      `StoreProvider.${componentExt}`
    );
    if (fs.existsSync(providerPath)) {
      const destPath = path.join(
        componentsDir,
        `StoreProvider.${componentExt}`
      );
      fs.moveSync(providerPath, destPath, { overwrite: true });
    }

    // add import at the beginning of the file
    if (!content.includes(importLine)) {
      content = content.replace(
        /import .* from ['"].*['"];/,
        "$&\n" + importLine
      );
    }

    // wrap Component with StoreProvider in _app.js/tsx
    content = content.replace(
      /<Component {.*?} \/>/,
      "<StoreProvider><Component {...pageProps} /></StoreProvider>"
    );
  }

  fs.writeFileSync(layoutPath, content);
}
