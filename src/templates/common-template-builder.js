import { FileTemplateEngine } from "./file-template-engine.js";
import { CORE_UTILS } from "../utils/index.js";

/**
 * Enhanced template builder that addresses common duplication patterns
 * Builds on top of the existing TemplateEngine infrastructure
 */
export class CommonTemplateBuilder {
  constructor() {
    this.engine = new FileTemplateEngine();
    this.loadCommonTemplates();
  }

  /**
   * Load templates for common duplication patterns found in the codebase
   */
  loadCommonTemplates() {
    // App Component with Counter (Redux/Zustand)
    this.engine.registerTemplate("appWithCounter", {
      type: "file",
      render: (options = {}) => {
        const {
          userChoices,
          stateManager, // 'redux' or 'zustand'
          counterComponent = "Counter",
        } = options;

        const ext = CORE_UTILS.getComponentExtension(userChoices);
        const imports = this.buildImports(userChoices, [counterComponent]);
        const comment =
          stateManager === "redux"
            ? "Redux Toolkit Counter"
            : "Zustand Counter";

        return this.buildAppComponent({
          imports,
          styling: userChoices.styling,
          title: "React Kickstart",
          description: `Edit <code className="bg-gray-100 p-1 rounded">src/App.${ext}</code> and save to test HMR`,
          children: `{/* ${comment} */}\n      <${counterComponent} />`,
          userChoices,
        });
      },
    });

    // React Router Page Template
    this.engine.registerTemplate("routerPage", {
      type: "file",
      render: (pageName, options = {}) => {
        const { userChoices, className = "", additionalContent = "" } = options;
        const imports = this.buildImports(userChoices);

        return `${imports}
export default function ${pageName}Page() {
  return (
    <div${this.buildStylingProps(userChoices.styling, className)}>
      <h1${this.buildStylingProps(
        userChoices.styling,
        "title"
      )}>${pageName}</h1>
      ${additionalContent}
    </div>
  );
}`;
      },
    });

    // Redux Store Configuration
    this.engine.registerTemplate("reduxStore", {
      type: "file",
      render: (options = {}) => {
        const {
          userChoices,
          isNextjs = false,
          features = ["counter"],
        } = options;

        const imports = this.buildReduxStoreImports(
          features,
          isNextjs,
          userChoices.typescript
        );
        const reducers = this.buildReducersConfig(features);

        if (isNextjs) {
          return this.buildNextjsStore(
            imports,
            reducers,
            userChoices.typescript
          );
        } else {
          return this.buildStandardStore(
            imports,
            reducers,
            userChoices.typescript
          );
        }
      },
    });

    // Redux Hooks
    this.engine.registerTemplate("reduxHooks", {
      type: "file",
      render: (options = {}) => {
        const { userChoices, isNextjs = false } = options;
        return this.buildReduxHooks(userChoices.typescript, isNextjs);
      },
    });

    // Redux Slice
    this.engine.registerTemplate("reduxCounterSlice", {
      type: "file",
      render: (options = {}) => {
        const { userChoices, isNextjs = false } = options;
        return this.buildReduxSlice(userChoices.typescript, isNextjs);
      },
    });

    // Zustand Store
    this.engine.registerTemplate("zustandCounterStore", {
      type: "file",
      render: (options = {}) => {
        const { userChoices } = options;
        return this.buildZustandStore(userChoices.typescript);
      },
    });

    // Layout Component
    this.engine.registerTemplate("routerLayout", {
      type: "file",
      render: (options = {}) => {
        const { userChoices } = options;
        return this.buildRouterLayout(userChoices);
      },
    });
  }

  /**
   * Build imports with conditional TypeScript support
   */
  buildImports(userChoices, additionalImports = []) {
    const reactImport = userChoices.typescript
      ? "import React from 'react';\n"
      : "";
    const additional =
      additionalImports.length > 0
        ? additionalImports
            .map((imp) => {
              if (typeof imp === "string") {
                return `import { ${imp} } from './components/${imp}';`;
              }
              return `import ${imp.default ? "" : "{ "}${imp.name}${
                imp.default ? "" : " }"
              } from '${imp.from}';`;
            })
            .join("\n") + "\n"
        : "";

    return reactImport + additional;
  }

