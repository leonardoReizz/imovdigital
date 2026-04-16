# Project Rules

## Lessons

### API (Backend - NestJS)
- All API routes MUST include JWT authentication validation. Use `@UseGuards(JwtAuthGuard)` on controllers or routes. Never create unprotected endpoints unless explicitly requested.

### Frontend (Next.js / React)
- All forms MUST use `react-hook-form` with `zod` for validation. Always define a zod schema, infer the TypeScript type from it, and use `zodResolver` in `useForm()`. Never create forms with manual state management or unvalidated inputs.


# Project Memory (code-memory)

Before starting any task, read the files in `.ai-memory/` to understand the project structure.

- `.ai-memory/project-map.json` contains the full file map
- `.ai-memory/*.md` files contain module summaries with responsibilities

Always consult these files first instead of scanning the entire codebase. This saves tokens and gives you immediate context about the project architecture.
