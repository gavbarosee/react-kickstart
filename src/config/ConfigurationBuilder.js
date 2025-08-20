import fs from "fs-extra";
import path from "path";
import { PackageJsonBuilder } from "./PackageJsonBuilder.js";
import { createFileTemplateEngine } from "../templates/index.js";
import { CORE_UTILS } from "../utils/index.js";

/**
 * Main configuration builder that orchestrates all configuration file generation
 */
export class ConfigurationBuilder {
  constructor(framework) {
    this.framework = framework;
    this.packageJsonBuilder = new PackageJsonBuilder(framework);
    this.fileTemplateEngine = createFileTemplateEngine();
  }

  /**
   * Generate all configuration files for a project
   */
  async generateAllConfigs(projectPath, projectName, userChoices) {
    const configs = {};

    // Generate package.json
    configs.packageJson = this.generatePackageJson(
      projectPath,
      projectName,
      userChoices
    );

    // Generate framework-specific config files
    configs.frameworkConfig = await this.generateFrameworkConfig(
      projectPath,
      userChoices
    );

    // Generate additional config files based on features
    configs.additionalConfigs = await this.generateAdditionalConfigs(
      projectPath,
      userChoices
    );

    return configs;
  }

  /**
   * Generate package.json using the builder pattern
   */
  generatePackageJson(projectPath, projectName, userChoices) {
    return this.packageJsonBuilder
      .setBasicInfo(projectName)
      .setScripts()
      .addCoreDependencies()
      .addFrameworkDependencies()
      .addTypeScriptDependencies(userChoices)
      .addLintingDependencies(userChoices)
      .addStylingDependencies(userChoices)
      .addRoutingDependencies(userChoices)
      .addStateManagementDependencies(userChoices)
      .buildAndWrite(projectPath);
  }

  /**
   * Generate framework-specific configuration files
   */
  async generateFrameworkConfig(projectPath, userChoices) {
    switch (this.framework) {
      case "vite":
        return this.generateViteConfig(projectPath, userChoices);
      case "nextjs":
        return this.generateNextjsConfig(projectPath, userChoices);
      default:
        return null;
    }
  }

  /**
   * Generate Vite configuration
   */
  generateViteConfig(projectPath, userChoices) {
    const configExt = CORE_UTILS.getConfigExtension(userChoices);

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

    const configPath = path.join(projectPath, `vite.config.${configExt}`);
    fs.writeFileSync(configPath, viteConfig);

    return {
      file: `vite.config.${configExt}`,
      content: viteConfig,
    };
  }

  /**
   * Generate Next.js configuration
   */
  generateNextjsConfig(projectPath, userChoices) {
    let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
`;

    // Add styled-components config if needed
    if (userChoices.styling === "styled-components") {
      nextConfig += `  compiler: {
    styledComponents: true,
  },
`;
    }

    nextConfig += `};

module.exports = nextConfig;
`;

    const configPath = path.join(projectPath, "next.config.js");
    fs.writeFileSync(configPath, nextConfig);

    return {
      file: "next.config.js",
      content: nextConfig,
    };
  }

  /**
   * Generate additional configuration files based on features
   */
  async generateAdditionalConfigs(projectPath, userChoices) {
    const configs = {};

    // TypeScript config
    if (userChoices.typescript) {
      configs.typescript = this.generateTypeScriptConfig(
        projectPath,
        userChoices
      );
    }

    // JavaScript config for Next.js when not using TypeScript
    if (this.framework === "nextjs" && !userChoices.typescript) {
      configs.jsconfig = this.generateJsConfig(projectPath);
    }

    // Tailwind config
    if (userChoices.styling === "tailwind") {
      configs.tailwind = this.generateTailwindConfig(projectPath);
      configs.postcss = this.generatePostCssConfig(projectPath);
    }

    return configs;
  }

  /**
   * Generate TypeScript configuration
   */
  generateTypeScriptConfig(projectPath, userChoices) {
    let tsConfig;

    if (this.framework === "nextjs") {
      tsConfig = {
        compilerOptions: {
          target: "es5",
          lib: ["dom", "dom.iterable", "es6"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "node",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [
            {
              name: "next",
            },
          ],
          paths: {
            "@/*": ["./*"],
          },
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      };
    } else {
      // Vite TypeScript config
      tsConfig = {
        compilerOptions: {
          target: "ES2020",
          useDefineForClassFields: true,
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ["src"],
        references: [{ path: "./tsconfig.node.json" }],
      };
    }

    const configPath = path.join(projectPath, "tsconfig.json");
    fs.writeFileSync(configPath, JSON.stringify(tsConfig, null, 2));

    return {
      file: "tsconfig.json",
      content: tsConfig,
    };
  }

  /**
   * Generate jsconfig.json for Next.js JavaScript projects
   */
  generateJsConfig(projectPath) {
    const jsConfig = {
      compilerOptions: {
        paths: {
          "@/*": ["./*"],
        },
      },
    };

    const configPath = path.join(projectPath, "jsconfig.json");
    fs.writeFileSync(configPath, JSON.stringify(jsConfig, null, 2));

    return {
      file: "jsconfig.json",
      content: jsConfig,
    };
  }

  /**
   * Generate Tailwind CSS configuration
   */
  generateTailwindConfig(projectPath) {
    const contentPaths = this.getTailwindContentPaths();

    let tailwindConfig;
    if (this.framework === "nextjs") {
      // Next.js uses CommonJS
      tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ${contentPaths.map((path) => `'${path}'`).join(",\n    ")}
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    } else {
      // Vite uses ES modules
      tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    ${contentPaths.map((path) => `"${path}"`).join(",\n    ")}
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    }

    const configPath = path.join(projectPath, "tailwind.config.js");
    fs.writeFileSync(configPath, tailwindConfig);

    return {
      file: "tailwind.config.js",
      content: tailwindConfig,
    };
  }

  /**
   * Generate PostCSS configuration for Tailwind
   */
  generatePostCssConfig(projectPath) {
    let postcssConfig;

    if (this.framework === "nextjs") {
      // Next.js uses CommonJS
      postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    } else {
      // Vite uses ES modules
      postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
`;
    }

    const configPath = path.join(projectPath, "postcss.config.js");
    fs.writeFileSync(configPath, postcssConfig);

    return {
      file: "postcss.config.js",
      content: postcssConfig,
    };
  }

  /**
   * Get Tailwind content paths based on framework
   */
  getTailwindContentPaths() {
    switch (this.framework) {
      case "vite":
        return ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"];
      case "nextjs":
        return [
          "./pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./components/**/*.{js,ts,jsx,tsx,mdx}",
          "./app/**/*.{js,ts,jsx,tsx,mdx}",
        ];
      default:
        return ["./src/**/*.{js,ts,jsx,tsx}"];
    }
  }

  /**
   * Get a summary of all configurations that will be generated
   */
  getConfigurationSummary(userChoices) {
    const configs = ["package.json"];

    // Framework config
    if (this.framework === "vite") {
      configs.push(`vite.config.${CORE_UTILS.getConfigExtension(userChoices)}`);
    } else if (this.framework === "nextjs") {
      configs.push("next.config.js");
    }

    // TypeScript
    if (userChoices.typescript) {
      configs.push("tsconfig.json");
    } else if (this.framework === "nextjs") {
      configs.push("jsconfig.json");
    }

    // Tailwind
    if (userChoices.styling === "tailwind") {
      configs.push("tailwind.config.js", "postcss.config.js");
    }

    return configs;
  }
}
