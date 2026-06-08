# Estrutura (monorepo)

Este repositório agrupa o produto Solar Buy-Side. Por enquanto:

```
/ (raiz)        → PLATAFORMA (Next.js + Supabase). Deploy Vercel atual.
                  Domínio: plataforma.solarbuyside.com.br
landing/        → LANDING PAGE (Vite + React). Importada via git subtree do
                  repo solar-buy-side-v2 (com histórico). Deploy Vercel próprio.
                  Domínio (alvo): solarbuyside.com.br
```

## Por que a plataforma fica na raiz (e não em apps/platform)
O projeto Vercel da plataforma builda da raiz. Mover para `apps/platform`
exigiria trocar o Root Directory no Vercel (que não temos acesso via automação)
e derrubaria o deploy. Manter na raiz evita downtime. A landing entra em
`landing/` como projeto Vercel separado (Root Directory = `landing`).
Promover para `apps/*` depois é possível, coordenando o Vercel.

## Isolamento
- `tsconfig.json` e `eslint.config.mjs` da plataforma ignoram `landing/`.
- A landing tem o próprio `package.json`, build (Vite) e lint.

## Vercel
- Projeto **platform**: Root Directory `.` (raiz) → `plataforma.solarbuyside.com.br`.
- Projeto **landing** (criar): mesmo repo, Root Directory `landing` → `solarbuyside.com.br`.

## Próximas fases (ver ajustes/HANDOFF-brevo-greenn.md e plano)
1. Landing no Vercel (tirar do HostGator).
2. Conteúdo da landing → Supabase (hoje é hardcoded em `landing/src/contexts/ContentData.ts`; o CMS antigo não sobrescreve, por isso o admin "não muda os textos").
3. /admin de verdade na plataforma editando o conteúdo no Supabase.
4. Migrar backend Express (Render) → Next API routes + Brevo/Supabase.
5. DNS: apex solarbuyside.com.br → Vercel (sem mexer em MX/DKIM).
