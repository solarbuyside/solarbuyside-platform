# PLANO — Promover para `apps/landing` + `apps/platform`

> **Status: PLANO. Nada executado.** Documento de revisão antes de qualquer mudança real.
> Data: 2026-06-09. Autor: handoff de agente. Pré-requisito: ler `MONOREPO.md` e `STATUS.md`.

---

## 0. Por que isso é viável agora (o que mudou)

O `MONOREPO.md` assumia que **não havia acesso via automação ao Vercel**, então a
plataforma ficou na raiz para não quebrar o Root Directory. **Isso está desatualizado.**

O `VERCEL_API_TOKEN` no `.env` foi testado e:
- Autentica como `dev@solarbuyside.com.br` (time `francis-solarbuyside`, owner).
- Lê os dois projetos sem 403.
- **Permite `PATCH` do `rootDirectory`** dos dois projetos via API.

Logo, dá para fazer `apps/*` de ponta a ponta sem tocar no dashboard.

### Config real hoje (lida via API)
| | Platform | Landing |
|---|---|---|
| Projeto Vercel | `solarbuyside-platform` | `solarbuyside-landing` |
| Project ID | `prj_5BUiynn2KK3zWX96xu2x5ECpV7A6` | `prj_hqk2typew7f9goBG14FIipDl3iI5` |
| Framework | nextjs | vite |
| **rootDirectory atual** | `null` (raiz) | `"landing"` |
| Domínios prod | plataforma.solarbuyside.com.br | solarbuyside.com.br + www |
| Team ID | `team_DWcpl8WXv7PZVPB6IDDMJHkY` | (mesmo) |

---

## 1. Estrutura alvo

```
/ (raiz do monorepo)
├── apps/
│   ├── platform/        ← Next.js (hoje na raiz)
│   └── landing/         ← Vite (hoje em landing/)
├── ajustes/             ← planos (.md) — fica na raiz
├── docs/                ← OPERATIONS.md — fica na raiz
├── AGENTS.md CLAUDE.md MONOREPO.md STATUS.md TECNOLOGIAS.md design.md README.md
├── .env .env.example .gitignore .mcp.json .claude/
└── (assets de negócio: planilha .xlsx, .docx, contrato .pdf)
```

Decisão: **só o código dos apps entra em `apps/*`.** Docs de governança, tooling
e assets de negócio ficam na raiz (nível monorepo).

---

## 2. O que MOVE para `apps/platform/` (git mv)

Itens versionados que pertencem à plataforma:
- `src/`
- `public/`
- `supabase/`
- `scripts/` (só `build-manual-index.mjs`)
- `next.config.ts`
- `next-env.d.ts` (gitignored, mas existe local)
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `postcss.config.mjs`

**NÃO move** (gitignored, regenerados): `.next/`, `node_modules/`, `tsconfig.tsbuildinfo`.

## 2b. O que MOVE para `apps/landing/`
- `git mv landing apps/landing` (pasta inteira; já tem package.json/build próprios).

---

## 3. Ajustes de config DEPOIS do move

1. **`apps/platform/tsconfig.json`** — remover `"landing"` do `exclude`
   (landing deixa de ser subpasta da plataforma; vira `apps/landing`, irmã).
   Fica: `"exclude": ["node_modules"]`.

2. **`apps/platform/eslint.config.mjs`** — remover `"landing/**"` do `globalIgnores`
   (mesma razão).

3. **`.gitignore` (raiz)** — os ignores com `/` âncora apontam pra raiz
   (`/node_modules`, `/.next/`, `/out/`, `/build`). Com o código em `apps/platform`,
   há duas opções:
   - **(a)** Criar `apps/platform/.gitignore` e `apps/landing/.gitignore` próprios
     (recomendado em monorepo).
   - **(b)** Re-apontar no .gitignore raiz para `apps/platform/.next/` etc.
   A regra `.env*` (sem âncora) continua valendo em qualquer nível — OK.

4. **`.env` (CRÍTICO — ver §4).**

5. **Docs com caminhos** — `CLAUDE.md`, `AGENTS.md`, `MONOREPO.md`, `STATUS.md`
   citam `src/domain/comparisons`, `supabase/migrations`, `src/lib/...`.
   Viram `apps/platform/src/...`. Atualizar as referências (não quebra build, mas
   quebra a navegação dos docs). `CLAUDE.md` e `AGENTS.md` **continuam na raiz**
   (Claude Code lê o CLAUDE.md a partir do cwd raiz).

6. **`MONOREPO.md`** — reescrever a seção "Por que a plataforma fica na raiz":
   o motivo (sem acesso Vercel) não vale mais.

---

## 4. ⚠️ Gotcha #1 — carregamento do `.env` (quebra dev local)

Hoje `next dev` roda na raiz e acha o `.env` na raiz. Depois do move, `next dev`
roda em `apps/platform/` e o Next.js **procura `.env` em `apps/platform/.env`**,
não na raiz. **Produção não é afetada** (Vercel injeta as env vars no projeto).

