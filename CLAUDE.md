# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup
docker-compose up -d       # Start PostgreSQL
mix setup                  # Install deps + create + migrate DB

# Development
mix phx.server             # Start server at http://localhost:4000
iex -S mix phx.server      # Start with IEx shell

# Database
mix ecto.migrate           # Run pending migrations
mix ecto.rollback          # Rollback last migration
mix ecto.reset             # Drop and recreate DB
mix ecto.gen.migration name_using_underscores

# Quality
mix precommit              # compile + format + credo + test (run before finishing changes)
mix test                   # Run all tests
mix test test/path/to/test.exs  # Run specific file
mix test --failed          # Re-run only failed tests
```

## Architecture

Pure JSON API (no LiveView). Entry point is `lib/anotagasto_web/router.ex`.

**Contexts (business logic):**
- `Anotagasto.Accounts` — user registration and lookup
- `Anotagasto.Expenses` — expense CRUD, scoped to user
- `Anotagasto.Auth` — Guardian JWT pipeline, login schema

**Web layer:**
- `lib/anotagasto_web/controllers/` — controllers + JSON views (`*_json.ex`)
- `lib/anotagasto_web/plugs/auth_pipeline.ex` — Guardian pipeline (VerifyHeader → EnsureAuthenticated → LoadResource)
- `lib/anotagasto_web/plugs/set_current_user.ex` — copies Guardian resource into `conn.assigns.current_user`
- `lib/anotagasto_web/controllers/fallback_controller.ex` — catch-all error handler via `action_fallback`

**Auth flow:**
1. `POST /api/auth` hits `AuthController.login/2`
2. Validates params via `Auth.Login` changeset + `apply_action(:validate)`
3. On success, `Guardian.encode_and_sign/1` returns a Bearer token (TTL: 1 day)
4. Protected routes go through `AnotagastoWeb.Plugs.AuthPipeline` → `conn.assigns.current_user`

## Schemas & DB

All tables use `binary_id` (UUID) as primary key. Configure new schemas with:
```elixir
@primary_key {:id, :binary_id, autogenerate: true}
@foreign_key_type :binary_id
```

Foreign keys to `users` must declare `type: :binary_id`:
```elixir
references(:users, type: :binary_id, on_delete: :delete_all)
```

`Expense.direction` is `Ecto.Enum` with values `:in` / `:out`. `Expense.value` is `:decimal` (precision 10, scale 2).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `APP_SECRET` | Always | Guardian JWT secret — generate with `mix guardian.gen.secret` |
| `DATABASE_URL` | Prod only | `ecto://USER:PASS@HOST/DB` |
| `SECRET_KEY_BASE` | Prod only | Generate with `mix phx.gen.secret` |
| `PORT` | Optional | Default 4000 |

Dev uses `.env` (gitignored) with `export APP_SECRET=...`. The app raises at startup if `APP_SECRET` is missing (`Anotagasto.Auth.Guardian.secret_available?/0`).

## Workflow

- Before implementing any feature, **always plan first** and ask for approval before writing code
- Keep notes and design decisions in `docs/` — never use Claude's auto-memory for project knowledge

## Key Conventions

- `user_id` must **not** be in `cast/2` — set it explicitly from `conn.assigns.current_user.id` for security (see Ecto guidelines in AGENTS.md)
- Changeset validation uses `Ecto.Changeset.apply_action(changeset, :validate)` to return `{:ok, struct}` or `{:error, changeset}` — never pattern-match directly on a raw changeset in a `with` block
- The `FallbackController` handles `{:error, %Ecto.Changeset{}}` and `{:error, :not_found}` etc. — action functions should return error tuples, not raise
- **All error messages must be translated via gettext** — use `dgettext("errors", "...")` in controllers, plugs, and fallback handler; add `use Gettext, backend: AnotagastoWeb.Gettext` to any module that returns error strings; add new msgids to `errors.pot`, `en/LC_MESSAGES/errors.po`, and `pt_BR/LC_MESSAGES/errors.po`
