import fs from "fs-extra";
import path from "path";

export function setupTypeScript(projectPath, userChoices) {
  if (!userChoices.typescript) return;

  const tsConfig = {
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

  fs.writeFileSync(
    path.join(projectPath, "tsconfig.json"),
    JSON.stringify(tsConfig, null, 2)
  );

  const tsConfigNode = {
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
    JSON.stringify(tsConfigNode, null, 2)
  );
}
