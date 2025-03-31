import fs from "fs-extra";
import path from "path";
import {
  getCoreDependencies,
  getTypescriptDependencies,
  getTailwindDependencies,
  getStyledComponentsDependencies,
  getLintingDependencies,
  frameworks,
} from "../../config/dependencies.js";

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
      ...getCoreDependencies(),
    },
    devDependencies: {
      parcel: frameworks.parcel.parcel,
      process: frameworks.parcel.process,
      rimraf: frameworks.parcel.rimraf,
    },
  };

  if (userChoices.typescript) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...getTypescriptDependencies(),
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

  if (userChoices.linting) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...getLintingDependencies(userChoices.typescript),
    };
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
