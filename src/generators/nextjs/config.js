import fs from "fs-extra";
import path from "path";

export function createPackageJson(projectPath, projectName, userChoices) {
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "^14.0.3",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
  };

  if (userChoices.typescript) {
    packageJson.dependencies.typescript = "^5.3.2";
    packageJson.dependencies["@types/node"] = "^20.10.0";
    packageJson.dependencies["@types/react"] = "^18.2.39";
    packageJson.dependencies["@types/react-dom"] = "^18.2.17";
  }

  if (userChoices.styling === "tailwind") {
    packageJson.dependencies.tailwindcss = "^3.3.5";
    packageJson.dependencies.postcss = "^8.4.31";
    packageJson.dependencies.autoprefixer = "^10.4.16";
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies["styled-components"] = "^6.1.1";
    packageJson.dependencies["babel-plugin-styled-components"] = "^2.1.4";
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}

export function createNextConfig(projectPath, userChoices) {
  // create Next.js config file - ALWAYS use .js extension regardless of TypeScript choice
  let nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
`;

  if (userChoices.styling === "styled-components") {
    nextConfig += `  compiler: {
    styledComponents: true,
  },
`;
  }

  nextConfig += `};

module.exports = nextConfig;
`;

  // always use .js extension for Next.js config
  fs.writeFileSync(path.join(projectPath, "next.config.js"), nextConfig);
}

export function setupLinting(projectPath, userChoices) {
  const eslintConfig = {
    extends: [
      "next/core-web-vitals",
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:prettier/recommended",
    ],
    plugins: ["react", "prettier"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": ["error", { singleQuote: true }],
    },
  };

  if (userChoices.typescript) {
    eslintConfig.extends.push("plugin:@typescript-eslint/recommended");
    eslintConfig.parser = "@typescript-eslint/parser";
    eslintConfig.plugins.push("@typescript-eslint");
  }

  fs.writeFileSync(
    path.join(projectPath, ".eslintrc.json"),
    JSON.stringify(eslintConfig, null, 2)
  );

  const prettierConfig = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: "es5",
  };

  fs.writeFileSync(
    path.join(projectPath, ".prettierrc"),
    JSON.stringify(prettierConfig, null, 2)
  );

  const updatedPackageJson = JSON.parse(
    fs.readFileSync(path.join(projectPath, "package.json"))
  );
  updatedPackageJson.devDependencies = {
    ...(updatedPackageJson.devDependencies || {}),
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    prettier: "^3.1.0",
  };

  if (userChoices.typescript) {
    updatedPackageJson.devDependencies = {
      ...updatedPackageJson.devDependencies,
      "@typescript-eslint/eslint-plugin": "^6.13.1",
      "@typescript-eslint/parser": "^6.13.1",
    };
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(updatedPackageJson, null, 2)
  );
}

export function setupTypeScript(projectPath, userChoices) {
  const tsConfig = {
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
    JSON.stringify(tsConfig, null, 2)
  );

  // create next-env.d.ts
  const nextEnvDts = `/// <reference types="next" />
/// <reference types="next/navigation-types/compat/navigation" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;
  fs.writeFileSync(path.join(projectPath, "next-env.d.ts"), nextEnvDts);
}

export function setupJsConfig(projectPath) {
  const jsConfig = {
    compilerOptions: {
      paths: {
        "@/*": ["./*"],
      },
    },
  };

  fs.writeFileSync(
    path.join(projectPath, "jsconfig.json"),
    JSON.stringify(jsConfig, null, 2)
  );
}
