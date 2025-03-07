const fs = require("fs-extra");
const path = require("path");

async function generateNextjsProject(projectPath, projectName, userChoices) {
  console.log("Creating a Next.js React project...");

  // create package.json
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

  // add TypeScript if selected
  if (userChoices.typescript) {
    packageJson.dependencies.typescript = "^5.3.2";
    packageJson.dependencies["@types/node"] = "^20.10.0";
    packageJson.dependencies["@types/react"] = "^18.2.39";
    packageJson.dependencies["@types/react-dom"] = "^18.2.17";
  }

  // add styling dependencies
  if (userChoices.styling === "tailwind") {
    packageJson.dependencies.tailwindcss = "^3.3.5";
    packageJson.dependencies.postcss = "^8.4.31";
    packageJson.dependencies.autoprefixer = "^10.4.16";
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies["styled-components"] = "^6.1.1";
    packageJson.dependencies["babel-plugin-styled-components"] = "^2.1.4";
  }

  // write package.json
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // create basic folder structure
  const pagesDir = path.join(projectPath, "pages");
  const publicDir = path.join(projectPath, "public");
  const stylesDir = path.join(projectPath, "styles");

  fs.ensureDirSync(pagesDir);
  fs.ensureDirSync(publicDir);
  fs.ensureDirSync(stylesDir);

  // Determine file extensions
  const fileExt = userChoices.typescript ? "tsx" : "jsx";

  // create Next.js config file
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

  fs.writeFileSync(path.join(projectPath, "next.config.js"), nextConfig);

  // create index page based on styling choice
  let indexContent;

  if (userChoices.styling === "styled-components") {
    indexContent = `import styled from 'styled-components';

const Container = styled.div\`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
\`;

const Title = styled.h1\`
  font-size: 2.5rem;
  margin-bottom: 1rem;
\`;

export default function Home() {
  return (
    <Container>
      <Title>Welcome to React Kickstart</Title>
      <p>Edit <code>pages/index.${fileExt}</code> to get started</p>
    </Container>
  );
}
`;
  } else if (userChoices.styling === "tailwind") {
    indexContent = `export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to React Kickstart</h1>
      <p className="mb-4">Edit <code className="bg-gray-100 p-1 rounded">pages/index.${fileExt}</code> to get started</p>
    </div>
  );
}
`;
  } else {
    indexContent = `export default function Home() {
  return (
    <div className="container">
      <h1>Welcome to React Kickstart</h1>
      <p>Edit <code>pages/index.${fileExt}</code> to get started</p>
    </div>
  );
}
`;
  }

  fs.writeFileSync(path.join(pagesDir, `index.${fileExt}`), indexContent);

  // create _app page
  const appContent = `import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
  fs.writeFileSync(path.join(pagesDir, `_app.${fileExt}`), appContent);

  // add CSS file based on styling choice
  let cssContent;

  if (userChoices.styling === "tailwind") {
    cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

    // create Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    fs.writeFileSync(
      path.join(projectPath, "tailwind.config.js"),
      tailwindConfig
    );

    // create PostCSS config
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    fs.writeFileSync(
      path.join(projectPath, "postcss.config.js"),
      postcssConfig
    );
  } else {
    cssContent = `html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

h1 {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  margin-bottom: 1.5rem;
}
`;
  }

  fs.writeFileSync(path.join(stylesDir, "globals.css"), cssContent);

  if (userChoices.linting) {
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

  // create gitignore
  const gitignore = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
  fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

  // if using TypeScript, create tsconfig.json
  if (userChoices.typescript) {
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
        paths: {
          "@/*": ["./*"],
        },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
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

  return true;
}

module.exports = generateNextjsProject;
