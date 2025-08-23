import fs from "fs-extra";
import path from "path";

import { CORE_UTILS } from "../../utils/index.js";

/**
 * Abstract base class for API setup
 * Handles common API setup logic across different configurations
 */
export class BaseApiSetup {
  constructor(framework, apiType) {
    this.framework = framework; // 'standard' or 'nextjs'
    this.apiType = apiType; // 'axios-react-query', 'axios-only', 'fetch-react-query'
  }

  /**
   * Main setup method - Template Method pattern
   */
  setup(projectPath, userChoices) {
    if (userChoices.api === "none" || userChoices.api !== this.apiType) return;

    // Step 1: Create directory structure
    const directories = this.createDirectoryStructure(projectPath, userChoices);

    // Step 2: Create API client files
    this.createApiClient(directories, userChoices);

    // Step 3: Create service files
    this.createServices(directories, userChoices);

    // Step 4: Create hooks (if using React Query)
    if (this.hasReactQuery()) {
      this.createHooks(directories, userChoices);
    }

    // Step 5: Create environment file
    this.createEnvironmentFile(projectPath, userChoices);

    // Step 6: Update entry points
    this.updateEntryPoints(projectPath, userChoices);
  }

  /**
   * Create API directory structure
   */
  createDirectoryStructure(projectPath, userChoices) {
    const srcPath = path.join(projectPath, "src");
    const apiPath = path.join(srcPath, "api");
    const servicesPath = path.join(apiPath, "services");
    const configPath = path.join(apiPath, "config");

    const directories = {
      src: srcPath,
      api: apiPath,
      services: servicesPath,
      config: configPath,
    };

    // Create hooks directory if using React Query
    if (this.hasReactQuery()) {
      directories.hooks = path.join(apiPath, "hooks");
    }

    // Create types directory if using TypeScript
    if (userChoices.language === "typescript") {
      directories.types = path.join(apiPath, "types");
    }

    // Ensure all directories exist
    Object.values(directories).forEach((dir) => {
      fs.ensureDirSync(dir);
    });

    return directories;
  }

  /**
   * Get file extensions based on language choice
   */
  getExtensions(userChoices) {
    const isTypeScript = userChoices.language === "typescript";
    return {
      js: isTypeScript ? "ts" : "js",
      jsx: isTypeScript ? "tsx" : "jsx",
    };
  }

  /**
   * Check if this setup includes React Query
   */
  hasReactQuery() {
    return this.apiType.includes("react-query");
  }

  /**
   * Check if this setup uses Axios
   */
  usesAxios() {
    return this.apiType.includes("axios");
  }

  /**
   * Create environment file with API configuration
   */
  createEnvironmentFile(projectPath, userChoices) {
    const envPath = path.join(projectPath, ".env");
    const envExamplePath = path.join(projectPath, ".env.example");

    const envContent =
      this.framework === "nextjs"
        ? this.getNextjsEnvContent()
        : this.getViteEnvContent();

    // Create .env file
    fs.writeFileSync(envPath, envContent);

    // Create .env.example file
    fs.writeFileSync(envExamplePath, envContent.replace(/=.*/g, "="));
  }

  /**
   * Get environment content for Next.js
   */
  getNextjsEnvContent() {
    return `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000
`;
  }

  /**
   * Get environment content for Vite
   */
  getViteEnvContent() {
    return `# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000
`;
  }

  /**
   * Get API URL environment variable name
   */
  getApiUrlEnvVar() {
    return this.framework === "nextjs"
      ? "process.env.NEXT_PUBLIC_API_URL"
      : "import.meta.env.VITE_API_URL";
  }

  /**
   * Get API timeout environment variable name
   */
  getApiTimeoutEnvVar() {
    return this.framework === "nextjs"
      ? "process.env.NEXT_PUBLIC_API_TIMEOUT"
      : "import.meta.env.VITE_API_TIMEOUT";
  }

  // Abstract methods to be implemented by subclasses
  createApiClient(directories, userChoices) {
    throw new Error("createApiClient must be implemented by subclass");
  }

  createServices(directories, userChoices) {
    throw new Error("createServices must be implemented by subclass");
  }

  createHooks(directories, userChoices) {
    throw new Error("createHooks must be implemented by subclass");
  }

  updateEntryPoints(projectPath, userChoices) {
    throw new Error("updateEntryPoints must be implemented by subclass");
  }
}
