import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

/**
 * Centralized template engine for UI rendering and file generation
 */
export class TemplateEngine {
  constructor(theme = "default") {
    this.theme = theme;
    this.themes = new Map();
    this.templates = new Map();
    this.loadThemes();
    this.loadTemplates();
  }

  /**
   * Load available themes
   */
  loadThemes() {
    const defaultTheme = {
      colors: {
        primary: chalk.cyan,
        secondary: chalk.blue,
        success: chalk.green,
        warning: chalk.yellow,
        error: chalk.red,
        info: chalk.gray,
        accent: chalk.magenta,
        text: chalk.white,
        dim: chalk.dim,
        bold: chalk.bold,
      },
      icons: {
        success: "✓",
        error: "x",
        warning: "!",
        info: "i",
        step: ">",
        bullet: "-",
        arrow: ">",
        folder: "",
        file: "",
        package: "",
        framework: "",
        language: "",
        styling: "",
        tools: "",
        git: "",
        editor: "",
        rocket: "",
        sparkles: "",
      },
      layout: {
        sectionWidth: 50,
        indentSize: 2,
        progressBarSize: 30,
        dividerChar: "━",
        bulletChar: "•",
      },
    };

    const modernTheme = {
      ...defaultTheme,
      colors: {
        primary: chalk.hex("#00D9FF"),
        secondary: chalk.hex("#1E40AF"),
        success: chalk.hex("#10B981"),
        warning: chalk.hex("#F59E0B"),
        error: chalk.hex("#EF4444"),
        info: chalk.hex("#6B7280"),
        accent: chalk.hex("#8B5CF6"),
        text: chalk.white,
        dim: chalk.dim,
        bold: chalk.bold,
      },
      icons: {
        ...defaultTheme.icons,
        success: "◉",
        error: "◯",
        step: "◆",
        bullet: "▸",
      },
    };

    const minimalTheme = {
      ...defaultTheme,
      colors: {
        primary: chalk.white,
        secondary: chalk.gray,
        success: chalk.green,
        warning: chalk.yellow,
        error: chalk.red,
        info: chalk.gray,
        accent: chalk.white,
        text: chalk.white,
        dim: chalk.dim,
        bold: chalk.bold,
      },
      icons: {
        success: "+",
        error: "-",
        warning: "!",
        info: "i",
        step: ">",
        bullet: "-",
        arrow: ">",
        folder: "",
        file: "",
        package: "",
        framework: "",
        language: "",
        styling: "",
        tools: "",
        git: "",
        editor: "",
        rocket: "",
        sparkles: "",
      },
      layout: {
        sectionWidth: 40,
        indentSize: 2,
        progressBarSize: 20,
        dividerChar: "-",
        bulletChar: "-",
      },
    };

    this.themes.set("default", defaultTheme);
    this.themes.set("modern", modernTheme);
    this.themes.set("minimal", minimalTheme);
  }

