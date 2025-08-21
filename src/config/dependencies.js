/**
 * Centralized dependency version management
 * Update versions here to propagate changes to all generators
 */

// Core React dependencies
export const core = {
  react: "^18.2.0",
  reactDom: "^18.2.0",
};

// TypeScript related
export const typescript = {
  typescript: "^5.3.2",
  typesReact: "^18.2.40",
  typesReactDom: "^18.2.17",
  typesNode: "^20.10.0",
};

// Styling related
export const styling = {
  tailwind: "^3.3.5",
  postcss: "^8.4.31",
  autoprefixer: "^10.4.16",
  styledComponents: "^6.1.1",
  babelPluginStyledComponents: "^2.1.4",
};

// Linting and formatting
export const linting = {
  eslint: "^8.55.0",
  eslintPluginReact: "^7.33.2",
  eslintPluginReactHooks: "^4.6.0",
  prettier: "^3.1.0",
  eslintPluginPrettier: "^5.0.1",
  eslintConfigPrettier: "^9.1.0",
  typescriptEslintPlugin: "^6.13.1",
  typescriptEslintParser: "^6.13.1",
};

// Framework specific
export const frameworks = {
  vite: {
    vite: "^5.0.0",
    pluginReact: "^4.2.0",
  },
  nextjs: {
    next: "^14.0.3",
  },
};

export const routing = {
  reactRouter: {
    reactRouterDom: "^6.21.1",
  },
};

export function getRoutingDependencies(routingOption) {
  switch (routingOption) {
    case "react-router":
      return {
        "react-router-dom": routing.reactRouter.reactRouterDom,
      };
    default:
      return {};
  }
}

export const redux = {
  reduxToolkit: "^2.0.1",
  reactRedux: "^9.0.4",
};

export function getReduxDependencies() {
  return {
    "@reduxjs/toolkit": redux.reduxToolkit,
    "react-redux": redux.reactRedux,
  };
}

export const zustand = {
  zustand: "^4.4.7",
};

export function getZustandDependencies() {
  return {
    zustand: zustand.zustand,
  };
}

export const api = {
  axios: "^1.6.2",
  tanstackQuery: "^5.8.4",
  tanstackQueryDevtools: "^5.8.4",
};

export function getAxiosDependencies() {
  return {
    axios: api.axios,
  };
}

export function getReactQueryDependencies() {
  return {
    "@tanstack/react-query": api.tanstackQuery,
    "@tanstack/react-query-devtools": api.tanstackQueryDevtools,
  };
}

export function getAxiosReactQueryDependencies() {
  return {
    ...getAxiosDependencies(),
    ...getReactQueryDependencies(),
  };
}

export function getFetchReactQueryDependencies() {
  return {
    ...getReactQueryDependencies(),
  };
}

export function getCoreDependencies() {
  return {
    react: core.react,
    "react-dom": core.reactDom,
  };
}

export function getTypescriptDependencies(isDevDependency = true) {
  if (isDevDependency) {
    return {
      typescript: typescript.typescript,
      "@types/react": typescript.typesReact,
      "@types/react-dom": typescript.typesReactDom,
    };
  } else {
    return {
      typescript: typescript.typescript,
      "@types/node": typescript.typesNode,
      "@types/react": typescript.typesReact,
      "@types/react-dom": typescript.typesReactDom,
    };
  }
}

export function getTailwindDependencies(isDevDependency = true) {
  const deps = {
    tailwindcss: styling.tailwind,
    postcss: styling.postcss,
    autoprefixer: styling.autoprefixer,
  };

  return deps;
}

// Deployment platform CLI tools
export const deployment = {
  vercel: "^33.0.0",
  netlify: "^17.0.0",
};

export function getDeploymentDependencies(deploymentPlatform) {
  if (!deploymentPlatform || deploymentPlatform === "none") {
    return {};
  }

  switch (deploymentPlatform) {
    case "vercel":
      return {
        vercel: deployment.vercel,
      };
    case "netlify":
      return {
        "netlify-cli": deployment.netlify,
      };
    default:
      return {};
  }
}

export function getStyledComponentsDependencies() {
  return {
    "styled-components": styling.styledComponents,
  };
}

export function getLintingDependencies(includeTypescript = false) {
  let deps = {
    eslint: linting.eslint,
    "eslint-plugin-react": linting.eslintPluginReact,
    "eslint-plugin-react-hooks": linting.eslintPluginReactHooks,
    prettier: linting.prettier,
    "eslint-plugin-prettier": linting.eslintPluginPrettier,
    "eslint-config-prettier": linting.eslintConfigPrettier,
  };

  if (includeTypescript) {
    deps = {
      ...deps,
      "@typescript-eslint/eslint-plugin": linting.typescriptEslintPlugin,
      "@typescript-eslint/parser": linting.typescriptEslintParser,
    };
  }

  return deps;
}

// Testing frameworks - streamlined for Vite/Next.js
export const testing = {
  // Core testing tools
  vitest: "^1.0.4",
  vitestUi: "^1.0.4",
  jest: "^29.7.0",

  // React Testing Library ecosystem (mandatory)
  testingLibraryReact: "^14.1.2",
  testingLibraryJestDom: "^6.1.5",
  testingLibraryUserEvent: "^14.5.1",

  // Next.js Jest environment
  jestEnvironmentJsdom: "^29.7.0",
};

export function getVitestDependencies() {
  return {
    vitest: testing.vitest,
    "@vitest/ui": testing.vitestUi,
    "@testing-library/react": testing.testingLibraryReact,
    "@testing-library/jest-dom": testing.testingLibraryJestDom,
    "@testing-library/user-event": testing.testingLibraryUserEvent,
  };
}

export function getJestDependencies() {
  return {
    jest: testing.jest,
    "jest-environment-jsdom": testing.jestEnvironmentJsdom,
    "@testing-library/react": testing.testingLibraryReact,
    "@testing-library/jest-dom": testing.testingLibraryJestDom,
    "@testing-library/user-event": testing.testingLibraryUserEvent,
  };
}

export function getTestingDependencies(testingFramework) {
  switch (testingFramework) {
    case "vitest":
      return getVitestDependencies();
    case "jest":
      return getJestDependencies();
    case "none":
    default:
      return {};
  }
}
