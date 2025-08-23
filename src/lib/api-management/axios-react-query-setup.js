import fs from "fs-extra";
import path from "path";

import { BaseApiSetup } from "./base-api-setup.js";

/**
 * Axios + React Query setup implementation
 */
export class AxiosReactQuerySetup extends BaseApiSetup {
  constructor(framework) {
    super(framework, "axios-react-query");
  }

  /**
   * Create Axios client with interceptors
   */
  createApiClient(directories, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const clientPath = path.join(directories.config, `api-client.${extensions.js}`);

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
      `todo-service.${extensions.js}`,
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
   * Create React Query hooks
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

  /**
   * Create React Query client setup
   */
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

  /**
   * Create todo hooks
   */
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
   * Update entry points to include React Query provider
   */
  updateEntryPoints(projectPath, userChoices) {
    if (this.framework === "nextjs") {
      this.updateNextjsApp(projectPath, userChoices);
    } else {
      this.updateViteMain(projectPath, userChoices);
    }
  }

  /**
   * Update Next.js _app file
   */
  updateNextjsApp(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const appPath = path.join(projectPath, "src", "pages", `_app.${extensions.jsx}`);

    if (fs.existsSync(appPath)) {
      let appContent = fs.readFileSync(appPath, "utf8");

      // Add imports at the top
      const imports = `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../api/config/query-client.${extensions.js}';

`;

      // Add imports before existing imports
      appContent = imports + appContent;

      // Wrap the component with QueryClientProvider
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

  /**
   * Update Vite main file
   */
  updateViteMain(projectPath, userChoices) {
    const extensions = this.getExtensions(userChoices);
    const mainPath = path.join(projectPath, "src", `main.${extensions.jsx}`);

    if (fs.existsSync(mainPath)) {
      let mainContent = fs.readFileSync(mainPath, "utf8");

      // Add imports at the top
      const imports = `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './api/config/query-client.${extensions.js}';

`;

      // Add imports before existing imports
      mainContent = imports + mainContent;

      // Wrap the App component with QueryClientProvider
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
