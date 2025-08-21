import fs from "fs-extra";
import path from "path";
import { BaseApiSetup } from "./base-api-setup.js";

/**
 * Axios-only setup implementation (no React Query)
 */
export class AxiosOnlySetup extends BaseApiSetup {
  constructor(framework) {
    super(framework, "axios-only");
  }

  /**
   * Create Axios client with interceptors
   */
  createApiClient(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const clientPath = path.join(
      directories.config,
      `api-client.${extensions.js}`
    );

    const clientContent = `import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: ${this.getApiUrlEnvVar()},
  timeout: ${this.getApiTimeoutEnvVar()},
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

    const todoContent = `import apiClient from '../config/api-client.${extensions.js}';

export const todoService = {
  /**
   * Get all todos
   */
  async getTodos() {
    const response = await apiClient.get('/todos');
    return response.data;
  },

  /**
   * Get todo by ID
   */
  async getTodoById(id) {
    const response = await apiClient.get(\`/todos/\${id}\`);
    return response.data;
  },

  /**
   * Create new todo
   */
  async createTodo(text) {
    const response = await apiClient.post('/todos', { text, completed: false });
    return response.data;
  },

  /**
   * Update todo
   */
  async updateTodo(id, updates) {
    const response = await apiClient.put(\`/todos/\${id}\`, updates);
    return response.data;
  },

  /**
   * Toggle todo completion
   */
  async toggleTodo(id) {
    const response = await apiClient.patch(\`/todos/\${id}/toggle\`);
    return response.data;
  },

  /**
   * Delete todo
   */
  async deleteTodo(id) {
    const response = await apiClient.delete(\`/todos/\${id}\`);
    return response.data;
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
   * No special entry point updates needed for Axios-only
   */
  updateEntryPoints(projectPath, userChoices) {
    // No additional setup needed for axios-only
  }
}