  /**
   * Load template definitions
   */
  loadTemplates() {
    // UI Templates
    this.templates.set("header", {
      type: "ui",
      render: (title, options = {}) => {
        const theme = this.getTheme();
        const { width = theme.layout.sectionWidth } = options;
        const divider = theme.layout.dividerChar.repeat(width);

        return [
          "",
          theme.colors.primary(divider),
          theme.colors.primary.bold(`  ${title}`),
          theme.colors.primary(divider),
          "",
        ].join("\n");
      },
    });

    this.templates.set("section", {
      type: "ui",
      render: (title, icon = null, options = {}) => {
        const theme = this.getTheme();
        const sectionIcon = icon || theme.icons.step;
        const { width = 40 } = options;

        return [
          "",
          theme.colors.primary.bold(` ${sectionIcon} ${title}`),
          theme.colors.primary(theme.layout.dividerChar.repeat(width)),
          "",
        ].join("\n");
      },
    });

    this.templates.set("stepSection", {
      type: "ui",
      render: (emoji, title, items = []) => {
        const theme = this.getTheme();
        let output = `  ${emoji} ${theme.colors.bold(title)}\n`;

        if (items && items.length > 0) {
          items.forEach((item) => {
            const label = item.label.padEnd(20);
            const description = item.description
              ? theme.colors.dim(`${theme.icons.success} ${item.description}`)
              : "";
            output += `     ${label} ${description}\n`;
          });
        }

        return output + "\n";
      },
    });

    this.templates.set("progressBar", {
      type: "ui",
      render: (percentage, label = "", options = {}) => {
        const theme = this.getTheme();
        const { size = theme.layout.progressBarSize } = options;
        const displayPercentage = Math.max(0, percentage);

        const filled = Math.round((displayPercentage / 100) * size);
        const empty = size - filled;

        // Simple white progress bar
        let bar = "";
        if (filled > 0) {
          bar += chalk.white("█".repeat(filled));
        }

        // Add empty portion
        bar += theme.colors.dim("░".repeat(empty));

        // Clean minimal text
        const enhancedLabel = chalk.white(label);
        const percentText =
          percentage === 100
            ? chalk.green(`${percentage}%`)
            : chalk.white(`${percentage}%`);

        return `${bar} ${percentText} ${enhancedLabel}`;
      },
    });

    this.templates.set("statusItem", {
      type: "ui",
      render: (icon, label, value, description = "") => {
        const theme = this.getTheme();
        const paddedLabel = `${icon} ${label}:`.padEnd(20);
        const descText = description ? theme.colors.dim(` → ${description}`) : "";
        return `${paddedLabel} ${value}${descText}`;
      },
    });

    this.templates.set("errorMessage", {
      type: "ui",
      render: (title, message, suggestions = []) => {
        const theme = this.getTheme();
        let output = [
          "",
          theme.colors.error(`${theme.icons.error} ${title}`),
          theme.colors.error(message),
        ];

        if (suggestions.length > 0) {
          output.push("");
          output.push(theme.colors.info("Suggestions:"));
          suggestions.forEach((suggestion) => {
            output.push(theme.colors.info(`  ${theme.icons.bullet} ${suggestion}`));
          });
        }

        output.push("");
        return output.join("\n");
      },
    });

    // File Templates
    this.templates.set("reactComponent", {
      type: "file",
      render: (componentName, options = {}) => {
        const {
          typescript = false,
          styling = "css",
          className = "",
          children = "",
          imports = [],
          exports = "default",
        } = options;

        const ext = typescript ? "tsx" : "jsx";
        const reactImport = typescript ? "import React from 'react';" : "";
        const additionalImports = imports.map((imp) => `import ${imp};`).join("\n");

        let component = `${reactImport}
${additionalImports}

export ${exports === "default" ? "default " : ""}function ${componentName}() {
  return (
    <div${className ? ` className="${className}"` : ""}>
      ${children || `<h1>Welcome to ${componentName}</h1>`}
    </div>
  );
}`;

        if (exports === "named") {
          component += `\n\nexport { ${componentName} };`;
        }

        return component.trim();
      },
    });

    this.templates.set("htmlFile", {
      type: "file",
      render: (projectName, options = {}) => {
        const { framework = "vite", typescript = false, entryPoint = "main" } = options;

        const ext = typescript ? "tsx" : "jsx";
        const scriptSrc =
          framework === "vite" ? `/src/${entryPoint}.${ext}` : `/${entryPoint}.js`;

        return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
      },
    });

    this.templates.set("packageJson", {
      type: "file",
      render: (projectName, options = {}) => {
        const {
          framework = "vite",
          dependencies = {},
          devDependencies = {},
          scripts = {},
          description = `A React application built with ${framework}`,
        } = options;

        return JSON.stringify(
          {
            name: projectName,
            private: true,
            version: "0.0.0",
            type: "module",
            description,
            scripts,
            dependencies,
            devDependencies,
          },
          null,
          2,
        );
      },
    });
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.themes.get(this.theme) || this.themes.get("default");
  }

  /**
   * Set active theme
   */
  setTheme(themeName) {
    if (this.themes.has(themeName)) {
      this.theme = themeName;
    } else {
      throw new Error(`Theme '${themeName}' not found`);
    }
  }

  /**
   * Render a template
   */
  render(templateName, ...args) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return template.render(...args);
  }

  /**
   * Render and output UI template
   */
  renderUI(templateName, ...args) {
    const output = this.render(templateName, ...args);
    console.log(output);
    return output;
  }

  /**
   * Render and write file template
   */
  async renderFile(templateName, filePath, ...args) {
    const content = this.render(templateName, ...args);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    return content;
  }

  /**
   * Register a custom template
   */
  registerTemplate(name, template) {
    this.templates.set(name, template);
  }

  /**
   * Register a custom theme
   */
  registerTheme(name, theme) {
    this.themes.set(name, theme);
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return Array.from(this.themes.keys());
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Array.from(this.templates.keys());
  }

  /**
   * Create a themed renderer for specific UI elements
   */
  createRenderer(templateName) {
    return (...args) => this.render(templateName, ...args);
  }

  /**
   * Batch render multiple templates
   */
  renderBatch(templates) {
    const results = {};
    templates.forEach(({ name, templateName, args = [] }) => {
      results[name] = this.render(templateName, ...args);
    });
    return results;
  }
}