Opções para o dev local (escolher uma):
- **(a)** Mover o `.env` para `apps/platform/.env` (e a landing ganha o seu, se ler env).
  Simples, mas perde o "`.env` único da raiz" usado por scripts/tooling.
- **(b)** Symlink `apps/platform/.env -> ../../.env`. Mantém fonte única.
  ⚠️ No Windows symlink exige permissão/admin — pode atritar.
- **(c)** Script `dev` com `dotenv-cli` lendo `../../.env`. Adiciona dependência.

**Recomendação:** (a) para a plataforma + manter um `.env` na raiz só para
tooling/scripts. Documentar em `OPERATIONS.md`.

---

## 5. ⚠️ Gotcha #2 — ordem PATCH vs push (evita downtime)

Um `PATCH` de `rootDirectory` **não dispara** redeploy; o deploy de produção atual
continua servindo. O novo `rootDirectory` só vale para o **próximo** deploy.

**Ordem correta (sem estado quebrado):**
1. `PATCH` os dois projetos para o novo `rootDirectory`.
   → Produção segue no ar com o deploy antigo (Vercel não rebuilda em mudança de setting).
2. `git mv` + ajustes + **build local OK dos dois apps**.
3. `push main` → dispara redeploy, que usa o **novo** `rootDirectory`. ✅

Se invertesse (push antes do PATCH), o Vercel buildaria a raiz sem `package.json`
→ deploy falho. Por isso **PATCH primeiro**.

> Não disparar redeploy manual entre os passos 1 e 3.

### Comandos PATCH (referência)
```bash
TOKEN=$(grep '^VERCEL_API_TOKEN=' .env | cut -d= -f2 | tr -d ' \r')
TEAM=team_DWcpl8WXv7PZVPB6IDDMJHkY

# platform: null -> apps/platform
curl -X PATCH "https://api.vercel.com/v9/projects/prj_5BUiynn2KK3zWX96xu2x5ECpV7A6?teamId=$TEAM" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"rootDirectory":"apps/platform"}'

# landing: landing -> apps/landing
curl -X PATCH "https://api.vercel.com/v9/projects/prj_hqk2typew7f9goBG14FIipDl3iI5?teamId=$TEAM" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"rootDirectory":"apps/landing"}'
```

---

## 6. Outros pontos de atenção

- **Landing veio via git subtree** (de `gabrielfeelix/solar-buy-side-v2`). Após
  `git mv landing apps/landing`, futuros `git subtree pull` precisam de
  `--prefix apps/landing`. Anotar no MONOREPO.md.
- **`landing/.github/workflows/deploy.yml`** existe (resíduo do subtree). GitHub só
  lê workflows em `/.github/workflows` na raiz — esse aninhado é inerte hoje e
  continua inerte em `apps/landing/.github/`. Pode remover (limpeza), não bloqueia.
- **Lixo de doc na landing**: `PROJECT_STRUCTURE.md` é template boilerplate genérico
  (fala "Starter $29/mês", azul `#1e40af`) e há ~15 docs `*HOSTGATOR*` já superados
  pela migração pro Vercel. Oportunidade de limpeza junto da migração (opcional).

---

## 7. Sequência de execução (quando aprovado)

```
0. git checkout -b chore/monorepo-apps        # branch, não direto na main
1. mkdir apps
2. git mv landing apps/landing
3. git mv src public supabase scripts next.config.ts next-env.d.ts \
         package.json package-lock.json tsconfig.json eslint.config.mjs \
         postcss.config.mjs  apps/platform/
4. ajustes §3 (tsconfig/eslint/gitignore/.env/docs)
5. cd apps/platform && npm install && npm run lint && npm test && npm run build
6. cd ../landing && npm install && npm run build
7. PATCH Vercel (§5) nos dois projetos
8. git push -u origin chore/monorepo-apps      # deploy de PREVIEW valida o root novo
9. validado o preview → merge na main → redeploy de produção
```

> Usar **branch + preview** dá uma rede: o deploy de preview já exercita o novo
> `rootDirectory` antes de tocar produção.

---

## 8. Rollback

- **Git:** `git revert` do merge (ou não mergear a branch).
- **Vercel:** `PATCH` de volta — platform `{"rootDirectory":null}`,
  landing `{"rootDirectory":"landing"}`.
- **Deploy anterior:** promover o último deploy bom no Vercel (via API
  `POST /v13/deployments` com `deploymentId` antigo, ou no painel "Promote to Production").

---

## 9. Restrições herdadas (não mudam)
- **DNS HostGator (Zone Editor):** manual, sem acesso. Não tocar em MX/SPF/DKIM/DMARC
  ao mexer no apex. (A migração `apps/*` **não toca DNS** — domínios seguem nos
  mesmos projetos Vercel.)
- **Supabase migrations:** aplicadas via Management API (token no `.env`).
