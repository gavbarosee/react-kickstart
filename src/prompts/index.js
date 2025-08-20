// Re-export main functions for backwards compatibility
export { promptUser, getDefaultChoices } from "../prompts.js";

// Export new architecture components for advanced usage
export { PromptFlow } from "./PromptFlow.js";
export { PromptRenderer } from "./ui/PromptRenderer.js";
export { StepNavigator } from "./navigation/StepNavigator.js";

// Export all step classes
export { BaseStep } from "./steps/BaseStep.js";
export { PackageManagerStep } from "./steps/PackageManagerStep.js";
export { FrameworkStep } from "./steps/FrameworkStep.js";
export { NextjsOptionsStep } from "./steps/NextjsOptionsStep.js";
export { RoutingStep } from "./steps/RoutingStep.js";
export { LanguageStep } from "./steps/LanguageStep.js";
export { CodeQualityStep } from "./steps/CodeQualityStep.js";
export { StylingStep } from "./steps/StylingStep.js";
export { StateManagementStep } from "./steps/StateManagementStep.js";
export { GitStep } from "./steps/GitStep.js";
export { EditorStep } from "./steps/EditorStep.js";
