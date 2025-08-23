import { AxiosOnlySetup } from "./axios-only-setup.js";
import { AxiosReactQuerySetup } from "./axios-react-query-setup.js";
import { FetchOnlySetup } from "./fetch-only-setup.js";
import { FetchReactQuerySetup } from "./fetch-react-query-setup.js";

/**
 * Factory function for creating API setup instances
 */
export function createApiSetup(apiType, framework) {
  switch (apiType) {
    case "axios-react-query":
      return new AxiosReactQuerySetup(framework);
    case "axios-only":
      return new AxiosOnlySetup(framework);
    case "fetch-react-query":
      return new FetchReactQuerySetup(framework);
    case "fetch-only":
      return new FetchOnlySetup(framework);
    default:
      throw new Error(`Unknown API type: ${apiType}`);
  }
}

/**
 * Main setup function that delegates to appropriate implementation
 */
export function setupApiManagement(projectPath, userChoices, framework) {
  if (userChoices.api === "none") return;

  const apiSetup = createApiSetup(userChoices.api, framework);
  apiSetup.setup(projectPath, userChoices);
}

// Export the classes for direct use if needed
export { AxiosReactQuerySetup, AxiosOnlySetup, FetchReactQuerySetup, FetchOnlySetup };
export { BaseApiSetup } from "./base-api-setup.js";
