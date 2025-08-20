import { TemplateEngine } from "./TemplateEngine.js";
import fs from "fs-extra";
import path from "path";

/**
 * Specialized template engine for project file generation
 */
export class FileTemplateEngine {
  constructor() {
    this.engine = new TemplateEngine();
    this.loadCodeTemplates();
  }

  /**
   * Load code templates for different frameworks and features
   */
  loadCodeTemplates() {
    // React Component Templates
    this.engine.registerTemplate("reactComponentBasic", {
      type: "file",
      render: (componentName, options = {}) => {
        const { typescript = false, className = "", children = "" } = options;
        const reactImport = typescript ? "import React from 'react';" : "";

        return `${reactImport}

export default function ${componentName}() {
  return (
    <div${className ? ` className="${className}"` : ""}>
      ${children || `<h1>Welcome to ${componentName}</h1>`}
    </div>
  );
}`;
      },
    });

    this.engine.registerTemplate("reactComponentWithProps", {
      type: "file",
      render: (componentName, options = {}) => {
        const { typescript = false, props = [], className = "" } = options;
        const reactImport = typescript ? "import React from 'react';" : "";

        const propsInterface =
          typescript && props.length > 0
            ? `interface ${componentName}Props {\n${props
                .map((p) => `  ${p.name}: ${p.type};`)
                .join("\n")}\n}\n\n`
            : "";

        const propsParam =
          props.length > 0
            ? typescript
              ? `{ ${props
                  .map((p) => p.name)
                  .join(", ")} }: ${componentName}Props`
              : `{ ${props.map((p) => p.name).join(", ")} }`
            : "";

        return `${reactImport}
${propsInterface}export default function ${componentName}(${propsParam}) {
  return (
    <div${className ? ` className="${className}"` : ""}>
      <h1>${componentName} Component</h1>
      ${props.map((p) => `<p>{${p.name}}</p>`).join("\n      ")}
    </div>
  );
}`;
      },
    });

    // Styled Components Templates
    this.engine.registerTemplate("styledComponent", {
      type: "file",
      render: (componentName, options = {}) => {
        const { typescript = false, styles = [] } = options;
        const reactImport = typescript ? "import React from 'react';" : "";

        const styledElements = styles
          .map(
            (style) =>
              `const ${style.name} = styled.${style.element}\`
  ${style.css}
\`;`
          )
          .join("\n\n");

        return `${reactImport}
import styled from 'styled-components';

${styledElements}

export default function ${componentName}() {
  return (
    <Container>
      <h1>Welcome to ${componentName}</h1>
    </Container>
  );
}`;
      },
    });

    // Tailwind Component Templates
    this.engine.registerTemplate("tailwindComponent", {
      type: "file",
      render: (componentName, options = {}) => {
        const { typescript = false, layout = "default" } = options;
        const reactImport = typescript ? "import React from 'react';" : "";

        const layouts = {
          default: 'className="p-4"',
          card: 'className="p-6 bg-white rounded-lg shadow-md"',
          hero: 'className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600"',
          sidebar: 'className="flex min-h-screen"',
        };

        return `${reactImport}

export default function ${componentName}() {
  return (
    <div ${layouts[layout] || layouts.default}>
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome to ${componentName}
      </h1>
    </div>
  );
}`;
      },
    });

    // Redux Templates
    this.engine.registerTemplate("reduxSlice", {
      type: "file",
      render: (sliceName, options = {}) => {
        const { initialState = {}, reducers = [] } = options;

        return `import { createSlice } from '@reduxjs/toolkit';

const initialState = ${JSON.stringify(initialState, null, 2)};

export const ${sliceName}Slice = createSlice({
  name: '${sliceName}',
  initialState,
  reducers: {
${reducers
  .map(
    (reducer) => `    ${reducer.name}: (state, action) => {
      // ${reducer.description || "Add your logic here"}
    },`
  )
  .join("\n")}
  },
});

export const { ${reducers
          .map((r) => r.name)
          .join(", ")} } = ${sliceName}Slice.actions;

export default ${sliceName}Slice.reducer;`;
      },
    });

    // Zustand Store Templates
    this.engine.registerTemplate("zustandStore", {
      type: "file",
      render: (storeName, options = {}) => {
        const { typescript = false, state = {}, actions = [] } = options;

        const stateInterface = typescript
          ? `interface ${storeName}State {\n${Object.entries(state)
              .map(([key, value]) => `  ${key}: ${typeof value};`)
              .join("\n")}\n${actions
              .map(
                (action) =>
                  `  ${action.name}: ${action.signature || "() => void"};`
              )
              .join("\n")}\n}\n\n`
          : "";

        return `import { create } from 'zustand';

${stateInterface}export const use${storeName} = create${
          typescript ? `<${storeName}State>` : ""
        }((set) => ({
${Object.entries(state)
  .map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`)
  .join("\n")}
${actions
  .map(
    (action) =>
      `  ${action.name}: ${
        action.implementation || "() => set((state) => state)"
      },`
  )
  .join("\n")}
}));`;
      },
    });

    // Next.js Templates
    this.engine.registerTemplate("nextjsPage", {
      type: "file",
      render: (pageName, options = {}) => {
        const {
          typescript = false,
          layout = "default",
          metadata = {},
        } = options;
        const reactImport = typescript ? "import React from 'react';" : "";

        if (options.isAppRouter) {
          // App Router format
          return `${reactImport}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${metadata.title || pageName}',
  description: '${metadata.description || `${pageName} page`}',
};

