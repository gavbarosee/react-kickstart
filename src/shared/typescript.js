import fs from "fs-extra";
import path from "path";

/**
 * Sets up TypeScript configuration for a React project
 *
 * @param {string} projectPath - Path to the project root
 * @param {Object} userChoices - User configuration options
 * @param {string} framework - The framework being used (vite, nextjs, rsbuild, parcel)
 * @returns {void}
 */
export function setupTypeScript(projectPath, userChoices, framework = "vite") {
  if (!userChoices.typescript) return;

  // Base TypeScript config used by all frameworks except Next.js
  const baseConfig = {
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
  };

  // Framework-specific configurations
  if (framework === "vite") {
    baseConfig.references = [{ path: "./tsconfig.node.json" }];

    const nodeConfig = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: "ESNext",
        moduleResolution: "bundler",
        allowSyntheticDefaultImports: true,
      },
      include: ["vite.config.ts"],
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.node.json"),
      JSON.stringify(nodeConfig, null, 2)
    );
  } else if (framework === "nextjs") {
    // Next.js has a completely different TypeScript configuration
    const nextTsConfig = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
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
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    };

    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(nextTsConfig, null, 2)
    );

    // Create next-env.d.ts
    const nextEnvDts = `/// <reference types="next" />
/// <reference types="next/navigation-types/compat/navigation" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;
    fs.writeFileSync(path.join(projectPath, "next-env.d.ts"), nextEnvDts);

    return;
  }

  // Write the TypeScript configuration for all other frameworks
  fs.writeFileSync(
    path.join(projectPath, "tsconfig.json"),
    JSON.stringify(baseConfig, null, 2)
  );
}
