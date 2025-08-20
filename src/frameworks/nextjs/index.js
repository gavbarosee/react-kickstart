// Next.js framework plugin
export { NextjsGenerator } from "./nextjs-generator.js";

// Export Next.js specific generators
export * from "./generators/app-router.js";
export * from "./generators/pages-router.js";

// Framework metadata
export const NEXTJS_METADATA = {
  name: "nextjs",
  displayName: "Next.js",
  description: "The React Framework for Production",
  supportedFeatures: [
    "typescript",
    "tailwind",
    "styled-components",
    "app-router",
    "pages-router",
    "redux",
    "zustand",
    "linting",
  ],
  defaultOptions: {
    nextRouting: "app",
  },
};
