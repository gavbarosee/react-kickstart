### Templates and generators

How the CLI writes files and content for different frameworks and options.

## Key modules

- `src/templates/*` — reusable templates and template engines
- `src/templates/content/*` — content generators per framework
- `src/features/*` — feature setup and integration modules

## Flow

1. The prompt flow collects answers.
2. A framework generator (e.g., Vite/Next.js) is selected.
3. Feature setups (routing, state, styling, api, testing) are applied.
4. The template engine writes files with placeholders filled from context.

## Adding a template

- Create a template file under `src/templates/`.
- Register it in the relevant content generator.
- Use placeholders that map to the generation context (answers, derived paths).

## Tips

- Keep templates small and composable; prefer many focused templates over monoliths.
- Avoid logic in templates; put logic in generators and pass computed values in context.
