/**
 * Abstract base class for content generation strategies
 * Defines the interface and common functionality for all content generators
 */
export class BaseContentGenerator {
  constructor(framework, routingType = null) {
    this.framework = framework; // 'vite', 'nextjs'
    this.routingType = routingType; // 'app', 'pages' (for Next.js)
  }

  /**
   * Main content generation method - Template Method pattern
   */
  generateAppComponent(fileExt, stylingType, userChoices) {
    const componentStructure = this.getComponentStructure(
      stylingType,
      userChoices
    );
    const imports = this.generateImports(stylingType, userChoices);
    const styles = this.generateStyles(stylingType, userChoices);
    const component = this.generateComponent(
      componentStructure,
      fileExt,
      userChoices
    );

    return `${imports}${styles}${component}`;
  }

  /**
   * Generate entry point content
   */
  generateEntryPoint(fileExt, userChoices) {
    const imports = this.generateEntryImports(fileExt, userChoices);
    const renderLogic = this.generateRenderLogic(userChoices);

    return `${imports}\n${renderLogic}`;
  }

  /**
   * Get component structure based on styling type
   */
  getComponentStructure(stylingType, userChoices) {
    const structures = {
      "styled-components": this.getStyledComponentsStructure(),
      tailwind: this.getTailwindStructure(),
      css: this.getCssStructure(),
    };

    return structures[stylingType] || structures.css;
  }

  // Abstract methods that must be implemented by subclasses
  generateImports(stylingType, userChoices) {
    throw new Error("generateImports must be implemented by subclass");
  }

  generateStyles(stylingType, userChoices) {
    throw new Error("generateStyles must be implemented by subclass");
  }

  generateComponent(structure, fileExt, userChoices) {
    throw new Error("generateComponent must be implemented by subclass");
  }

  generateEntryImports(fileExt, userChoices) {
    throw new Error("generateEntryImports must be implemented by subclass");
  }

  generateRenderLogic(userChoices) {
    throw new Error("generateRenderLogic must be implemented by subclass");
  }

  // Common structure definitions
  getStyledComponentsStructure() {
    return {
      type: "styled-components",
      hasContainer: true,
      hasTitle: true,
      hasButton: true,
      hasInteractivity: this.framework === "vite",
    };
  }

  getTailwindStructure() {
    return {
      type: "tailwind",
      hasContainer: true,
      hasTitle: true,
      hasButton: true,
      hasInteractivity: this.framework === "vite",
    };
  }

  getCssStructure() {
    return {
      type: "css",
      hasContainer: true,
      hasTitle: true,
      hasButton: true,
      hasInteractivity: this.framework === "vite",
    };
  }

  // Common utility methods
  getContainerStyles(stylingType) {
    const styles = {
      "styled-components": {
        vite: "max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center;",
        nextjs:
          "display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; text-align: center;",
      },
      tailwind: {
        vite: "max-w-4xl mx-auto p-8 text-center",
        nextjs: "flex min-h-screen flex-col items-center justify-center p-8",
      },
      css: {
        vite: "container",
        nextjs: "container",
      },
    };

    return styles[stylingType]?.[this.framework] || styles.css.vite;
  }

  getTitleStyles(stylingType) {
    const styles = {
      "styled-components": "font-size: 2.5rem; margin-bottom: 1rem;",
      tailwind: "text-4xl font-bold mb-4",
      css: "",
    };

    return styles[stylingType] || "";
  }

  getButtonStyles(stylingType) {
    const styles = {
      "styled-components": {
        vite: "border-radius: 8px; border: 1px solid transparent; padding: 0.6em 1.2em; font-size: 1em; font-weight: 500; background-color: #1a1a1a; color: white; cursor: pointer; transition: border-color 0.25s; &:hover { border-color: #646cff; }",
        nextjs:
          "background-color: #0070f3; color: white; font-weight: bold; border: none; border-radius: 4px; padding: 0.5rem 1rem; cursor: pointer; transition: background-color 0.3s ease; &:hover { background-color: #0051a2; }",
      },
      tailwind:
        "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
      css: "",
    };

    return styles[stylingType]?.[this.framework] || styles[stylingType] || "";
  }

  getProjectTitle() {
    return this.framework === "vite" ? "React Kickstart" : "Welcome to Next.js";
  }

  getEditInstructions(fileExt) {
    if (this.framework === "vite") {
      return `Edit <code>src/App.${fileExt}</code> and save to test HMR`;
    } else if (this.routingType === "app") {
      return `Edit <code>app/page.${fileExt}</code> to get started`;
    } else {
      return `Get started by editing <code>pages/index.${fileExt}</code>`;
    }
  }
}
