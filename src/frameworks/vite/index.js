// Vite framework plugin
export { ViteGenerator } from "./vite-generator.js";

// Framework metadata
export const VITE_METADATA = {
  name: "vite",
  displayName: "Vite",
  description: "Next Generation Frontend Tooling",
  supportedFeatures: [
    "typescript",
    "tailwind",
    "styled-components",
    "react-router",
    "redux",
    "zustand",
    "linting",
  ],
  defaultOptions: {},
};
