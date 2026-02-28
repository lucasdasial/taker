# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start server with hot reload (tsx watch)
npm run lint         # Check lint and formatting
npm run lint:fix     # Auto-fix lint and formatting issues

npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Apply pending migrations
npm run db:studio    # Open Drizzle Studio GUI
```

Requires a `.env` file based on `.env.example`. PostgreSQL can be started with `docker compose up -d`.

## Architecture

The project is a REST API for personal expense tracking, currently with user auth implemented.

**Stack:** Express 5, Drizzle ORM + PostgreSQL, Zod, JWT (jsonwebtoken), bcryptjs, Pino.

**Request flow:** `main.ts` → `server.ts` (middleware stack) → `routes.ts` → controller → service → repository

### Layer responsibilities

- **`src/config/`** — Environment variables (`envs.ts`) and JWT sign/verify helpers (`jwt.ts`)
- **`src/db/`** — Drizzle client singleton (`index.ts`) and schema definitions (`schema/`)
- **`src/modules/<name>/`** — Business domain modules, each with:
  - `*.repository.ts` — data access only (Drizzle queries)
  - `*.service.ts` — business logic, receives repository via constructor injection
- **`src/web/controllers/`** — Classes with arrow function methods (preserves `this` when passed as Express callbacks). Validate input with Zod, delegate to service.
- **`src/web/middlewares/`** — `authenticate.ts` (JWT → `req.body.userId`), `errorHandler.ts`, `logger.ts`, `timeout.ts` (3s limit)
- **`src/web/errors/`** — `AppError` base class; `ValidationError` (422, wraps Zod errors); `ResourceNotFoundError` (404)
- **`src/web/routes.ts`** — Composes dependencies and registers routes. Public routes and authenticated routes (behind `authenticate` middleware) are separate functions.

### Adding a new module

1. Create `src/db/schema/<name>.ts` with Drizzle table definition, then run `db:generate` + `db:migrate`
2. Create `src/modules/<name>/<name>.repository.ts` and `<name>.service.ts`
3. Create `src/web/controllers/<name>.controller.ts` as a class with arrow function methods
4. Register in `src/web/routes.ts` (instantiate repository → service → controller, add routes)

### Error handling convention

Throw `AppError` subclasses from services; the `errorHandler` middleware catches and formats them. Unknown errors return 500 (with full message in development, generic in production).

## Code style

Biome is the formatter and linter (`biome.json`). Indentation is **tabs**, quotes are **double**. Import organization is automatic. Controllers use `import type` for type-only imports.
