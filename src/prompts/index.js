// Re-export main functions for backwards compatibility
export { promptUser, getDefaultChoices } from "../prompts.js";

// Export new architecture components for advanced usage
export { PromptFlow } from "./prompt-flow.js";
export { PromptRenderer } from "./ui/prompt-renderer.js";
export { StepNavigator } from "./navigation/step-navigator.js";

// Export all step classes
export { BaseStep } from "./steps/base-step.js";
export { PackageManagerStep } from "./steps/package-manager-step.js";
export { FrameworkStep } from "./steps/framework-step.js";
export { NextjsOptionsStep } from "./steps/nextjs-options-step.js";
export { RoutingStep } from "./steps/routing-step.js";
export { LanguageStep } from "./steps/language-step.js";
export { CodeQualityStep } from "./steps/code-quality-step.js";
export { StylingStep } from "./steps/styling-step.js";
export { StateManagementStep } from "./steps/state-management-step.js";
export { GitStep } from "./steps/git-step.js";
export { EditorStep } from "./steps/editor-step.js";
