import fs from "fs-extra";
import path from "path";
import { BaseStateSetup } from "./base-state-setup.js";
import { createAppWithCounter } from "../../features/zustand/counter-template.js";
import { createCommonTemplateBuilder } from "../../templates/index.js";

/**
 * Zustand setup implementation
 */
export class ZustandSetup extends BaseStateSetup {
  constructor(framework) {
    super(framework, "zustand");
  }

  /**
   * Create Zustand store files
   */
  createStoreFiles(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);
    this.createCounterStore(directories.store, userChoices, extensions);
  }

  createCounterStore(storeDir, userChoices, extensions) {
    const templateBuilder = createCommonTemplateBuilder();
    const content = templateBuilder.generateZustandStore(userChoices);

    fs.writeFileSync(
      path.join(storeDir, `counterStore.${extensions.script}`),
      content
    );
  }

  /**
   * Create Zustand components
   */
  createComponents(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const imports = this.getZustandImports();
    const storeLogic = this.getZustandStoreLogic();

    const counterContent = this.generateCounterComponent(
      userChoices,
      imports,
      storeLogic,
      "Zustand Counter"
    );

    fs.writeFileSync(
      path.join(directories.components, `Counter.${extensions.component}`),
      counterContent
    );

    // Create App with Counter
    // Fix: Use the project root, not the parent of the store directory
    const projectRoot = path.dirname(path.dirname(directories.store)); // Go up two levels from src/store to project root
    createAppWithCounter(projectRoot, userChoices);
  }

  getZustandImports() {
    if (this.framework === "nextjs") {
      return "import { useCounterStore } from '../lib/counterStore';";
    } else {
      return "import { useCounterStore } from '../store/counterStore';";
    }
  }

  getZustandStoreLogic() {
    return "  const { count, increment, decrement, incrementByAmount } = useCounterStore();";
  }

  /**
   * Update entry points for Zustand (minimal changes needed)
   */
  updateEntryPoints(projectPath, directories, userChoices) {
    if (this.framework === "nextjs") {
      this.updateNextjsMainPage(projectPath, userChoices);
    }
    // Standard frameworks don't need entry point updates for Zustand
  }

  updateNextjsMainPage(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    let pagePath;

    if (userChoices.nextRouting === "app") {
      pagePath = path.join(projectPath, "app", `page.${extensions.component}`);
    } else {
      pagePath = path.join(
        projectPath,
        "pages",
        `index.${extensions.component}`
      );
    }

    if (!fs.existsSync(pagePath)) return;

    let content = fs.readFileSync(pagePath, "utf-8");
    let updatedContent;

    // Add 'use client' directive if needed for app router
    if (
      userChoices.nextRouting === "app" &&
      !content.includes("'use client'")
    ) {
      content = "'use client';\n\n" + content;
    }

    // Add Counter import if needed
    if (!content.includes("import { Counter }")) {
      const importStatement =
        "import { Counter } from '../components/Counter';\n";

      if (content.includes("import")) {
        const lastImportIndex = content.lastIndexOf("import");
        const endOfImportIndex = content.indexOf("\n", lastImportIndex) + 1;
        updatedContent =
          content.slice(0, endOfImportIndex) +
          importStatement +
          content.slice(endOfImportIndex);
      } else {
        updatedContent = content.startsWith("'use client'")
          ? content.replace(
              "'use client';\n\n",
              "'use client';\n\n" + importStatement
            )
          : importStatement + content;
      }
    } else {
      updatedContent = content;
    }

    // Add Counter component to JSX if not already there
    if (!updatedContent.includes("<Counter")) {
      if (userChoices.nextRouting === "app") {
        updatedContent = updatedContent.replace(
          /(<main.*?>)([\s\S]*?)(<\/main>)/,
          "$1$2<Counter />\n$3"
        );
      } else {
        if (updatedContent.includes("<main")) {
          updatedContent = updatedContent.replace(
            /(<main.*?>)([\s\S]*?)(<\/main>)/,
            "$1$2<Counter />\n$3"
          );
        } else {
          updatedContent = updatedContent.replace(
            /(<div.*?>)([\s\S]*?)(<\/div>)/,
            "$1$2<Counter />\n$3"
          );
        }
      }
    }

    fs.writeFileSync(pagePath, updatedContent);
  }

  // Counter component handlers for Zustand
  getDecrementHandler() {
    return "decrement";
  }

  getIncrementHandler() {
    return "increment";
  }

  getIncrementByAmountHandler() {
    return "() => incrementByAmount(5)";
  }

  getCountValue() {
    return "count";
  }
}
