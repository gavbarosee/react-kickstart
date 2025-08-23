import fs from "fs-extra";
import path from "path";

import { BaseApiSetup } from "./base-api-setup.js";

/**
 * Fetch + React Query setup implementation
 */
export class FetchReactQuerySetup extends BaseApiSetup {
  constructor(framework) {
    super(framework, "fetch-react-query");
  }

  /**
   * Create Fetch-based API client
   */
  createApiClient(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const clientPath = path.join(directories.config, `api-client.${extensions.js}`);

    const clientContent = `// API client using native fetch
const API_BASE_URL = ${this.getApiUrlEnvVar()};
const API_TIMEOUT = ${this.getApiTimeoutEnvVar()};

/**
 * Enhanced fetch with timeout and auth headers
 */
async function fetchWithConfig(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: \`Bearer \${token}\` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(\`\${API_BASE_URL}\${url}\`, config);
    clearTimeout(timeoutId);

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      // Optionally redirect to login
      // window.location.href = '/login';
    }

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
   * Create service files (same structure as Axios but using fetch client)
   */
  createServices(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);

    // Create todo service
    this.createTodoService(directories, userChoices, extensions);

    // Create services index
    this.createServicesIndex(directories, userChoices, extensions);
  }

  createTodoService(directories, userChoices, extensions) {
    const todoServicePath = path.join(
      directories.services,
      `todo-service.${extensions.js}`,
    );

    const todoContent = `import { apiClient } from '../config/api-client.${extensions.js}';

export const todoService = {
  async getTodos() {
    return apiClient.get('/todos');
  },

  async getTodoById(id) {
    return apiClient.get(\`/todos/\${id}\`);
  },

  async createTodo(text) {
    return apiClient.post('/todos', { text, completed: false });
  },

  async updateTodo(id, updates) {
    return apiClient.put(\`/todos/\${id}\`, updates);
  },

  async toggleTodo(id) {
    return apiClient.patch(\`/todos/\${id}/toggle\`);
  },

  async deleteTodo(id) {
    return apiClient.delete(\`/todos/\${id}\`);
  },
};
`;

    fs.writeFileSync(todoServicePath, todoContent);
  }

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
   * Create React Query hooks (same as Axios version but using fetch services)
   */
  createHooks(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);

    // Create query client setup
    this.createQueryClient(directories, userChoices, extensions);

    // Create todo hooks
    this.createTodoHooks(directories, userChoices, extensions);

    // Create hooks index
    this.createHooksIndex(directories, userChoices, extensions);
  }

  createQueryClient(directories, userChoices, extensions) {
    const queryClientPath = path.join(
      directories.config,
      `query-client.${extensions.js}`,
    );

    const queryClientContent = `import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
`;

    fs.writeFileSync(queryClientPath, queryClientContent);
  }

  createTodoHooks(directories, userChoices, extensions) {
    const todoHooksPath = path.join(directories.hooks, `use-todos.${extensions.js}`);

    const todoHooksContent = `import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { todoService } from '../services/todo-service.${extensions.js}';

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: todoService.getTodos,
  });
}

export function useTodo(id) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todoService.getTodoById(id),
    enabled: !!id,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoService.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => todoService.updateTodo(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', id] });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoService.toggleTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoService.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
`;

    fs.writeFileSync(todoHooksPath, todoHooksContent);
  }

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
   * Update entry points to include React Query provider (same as Axios version)
   */
  updateEntryPoints(projectPath, userChoices) {
    if (this.framework === "nextjs") {
      this.updateNextjsApp(projectPath, userChoices);
    } else {
      this.updateViteMain(projectPath, userChoices);
    }
  }

  updateNextjsApp(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const appPath = path.join(projectPath, "src", "pages", `_app.${extensions.jsx}`);

    if (fs.existsSync(appPath)) {
      let appContent = fs.readFileSync(appPath, "utf8");

      const imports = `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../api/config/query-client.${extensions.js}';

`;

      appContent = imports + appContent;

      appContent = appContent.replace(
        /return\s*<Component\s*{\.\.\.pageProps}\s*\/>/,
        `return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )`,
      );

      fs.writeFileSync(appPath, appContent);
    }
  }

  updateViteMain(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const mainPath = path.join(projectPath, "src", `main.${extensions.jsx}`);

    if (fs.existsSync(mainPath)) {
      let mainContent = fs.readFileSync(mainPath, "utf8");

      const imports = `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './api/config/query-client.${extensions.js}';

`;

      mainContent = imports + mainContent;

      mainContent = mainContent.replace(
        /<App\s*\/>/,
        `<QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>`,
      );

      fs.writeFileSync(mainPath, mainContent);
    }
  }
}
