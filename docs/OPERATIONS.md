# Operations

This project is wired for GitHub, Vercel, and Supabase, but secrets must stay outside git.

## GitHub

- Remote: `https://github.com/solarbuyside/solarbuyside-platform.git`
- Local branch: `main`
- `.env` is ignored and must never be committed.

For this workspace, `gh` can use `GITHUB_PERSONAL_ACCESS_TOKEN_CLASSIC_TOKEN` from `.env` when needed.

## Vercel

- Team: `francis-solarbuyside`
- Project: `solarbuyside-platform`
- Project ID: `prj_5BUiynn2KK3zWX96xu2x5ECpV7A6`

Required Vercel environment variables currently accepted by the app:

- `Project_URL_SUPABASE`
- `PUBLISHABLE_KEY_SUPABASE`
- `ANON_PUBLIC_SUPABASE`
- `SECRET_KEYS_SUPABASE`
- `SERVICE_ROLE_SUPABASE`

Preferred future names:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase

- Project ref: `phuomgqgucrcljwddrmq`
- Migrations live in `supabase/migrations`.
- Project MCP config lives in `.mcp.json`.

To apply migrations with Supabase CLI, use one of:

```bash
npx supabase link --project-ref phuomgqgucrcljwddrmq --password "$SUPABASE_DB_PASSWORD"
npx supabase db push --linked --password "$SUPABASE_DB_PASSWORD"
```

or:

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

Service role keys are not enough for DDL/migration operations. They can access the API, but table creation requires SQL execution through MCP, the dashboard SQL editor, or a Postgres connection.
