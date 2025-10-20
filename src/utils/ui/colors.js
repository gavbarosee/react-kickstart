/**
 * Centralized color palette
 */

export const COLORS = {
  // Text Hierarchy (Slate tones)
  text: {
    primary: "#f1f5f9", // Brightest text - headers, important info
    secondary: "#e2e8f0", // Main content text
    tertiary: "#cbd5e1", // Step numbers, less prominent text
    muted: "#94a3b8", // Section headers, labels
    dim: "#64748b", // Muted/secondary information
  },

  // UI Elements
  ui: {
    separator: "#475569", // Dividers and separators
  },

  // Status Colors
  status: {
    success: "#00ff00", // Success states, checkmarks, "Yes" (chalk.green equivalent)
    error: "#ff0000", // Errors, red crosses
    warning: "#fb923c", // Warnings, caution states
  },

  // Accent Colors
  accent: {
    cyan: "#22d3ee", // Links, suggestions, info, highlights
    cyanDark: "#06b6d4", // Brand accent, section headers
    reactCyan: "#61DAFB", // Official React brand color
  },
};

/**
 * Helper function to get chalk color function for a color path
 * Usage: getColor('text.primary') or getColor('accent.cyan')
 */
export function getColor(path) {
  const keys = path.split(".");
  let value = COLORS;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      throw new Error(`Color path "${path}" not found in COLORS`);
    }
  }

  return value;
}
