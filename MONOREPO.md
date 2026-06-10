# Estrutura (monorepo)

Este repositório agrupa o produto Solar Buy-Side:

```
apps/platform/  → PLATAFORMA (Next.js + Supabase). Deploy Vercel.
                  Domínio: plataforma.solarbuyside.com.br
apps/landing/   → LANDING PAGE (Vite + React). Importada via git subtree do
                  repo solar-buy-side-v2 (com histórico). Deploy Vercel próprio.
                  Domínio: solarbuyside.com.br (apex + www)
/ (raiz)        → docs de governança (AGENTS/CLAUDE/STATUS/design/MONOREPO),
                  assets de negócio (planilha/contrato/termos), tooling (.mcp.json),
                  e o `.env` compartilhado (gitignored).
```

## Migração para apps/* (feita em 2026-06-09)
Antes, a plataforma vivia na raiz porque se assumia não haver acesso via automação
ao Vercel. Com o `VERCEL_API_TOKEN` (owner do time `francis-solarbuyside`), o
`rootDirectory` dos dois projetos foi ajustado via API:
- platform: `null` (raiz) → `apps/platform`
- landing: `landing` → `apps/landing`

Plano completo e rollback: `ajustes/PLANO-MONOREPO-APPS.md`.

## git subtree (landing)
A landing foi importada por subtree de `gabrielfeelix/solar-buy-side-v2`. Após a
migração, futuros pulls usam o prefixo novo:
`git subtree pull --prefix apps/landing <remote> <branch>`.

## .env (dev local)
O Next.js carrega o `.env` a partir do diretório onde roda (`apps/platform`). Existe
uma cópia `apps/platform/.env` (gitignored) para o dev local; o `.env` da raiz serve
o tooling/scripts. Produção usa as env vars do projeto no Vercel.

## Isolamento
- `apps/platform` e `apps/landing` têm cada um seu `package.json`, build, lint e `.gitignore`.

## Vercel
- Projeto **platform**: Root Directory `apps/platform` → `plataforma.solarbuyside.com.br`.
- Projeto **landing**: Root Directory `apps/landing` → `solarbuyside.com.br`.

## Próximas fases (ver ajustes/HANDOFF-brevo-greenn.md e plano)
1. Landing no Vercel (tirar do HostGator).
2. Conteúdo da landing → Supabase (hoje é hardcoded em `landing/src/contexts/ContentData.ts`; o CMS antigo não sobrescreve, por isso o admin "não muda os textos").
3. /admin de verdade na plataforma editando o conteúdo no Supabase.
4. Migrar backend Express (Render) → Next API routes + Brevo/Supabase.
5. DNS: apex solarbuyside.com.br → Vercel (sem mexer em MX/DKIM).