export default function ${pageName}Page() {
  return (
    <div>
      <h1>${pageName} Page</h1>
    </div>
  );
}`;
        } else {
          // Pages Router format
          return `${reactImport}
import Head from 'next/head';

export default function ${pageName}() {
  return (
    <>
      <Head>
        <title>${metadata.title || pageName}</title>
        <meta name="description" content="${
          metadata.description || `${pageName} page`
        }" />
      </Head>
      <div>
        <h1>${pageName} Page</h1>
      </div>
    </>
  );
}`;
        }
      },
    });

    // Configuration File Templates
    this.engine.registerTemplate("viteConfig", {
      type: "file",
      render: (options = {}) => {
        const { typescript = false, plugins = [] } = options;

        return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
${plugins.map((plugin) => `import ${plugin.import};`).join("\n")}

export default defineConfig({
  plugins: [
    react(),
${plugins.map((plugin) => `    ${plugin.use},`).join("\n")}
  ],
});`;
      },
    });

    this.engine.registerTemplate("nextConfig", {
      type: "file",
      render: (options = {}) => {
        const { experimental = [], images = {}, env = {} } = options;

        return `/** @type {import('next').NextConfig} */
const nextConfig = {
${
  Object.keys(experimental).length > 0
    ? `  experimental: {
${Object.entries(experimental)
  .map(([key, value]) => `    ${key}: ${JSON.stringify(value)},`)
  .join("\n")}
  },`
    : ""
}
${
  Object.keys(images).length > 0
    ? `  images: {
${Object.entries(images)
  .map(([key, value]) => `    ${key}: ${JSON.stringify(value)},`)
  .join("\n")}
  },`
    : ""
}
${
  Object.keys(env).length > 0
    ? `  env: {
${Object.entries(env)
  .map(([key, value]) => `    ${key}: ${JSON.stringify(value)},`)
  .join("\n")}
  },`
    : ""
}
};

module.exports = nextConfig;`;
      },
    });

    // TypeScript Configuration Templates
    this.engine.registerTemplate("tsConfig", {
      type: "file",
      render: (options = {}) => {
        const {
          framework = "vite",
          strict = true,
          target = "ES2020",
        } = options;

        const baseConfig = {
          compilerOptions: {
            target,
            lib: ["DOM", "DOM.Iterable", "ES6"],
            allowJs: true,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict,
            forceConsistentCasingInFileNames: true,
            noFallthroughCasesInSwitch: true,
            module: "esnext",
            moduleResolution: "node",
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: "react-jsx",
          },
          include: ["src"],
          references: [{ path: "./tsconfig.node.json" }],
        };

        if (framework === "nextjs") {
          baseConfig.compilerOptions.lib.push("ES2017");
          baseConfig.compilerOptions.incremental = true;
          baseConfig.compilerOptions.plugins = [{ name: "next" }];
          baseConfig.include = [
            "next-env.d.ts",
            "**/*.ts",
            "**/*.tsx",
            ".next/types/**/*.ts",
          ];
          baseConfig.exclude = ["node_modules"];
          delete baseConfig.references;
        }

        return JSON.stringify(baseConfig, null, 2);
      },
    });
  }

  /**
   * Generate React component file
   */
  async generateComponent(filePath, componentName, options = {}) {
    const templateName = options.styled
      ? "styledComponent"
      : options.tailwind
      ? "tailwindComponent"
      : options.withProps
      ? "reactComponentWithProps"
      : "reactComponentBasic";

    return this.engine.renderFile(
      templateName,
      filePath,
      componentName,
      options
    );
  }

  /**
   * Generate Redux slice file
   */
  async generateReduxSlice(filePath, sliceName, options = {}) {
    return this.engine.renderFile("reduxSlice", filePath, sliceName, options);
  }

  /**
   * Generate Zustand store file
   */
  async generateZustandStore(filePath, storeName, options = {}) {
    return this.engine.renderFile("zustandStore", filePath, storeName, options);
  }

  /**
   * Generate Next.js page file
   */
  async generateNextjsPage(filePath, pageName, options = {}) {
    return this.engine.renderFile("nextjsPage", filePath, pageName, options);
  }

  /**
   * Generate configuration files
   */
  async generateConfig(filePath, configType, options = {}) {
    const templateMap = {
      vite: "viteConfig",
      next: "nextConfig",
      typescript: "tsConfig",
    };

    const templateName = templateMap[configType];
    if (!templateName) {
      throw new Error(`Unknown config type: ${configType}`);
    }

    return this.engine.renderFile(templateName, filePath, options);
  }

  /**
   * Generate HTML file
   */
  async generateHtmlFile(filePath, projectName, options = {}) {
    return this.engine.renderFile("htmlFile", filePath, projectName, options);
  }

  /**
   * Generate package.json file
   */
  async generatePackageJson(filePath, projectName, options = {}) {
    return this.engine.renderFile(
      "packageJson",
      filePath,
      projectName,
      options
    );
  }

  /**
   * Generate multiple files from templates
   */
  async generateBatch(templates) {
    const results = {};

    for (const template of templates) {
      const { name, templateName, filePath, args = [] } = template;
      try {
        results[name] = await this.engine.renderFile(
          templateName,
          filePath,
          ...args
        );
      } catch (error) {
        results[name] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Register custom code template
   */
  registerTemplate(name, template) {
    this.engine.registerTemplate(name, template);
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return this.engine.getAvailableTemplates();
  }
}