  /**
   * Build styling props based on styling type
   */
  buildStylingProps(styling, variant = "") {
    const stylingMap = {
      tailwind: {
        container: ' className="max-w-4xl mx-auto p-8 text-center"',
        title: ' className="text-4xl font-bold mb-4"',
        "": ' className="py-8"',
        "text-center": ' className="py-8 text-center"',
        navbar: ' className="py-4 border-b border-gray-200 mb-8"',
        navList: ' className="flex gap-8"',
        navLink: ' className="text-blue-500 hover:text-blue-700 font-medium"',
      },
      "styled-components": {
        container: "",
        title: "",
        "": "",
        "text-center": "",
      },
      css: {
        container: ' className="container"',
        title: "",
        "": "",
        "text-center": "",
      },
    };

    return stylingMap[styling]?.[variant] || "";
  }

  /**
   * Build complete app component with styling variations
   */
  buildAppComponent(config) {
    const { imports, styling, title, description, children, userChoices } =
      config;

    if (styling === "tailwind") {
      return `${imports}
function App() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">${title}</h1>
      <p className="mb-4">${description}</p>
      
      ${children}
    </div>
  );
}

export default App;`;
    } else if (styling === "styled-components") {
      return `${imports}import styled from 'styled-components';

const Container = styled.div\`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
\`;

const Title = styled.h1\`
  font-size: 2.5rem;
  margin-bottom: 1rem;
\`;

function App() {
  return (
    <Container>
      <Title>${title}</Title>
      <p>${description}</p>
      
      ${children}
    </Container>
  );
}

export default App;`;
    } else {
      // CSS styling
      return `${imports}import './App.css';

function App() {
  return (
    <div className="container">
      <h1>${title}</h1>
      <p>${description}</p>
      
      ${children}
    </div>
  );
}

export default App;`;
    }
  }

  /**
   * Build Redux store imports
   */
  buildReduxStoreImports(features, isNextjs, typescript) {
    const imports = ["import { configureStore } from '@reduxjs/toolkit';"];

    features.forEach((feature) => {
      if (isNextjs) {
        imports.push(
          `import ${feature}Reducer from './features/${feature}/${feature}Slice';`
        );
      } else {
        imports.push(`import ${feature}Reducer from './${feature}Slice';`);
      }
    });

    if (typescript && !isNextjs) {
      imports.push("import type { TypedUseSelectorHook } from 'react-redux';");
    }

    return imports.join("\n");
  }

  /**
   * Build reducers configuration
   */
  buildReducersConfig(features) {
    return features
      .map((feature) => `    ${feature}: ${feature}Reducer`)
      .join(",\n");
  }

  /**
   * Build standard Redux store
   */
  buildStandardStore(imports, reducers, typescript) {
    const typeExports = typescript
      ? `

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;`
      : "";

    return `${imports}

export const store = configureStore({
  reducer: {
${reducers},
  },
});${typeExports}`;
  }

  /**
   * Build Next.js Redux store
   */
  buildNextjsStore(imports, reducers, typescript) {
    const typeExports = typescript
      ? `

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];`
      : "";

    return `${imports}

export const makeStore = () => {
  return configureStore({
    reducer: {
${reducers}
    }
  });
};${typeExports}`;
  }

  /**
   * Build Redux hooks
   */
  buildReduxHooks(typescript, isNextjs) {
    if (isNextjs && typescript) {
      return `import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

// Use throughout your app instead of plain \`useDispatch\` and \`useSelector\`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();`;
    } else if (typescript) {
      return `import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;`;
    } else {
      return `import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;`;
    }
  }

