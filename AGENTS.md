<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Solar Buy-Side Platform

This repository is a SaaS for comparing solar vendors/proposals. The source spreadsheet in the repository root is the business reference, not the runtime storage model.

Design source of truth:
- `design.md` is the mandatory single source of truth for all UI/design decisions.
- Before creating or changing any page, component, token, color, typography, spacing, sidebar, table, form, button, animation, or visual state, read `design.md` first and follow it.
- If a previous implementation conflicts with `design.md`, update the implementation to match `design.md`.
- Do not cache or summarize the current visual direction in this file. The active palette, light/dark mode, component style, and UI rules must be read from the latest saved `design.md` before every UI change.
- The app must not introduce a dark-mode interpretation unless `design.md` explicitly asks for it.

Core stack:
- Next.js App Router + TypeScript on Vercel.
- Supabase Auth + Postgres + Row Level Security.
- Pure domain logic under `src/domain/comparisons`.
- Supabase SQL migrations under `supabase/migrations`.
- XLSX generation under `src/lib/reports`.

Rules for future agents:
- Keep business rules in pure TypeScript first. UI and database code should call the domain layer, not duplicate scoring math.
- Treat source-of-truth priority as: `design.md` for UI, root spreadsheet for product/business model, `src/domain/comparisons` for executable business rules.
- Use `@supabase/ssr` only. Do not import `@supabase/auth-helpers-nextjs`.
- Server-side auth checks should use `supabase.auth.getClaims()`.
- The buyer chooses exactly two finalists; the system may recommend finalists, but should not silently override the buyer's decision.
- Financial viability is informative by default. Do not mix it into final score unless a product decision explicitly changes that.
