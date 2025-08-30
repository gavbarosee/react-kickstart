### Adding a new API option

Extend API client choices (e.g., Fetch, Axios, React Query) by wiring two layers: feature selection and content generation.

## Where to plug in

- Generators and wiring:
  - `src/features/api-clients/*` — setup logic per API style
  - `src/features/api-clients/index.js` — exposes available API options

## Steps

1. Create a setup module

Create `src/features/api-clients/<your-api>-setup.js` exporting functions to write deps, scripts, and boilerplate.

```js
export function applyYourApiSetup(context) {
  // add dependencies, files, and any config
}
```

2. Export in the API management index

Update `src/features/api-clients/index.js` to export your setup.

3. Register the option in the feature layer

Update `src/features/api-clients/index.js` to include a new option with an `id`, `label`, and handler that calls your setup.

4. Ensure templates

If your API needs starter files, add them via the template engine (`src/templates/*`) or generator helpers.

## Verification

- Unit tests: cover the option exposure and minimal wiring.
- QA automation: run `npm run qa:critical` to ensure generated projects install and build with the new API.

## Full example: Add `ky` (tiny HTTP client) as an API option

Goal: Add `ky` as `ky-only` and optionally `ky-react-query` variants, aligned with the existing base/setup pattern.

### 1) Implementation: setup classes

Create `src/features/api-clients/ky-only-setup.js`:

```js
import fs from "fs-extra";
import path from "path";
import { BaseApiSetup } from "./base-api-setup.js";

export class KyOnlySetup extends BaseApiSetup {
  constructor(framework) {
    super(framework, "ky-only");
  }

  createApiClient(dirs, userChoices) {
    const ext = this.getExtensions(userChoices).js;
    const client = `import ky from 'ky';
const api = ky.create({
  prefixUrl: ${this.getApiUrlEnvVar()},
  timeout: Number(${this.getApiTimeoutEnvVar()}),
});
export default api;`;
    fs.writeFileSync(path.join(dirs.config, `client.${ext}`), client);
  }

  createServices(dirs, userChoices) {
    const ext = this.getExtensions(userChoices).js;
    const svc = `import api from '../config/client';
export async function getHealth(){
  return api.get('health').json();
}`;
    fs.writeFileSync(path.join(dirs.services, `health-service.${ext}`), svc);
  }

  createHooks() {
    /* not used for ky-only */
  }

  updateEntryPoints(projectPath, userChoices) {
    // No UI integration needed for plain ky; left intentionally minimal
  }
}
```

Optionally, `src/features/api-clients/ky-react-query-setup.js`:

```js
import fs from "fs-extra";
import path from "path";
import { BaseApiSetup } from "./base-api-setup.js";

export class KyReactQuerySetup extends BaseApiSetup {
  constructor(framework) {
    super(framework, "ky-react-query");
  }

  createApiClient(dirs, userChoices) {
    const ext = this.getExtensions(userChoices).js;
    const client = `import ky from 'ky';
const api = ky.create({
  prefixUrl: ${this.getApiUrlEnvVar()},
  timeout: Number(${this.getApiTimeoutEnvVar()}),
});
export default api;`;
    fs.writeFileSync(path.join(dirs.config, `client.${ext}`), client);
  }

  createServices(dirs, userChoices) {
    const ext = this.getExtensions(userChoices).js;
    const svc = `import api from '../config/client';
export async function getHealth(){
  return api.get('health').json();
}`;
    fs.writeFileSync(path.join(dirs.services, `health-service.${ext}`), svc);
  }

  createHooks(dirs, userChoices) {
    const ext = this.getExtensions(userChoices).js;
    const hook = `import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../services/health-service';
export function useHealth(){
  return useQuery({ queryKey: ['health'], queryFn: getHealth });
}`;
    fs.writeFileSync(path.join(dirs.hooks, `use-health.${ext}`), hook);
  }

  updateEntryPoints(projectPath, userChoices) {
    // Example: wrap App with QueryClientProvider (left to existing React Query setups)
  }
}
```

### 2) Register in the factory

Update `src/features/api-clients/index.js`:

```js
import { KyOnlySetup } from "./ky-only-setup.js";
import { KyReactQuerySetup } from "./ky-react-query-setup.js";

export function createApiSetup(apiType, framework) {
  switch (apiType) {
    case "ky-only":
      return new KyOnlySetup(framework);
    case "ky-react-query":
      return new KyReactQuerySetup(framework);
    // existing cases ...
  }
}
```

### 3) Expose in the feature selection

Add choices in `src/features/api-clients/index.js` or the relevant step so users can pick `ky-only` or `ky-react-query`.

### 4) Verify

Generate a project with `ky-only`, confirm `.env` variables are created and `getHealth()` works against your API; run QA.
