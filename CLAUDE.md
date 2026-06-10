Read AGENTS.md, MONOREPO.md and design.md first.

Monorepo: the platform lives in `apps/platform/` (Next.js) and the landing in
`apps/landing/` (Vite). Paths below are relative to `apps/platform/`.

Mandatory hierarchy:
- UI/design source of truth: `design.md` (repo root).
- Product/business reference: the spreadsheet in the repository root.
- Executable business-rule source of truth: `apps/platform/src/domain/comparisons`.

Never change visual direction, tokens, components, layout, typography, or interaction patterns without checking `design.md`.
