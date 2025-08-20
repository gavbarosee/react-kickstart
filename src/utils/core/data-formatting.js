import chalk from "chalk";

/**
 * Data formatting utilities - format data for display and output
 */

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Format duration in human-readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Format package count
 * @param {number} count - Number of packages
 * @returns {string} - Formatted count
 */
export function formatPackageCount(count) {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}m`;
}

/**
 * Get status symbol for boolean values
 * @param {boolean} value - Boolean value
 * @returns {string} - Colored status symbol
 */
export function getStatusSymbol(value) {
  return value ? chalk.green("✓") : chalk.red("✗");
}

/**
 * Format item for summary display
 * @param {string} icon - Icon for the item
 * @param {string} label - Item label
 * @param {string} value - Item value
 * @param {string} description - Optional description
 * @returns {string} - Formatted item
 */
export function formatSummaryItem(icon, label, value, description = "") {
  const paddedLabel = `${icon} ${label}:`.padEnd(20);
  const descText = description ? chalk.gray(` → ${description}`) : "";
  return `${paddedLabel} ${value}${descText}`;
}

/**
 * Format section header
 * @param {string} title - Section title
 * @returns {string} - Formatted section header
 */
export function formatSectionHeader(title) {
  return chalk.cyan(`\n━━━━━━━━━━ ${title} ━━━━━━━━━━`);
}

/**
 * Format progress percentage
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @returns {string} - Formatted percentage
 */
export function formatProgress(current, total) {
  const percentage = Math.round((current / total) * 100);
  return `${percentage}%`;
}

/**
 * Format dependency list for display
 * @param {Array} dependencies - Array of dependency strings
 * @param {number} maxDisplay - Maximum number to display
 * @returns {Object} - Formatted dependencies with overflow info
 */
export function formatDependencyList(dependencies, maxDisplay = 3) {
  if (!Array.isArray(dependencies) || dependencies.length === 0) {
    return { displayed: [], remaining: 0, formattedList: "" };
  }

  const displayed = dependencies.slice(0, maxDisplay);
  const remaining = Math.max(0, dependencies.length - maxDisplay);

  const formattedList =
    displayed.join(", ") + (remaining > 0 ? ` (+${remaining} more)` : "");

  return {
    displayed,
    remaining,
    formattedList,
  };
}

/**
 * Format choice list for display
 * @param {Array} choices - Array of choice objects
 * @param {number} selectedIndex - Index of selected choice
 * @returns {string} - Formatted choice list
 */
export function formatChoiceList(choices, selectedIndex = -1) {
  return choices
    .map((choice, index) => {
      const isSelected = index === selectedIndex;
      const marker = isSelected ? chalk.green("▶") : " ";
      const text = isSelected ? chalk.bold(choice.name) : choice.name;
      const desc = choice.description
        ? chalk.gray(` - ${choice.description}`)
        : "";

      return `${marker} ${text}${desc}`;
    })
    .join("\n");
}

/**
 * Format error message with consistent styling
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {Array} suggestions - Array of suggestion strings
 * @returns {string} - Formatted error message
 */
export function formatErrorMessage(title, message, suggestions = []) {
  let output = ["", chalk.red(`✗ ${title}`), chalk.red(message)];

  if (suggestions.length > 0) {
    output.push("");
    output.push(chalk.cyan("Suggestions:"));
    suggestions.forEach((suggestion) => {
      output.push(chalk.cyan(`  • ${suggestion}`));
    });
  }

  output.push("");
  return output.join("\n");
}

/**
 * Format success message
 * @param {string} message - Success message
 * @returns {string} - Formatted success message
 */
export function formatSuccessMessage(message) {
  return chalk.green(`✓ ${message}`);
}

/**
 * Format warning message
 * @param {string} message - Warning message
 * @returns {string} - Formatted warning message
 */
export function formatWarningMessage(message) {
  return chalk.yellow(`⚠ ${message}`);
}

/**
 * Format info message
 * @param {string} message - Info message
 * @returns {string} - Formatted info message
 */
export function formatInfoMessage(message) {
  return chalk.blue(`ℹ ${message}`);
}

/**
 * Format command for display
 * @param {string} command - Command string
 * @returns {string} - Formatted command
 */
export function formatCommand(command) {
  return chalk.bold.cyan(command);
}

/**
 * Format file path for display
 * @param {string} filePath - File path
 * @returns {string} - Formatted file path
 */
export function formatFilePath(filePath) {
  return chalk.cyan(filePath);
}

/**
 * Format URL for display
 * @param {string} url - URL string
 * @returns {string} - Formatted URL
 */
export function formatUrl(url) {
  return chalk.blue.underline(url);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Pad text to specified width
 * @param {string} text - Text to pad
 * @param {number} width - Target width
 * @param {string} char - Padding character
 * @returns {string} - Padded text
 */
export function padText(text, width, char = " ") {
  return text.padEnd(width, char);
}

/**
 * Create a separator line
 * @param {number} length - Length of separator
 * @param {string} char - Character to use
 * @returns {string} - Separator line
 */
export function createSeparator(length = 50, char = "─") {
  return char.repeat(length);
}
