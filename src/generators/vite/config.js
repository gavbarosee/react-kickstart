import fs from "fs-extra";
import path from "path";
import {
  getCoreDependencies,
  getTypescriptDependencies,
  getTailwindDependencies,
  getStyledComponentsDependencies,
  getLintingDependencies,
  frameworks,
  getZustandDependencies,
  getReduxDependencies,
  getMobxDependencies,
} from "../../config/dependencies.js";

export function createPackageJson(projectPath, projectName, userChoices) {
  const packageJson = {
    name: projectName,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      ...getCoreDependencies(),
    },
    devDependencies: {
      "@vitejs/plugin-react": frameworks.vite.pluginReact,
      vite: frameworks.vite.vite,
    },
  };

  if (userChoices.typescript) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...getTypescriptDependencies(),
    };
  }

  if (userChoices.linting) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...getLintingDependencies(userChoices.typescript),
    };
  }

  if (userChoices.styling === "tailwind") {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...getTailwindDependencies(),
    };
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getStyledComponentsDependencies(),
    };
  }

  if (userChoices.stateManagement === "redux") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getReduxDependencies(),
    };
  }

  if (userChoices.stateManagement === "zustand") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getZustandDependencies(),
    };
  }
  if (userChoices.stateManagement === "mobx") {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...getMobxDependencies(),
    };
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}

export function createViteConfig(projectPath, userChoices) {
  const configExt = userChoices.typescript ? "ts" : "js";

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // Auto-open browser on dev start
  }
});
`;
  fs.writeFileSync(
    path.join(projectPath, `vite.config.${configExt}`),
    viteConfig
  );
}