  /**
   * Build Redux slice
   */
  buildReduxSlice(typescript, isNextjs) {
    const imports = typescript
      ? "import { createSlice, PayloadAction } from '@reduxjs/toolkit';"
      : "import { createSlice } from '@reduxjs/toolkit';";

    const interfaceDefinition = typescript
      ? `interface CounterState {
  value: number;
}

`
      : "";

    const stateTyping = typescript ? ": CounterState" : "";
    const payloadTyping = typescript ? ": PayloadAction<number>" : "";
    const extraExport = isNextjs ? ", initializeCount" : "";

    return `${imports}

${interfaceDefinition}const initialState${stateTyping} = {
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
    incrementByAmount: (state, action${payloadTyping}) => {
      state.value += action.payload;
    },${
      isNextjs
        ? `
    initializeCount: (state, action${payloadTyping}) => {
      state.value = action.payload;
    },`
        : ""
    }
  },
});

export const { increment, decrement, incrementByAmount${extraExport} } = counterSlice.actions;

export default counterSlice.reducer;`;
  }

  /**
   * Build Zustand store
   */
  buildZustandStore(typescript) {
    if (typescript) {
      return `import { create } from 'zustand';

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
}));`;
    } else {
      return `import { create } from 'zustand';

export const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementByAmount: (amount) => set((state) => ({ count: state.count + amount })),
}));`;
    }
  }

  /**
   * Build router layout component
   */
  buildRouterLayout(userChoices) {
    const imports = this.buildImports(userChoices, [
      { name: "Link, Outlet", from: "react-router-dom" },
    ]);

    if (userChoices.styling === "styled-components") {
      return `${imports}import styled from 'styled-components';

const LayoutContainer = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
\`;

const Nav = styled.nav\`
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 2rem;
\`;

const NavList = styled.ul\`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
\`;

const NavLink = styled(Link)\`
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #004499;
  }
\`;

export default function Layout() {
  return (
    <LayoutContainer>
      <Nav>
        <NavList>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
        </NavList>
      </Nav>
      <Outlet />
    </LayoutContainer>
  );
}`;
    } else if (userChoices.styling === "tailwind") {
      return `${imports}
export default function Layout() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <nav className="py-4 border-b border-gray-200 mb-8">
        <ul className="flex gap-8">
          <li>
            <Link to="/" className="text-blue-500 hover:text-blue-700 font-medium">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-blue-500 hover:text-blue-700 font-medium">
              About
            </Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}`;
    } else {
      return `${imports}${
        userChoices.styling === "css" ? "import './Layout.css';" : ""
      }

export default function Layout() {
  return (
    <div className="layout-container">
      <nav className="navbar">
        <ul className="nav-list">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/about" className="nav-link">About</Link></li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}`;
    }
  }

  /**
   * Generate app component with counter integration
   */
  generateAppWithCounter(userChoices, stateManager) {
    return this.engine.engine.render("appWithCounter", {
      userChoices,
      stateManager,
    });
  }

  /**
   * Generate router page
   */
  generateRouterPage(pageName, userChoices, options = {}) {
    return this.engine.engine.render("routerPage", pageName, {
      userChoices,
      ...options,
    });
  }

  /**
   * Generate Redux store
   */
  generateReduxStore(userChoices, isNextjs = false) {
    return this.engine.engine.render("reduxStore", {
      userChoices,
      isNextjs,
    });
  }

  /**
   * Generate Redux hooks
   */
  generateReduxHooks(userChoices, isNextjs = false) {
    return this.engine.engine.render("reduxHooks", {
      userChoices,
      isNextjs,
    });
  }

  /**
   * Generate Redux slice
   */
  generateReduxSlice(userChoices, isNextjs = false) {
    return this.engine.engine.render("reduxCounterSlice", {
      userChoices,
      isNextjs,
    });
  }

  /**
   * Generate Zustand store
   */
  generateZustandStore(userChoices) {
    return this.engine.engine.render("zustandCounterStore", {
      userChoices,
    });
  }

  /**
   * Generate router layout
   */
  generateRouterLayout(userChoices) {
    return this.engine.engine.render("routerLayout", {
      userChoices,
    });
  }

  /**
   * Get the underlying template engine for advanced usage
   */
  getEngine() {
    return this.engine;
  }
}
