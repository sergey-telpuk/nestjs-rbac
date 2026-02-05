# AGENTS.md

These are brief contribution notes for automated and human contributors working in this repo.

## Project intent
- This package provides RBAC helpers for NestJS, with a stable public API in `src/index.ts`.
- Keep changes backwards compatible unless explicitly requested.

## Coding guidelines
- Prefer explicit types for public interfaces and return values.
- Keep runtime behavior deterministic; avoid side effects in guards/services.
- Maintain ASCII-only text unless a file already contains non-ASCII.

## Tests
- Primary suites:
  - `npm test`
  - `npm run test:int`
  - `npm run test:e2e`
- If you change RBAC logic, add or update tests in `test/int` and `test/e2e`.

## Lint
- `npm run lint`
- `npm run lint:fix`

## Docker
- `docker-compose up --build` runs tests inside the container.

## Docs
- Update `README.md` when public behavior or examples change.
- Keep examples aligned with current interfaces.
