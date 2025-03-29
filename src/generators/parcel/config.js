import fs from "fs-extra";
import path from "path";

export function createPackageJson(projectPath, projectName, userChoices) {
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    source: "src/index.html",
    scripts: {
      start: "parcel src/index.html --open",
      build: "parcel build src/index.html",
      clean: "rimraf dist .parcel-cache",
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    devDependencies: {
      parcel: "^2.10.3",
      process: "^0.11.10",
      rimraf: "^5.0.5",
    },
  };

  if (userChoices.typescript) {
    packageJson.devDependencies.typescript = "^5.3.2";
    packageJson.devDependencies["@types/react"] = "^18.2.39";
    packageJson.devDependencies["@types/react-dom"] = "^18.2.17";
  }

  if (userChoices.styling === "tailwind") {
    packageJson.devDependencies.tailwindcss = "^3.3.5";
    packageJson.devDependencies.postcss = "^8.4.31";
    packageJson.devDependencies.autoprefixer = "^10.4.16";
  } else if (userChoices.styling === "styled-components") {
    packageJson.dependencies["styled-components"] = "^6.1.1";
  }

  if (userChoices.linting) {
    packageJson.devDependencies.eslint = "^8.55.0";
    packageJson.devDependencies["eslint-plugin-react"] = "^7.33.2";
    packageJson.devDependencies["eslint-plugin-react-hooks"] = "^4.6.0";
    packageJson.devDependencies.prettier = "^3.1.0";
    packageJson.devDependencies["eslint-plugin-prettier"] = "^5.0.1";
    packageJson.devDependencies["eslint-config-prettier"] = "^9.1.0";

    if (userChoices.typescript) {
      packageJson.devDependencies["@typescript-eslint/eslint-plugin"] =
        "^6.13.1";
      packageJson.devDependencies["@typescript-eslint/parser"] = "^6.13.1";
    }
  }

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}

export function createParcelConfig(projectPath, userChoices) {
  const parcelrc = {
    extends: "@parcel/config-default",
    transformers: {
      "*.{js,mjs,jsx,cjs,ts,tsx}": [
        "@parcel/transformer-js",
        "@parcel/transformer-react-refresh-wrap",
      ],
    },
  };

  fs.writeFileSync(
    path.join(projectPath, ".parcelrc"),
    JSON.stringify(parcelrc, null, 2)
  );
}
