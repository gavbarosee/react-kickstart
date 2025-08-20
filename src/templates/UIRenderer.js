import { TemplateEngine } from "./TemplateEngine.js";

/**
 * Specialized UI renderer for console output
 */
export class UIRenderer {
  constructor(theme = "default") {
    this.engine = new TemplateEngine(theme);
  }

  /**
   * Render main application header
   */
  header(title, options = {}) {
    return this.engine.renderUI("header", title, options);
  }

  /**
   * Render section header
   */
  section(title, icon = null, options = {}) {
    return this.engine.renderUI("section", title, icon, options);
  }

  /**
   * Render step section with items
   */
  stepSection(emoji, title, items = []) {
    return this.engine.renderUI("stepSection", emoji, title, items);
  }

  /**
   * Render progress bar
   */
  progressBar(percentage, label = "", options = {}) {
    return this.engine.renderUI("progressBar", percentage, label, options);
  }

  /**
   * Render status item
   */
  statusItem(icon, label, value, description = "") {
    return this.engine.renderUI("statusItem", icon, label, value, description);
  }

  /**
   * Render error message
   */
  errorMessage(title, message, suggestions = []) {
    return this.engine.renderUI("errorMessage", title, message, suggestions);
  }

  /**
   * Render step indicator
   */
  stepIndicator(currentStep, totalSteps, stepTitle, icon = null) {
    const theme = this.engine.getTheme();
    const stepIcon = icon || theme.icons.step;

    const output = [
      "",
      theme.colors.primary.bold(
        ` ${stepIcon} STEP ${currentStep} OF ${totalSteps}`
      ),
      theme.colors.text(` ${stepTitle}`),
      theme.colors.primary(theme.layout.dividerChar.repeat(40)),
      "",
    ].join("\n");

    console.log(output);
    return output;
  }

  /**
   * Render summary with formatted sections
   */
  summary(title, sections = []) {
    const theme = this.engine.getTheme();
    let output = this.engine.render("header", title);

    sections.forEach((section) => {
      output +=
        "\n" + this.engine.render("section", section.title, section.icon);

      if (section.items) {
        section.items.forEach((item) => {
          output +=
            this.engine.render(
              "statusItem",
              item.icon,
              item.label,
              item.value,
              item.description
            ) + "\n";
        });
      }
    });

    console.log(output);
    return output;
  }

  /**
   * Render completion message
   */
  completion(projectName, stats = {}) {
    const theme = this.engine.getTheme();
    const {
      packageCount = 0,
      vulnerabilities = null,
      buildTime = null,
    } = stats;

    let output = [
      "",
      theme.colors.success.bold(
        `${theme.icons.success} Project ${projectName} created successfully!`
      ),
      "",
    ];

    if (packageCount > 0) {
      output.push(
        theme.colors.info(
          `${theme.icons.package} ${packageCount} packages installed`
        )
      );
    }

    if (vulnerabilities && vulnerabilities.length > 0) {
      output.push(
        theme.colors.warning(
          `${theme.icons.warning} ${vulnerabilities.length} security advisories found`
        )
      );
    }

    if (buildTime) {
      output.push(
        theme.colors.info(
          `${theme.icons.tools} Setup completed in ${buildTime}ms`
        )
      );
    }

    output.push("");

    const result = output.join("\n");
    console.log(result);
    return result;
  }

  /**
   * Render divider
   */
  divider(char = "·", length = 50) {
    const theme = this.engine.getTheme();
    const divider = "\n" + theme.colors.dim(char.repeat(length)) + "\n";
    console.log(divider);
    return divider;
  }

  /**
   * Render bullet list
   */
  bulletList(items, options = {}) {
    const theme = this.engine.getTheme();
    const { indent = 2, bullet = theme.icons.bullet } = options;
    const indentStr = " ".repeat(indent);

    const output = items
      .map((item) => {
        if (typeof item === "string") {
          return `${indentStr}${theme.colors.info(bullet)} ${item}`;
        } else {
          return `${indentStr}${theme.colors.info(bullet)} ${item.text}${
            item.description ? theme.colors.dim(` → ${item.description}`) : ""
          }`;
        }
      })
      .join("\n");

    console.log(output);
    return output;
  }

  /**
   * Render choice list for prompts
   */
  choiceList(choices, selectedIndex = -1) {
    const theme = this.engine.getTheme();

    const output = choices
      .map((choice, index) => {
        const isSelected = index === selectedIndex;
        const marker = isSelected ? theme.colors.primary("▶") : " ";
        const text = isSelected
          ? theme.colors.primary.bold(choice.name)
          : choice.name;
        const desc = choice.description
          ? theme.colors.dim(` - ${choice.description}`)
          : "";

        return `${marker} ${text}${desc}`;
      })
      .join("\n");

    console.log(output);
    return output;
  }

  /**
   * Render project structure tree
   */
  projectTree(structure, options = {}) {
    const theme = this.engine.getTheme();
    const { showFiles = true, indent = 0 } = options;
    const indentStr = "  ".repeat(indent);

    let output = "";

    structure.forEach((item, index) => {
      const isLast = index === structure.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const icon =
        item.type === "folder" ? theme.icons.folder : theme.icons.file;

      output += `${indentStr}${theme.colors.dim(connector)}${icon} ${
        item.name
      }\n`;

      if (item.children && item.children.length > 0) {
        output += this.projectTree(item.children, {
          ...options,
          indent: indent + 1,
        });
      }
    });

    if (indent === 0) {
      console.log(output);
    }

    return output;
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    this.engine.setTheme(theme);
  }

  /**
   * Get available themes
   */
  getAvailableThemes() {
    return this.engine.getAvailableThemes();
  }
}
