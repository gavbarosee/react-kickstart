import fs from "fs-extra";
import path from "path";
import { BaseApiSetup } from "./base-api-setup.js";

/**
 * Fetch-only setup implementation (no React Query)
 */
export class FetchOnlySetup extends BaseApiSetup {
  constructor(framework) {
    super(framework, "fetch-only");
  }

  /**
   * Create Fetch-based API client
   */
  createApiClient(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const clientPath = path.join(
      directories.config,
      `api-client.${extensions.js}`
    );

    const clientContent = `// API client using native fetch
const API_BASE_URL = ${this.getApiUrlEnvVar()};
const API_TIMEOUT = ${this.getApiTimeoutEnvVar()};

/**
 * Enhanced fetch with timeout and error handling
 */
async function fetchWithConfig(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  const config = {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(\`\${API_BASE_URL}\${url}\`, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * API client methods
 */
export const apiClient = {
  async get(url) {
    const response = await fetchWithConfig(url);
    return response.json();
  },

  async post(url, data) {
    const response = await fetchWithConfig(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(url, data) {
    const response = await fetchWithConfig(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async patch(url, data) {
    const response = await fetchWithConfig(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(url) {
    const response = await fetchWithConfig(url, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export default apiClient;
`;

    fs.writeFileSync(clientPath, clientContent);
  }

  /**
   * Create service files
   */
  createServices(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);

    // Create todo service
    this.createTodoService(directories, userChoices, extensions);

    // Create services index
    this.createServicesIndex(directories, userChoices, extensions);
  }

  /**
   * Create todo service
   */
  createTodoService(directories, userChoices, extensions) {
    const todoServicePath = path.join(
      directories.services,
      `todo-service.${extensions.js}`
    );

    const todoContent = `import { apiClient } from '../config/api-client.${extensions.js}';

export const todoService = {
  /**
   * Get all todos
   */
  async getTodos() {
    return apiClient.get('/todos');
  },

  /**
   * Get todo by ID
   */
  async getTodoById(id) {
    return apiClient.get(\`/todos/\${id}\`);
  },

  /**
   * Create new todo
   */
  async createTodo(text) {
    return apiClient.post('/todos', { text, completed: false });
  },

  /**
   * Update todo
   */
  async updateTodo(id, updates) {
    return apiClient.put(\`/todos/\${id}\`, updates);
  },

  /**
   * Toggle todo completion
   */
  async toggleTodo(id) {
    return apiClient.patch(\`/todos/\${id}/toggle\`);
  },

  /**
   * Delete todo
   */
  async deleteTodo(id) {
    return apiClient.delete(\`/todos/\${id}\`);
  },
};
`;

    fs.writeFileSync(todoServicePath, todoContent);
  }

  /**
   * Create services index file
   */
  createServicesIndex(directories, userChoices, extensions) {
    const indexPath = path.join(directories.services, `index.${extensions.js}`);

    const indexContent = `// API Services
export { todoService } from './todo-service.${extensions.js}';

// Add your own services here following the same pattern
// export { myService } from './my-service.${extensions.js}';
`;

    fs.writeFileSync(indexPath, indexContent);
  }

  /**
   * Create custom hooks for state management (without React Query)
   */
  createHooks(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);

    // Create basic todo hooks
    this.createTodoHooks(directories, userChoices, extensions);

    // Create hooks index
    this.createHooksIndex(directories, userChoices, extensions);
  }

  /**
   * Create basic todo hooks without React Query
   */
  createTodoHooks(directories, userChoices, extensions) {
    const todoHooksPath = path.join(
      directories.hooks,
      `use-todos.${extensions.js}`
    );

    const todoHooksContent = `import { useState } from 'react';
import { todoService } from '../services/todo-service.${extensions.js}';

export function useTodos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTodos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await todoService.getTodos();
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const createTodo = async (text) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await todoService.createTodo(text);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const updateTodo = async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await todoService.updateTodo(id, updates);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const toggleTodo = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await todoService.toggleTodo(id);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const deleteTodo = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await todoService.deleteTodo(id);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  return {
    getTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    loading,
    error,
  };
}
`;

    fs.writeFileSync(todoHooksPath, todoHooksContent);
  }

  /**
   * Create hooks index file
   */
  createHooksIndex(directories, userChoices, extensions) {
    const indexPath = path.join(directories.hooks, `index.${extensions.js}`);

    const indexContent = `// API Hooks
export * from './use-todos.${extensions.js}';

// Add your own hooks here following the same pattern
// export * from './use-my-feature.${extensions.js}';
`;

    fs.writeFileSync(indexPath, indexContent);
  }

  /**
   * No special entry point updates needed for fetch-only
   */
  updateEntryPoints(projectPath, userChoices) {
    // No additional setup needed for fetch-only
  }
}
