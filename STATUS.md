# STATUS DO PROJETO — Solar Buy-Side

> Estado atual e canônico para qualquer agente/dev que continuar.
> Última atualização: 2026-06-08. Branch: `main` (tudo commitado e no GitHub).
> Leia também: `AGENTS.md`, `design.md`, `MONOREPO.md`, `ajustes/HANDOFF-brevo-greenn.md`.

---

## Visão geral

Monorepo com dois apps no mesmo repositório GitHub (`solarbuyside/solarbuyside-platform`):

```
/ (raiz)     PLATAFORMA — Next.js 16 + Supabase. Deploy Vercel (projeto solarbuyside-platform).
             Domínio: plataforma.solarbuyside.com.br (+ solarbuyside-platform.vercel.app)
landing/     LANDING PAGE — Vite + React + funções serverless. Deploy Vercel (projeto solarbuyside-landing).
             Domínio: solarbuyside.com.br (apex) + www. Importada via git subtree de gabrielfeelix/solar-buy-side-v2.
```

- A plataforma fica na raiz (não em `apps/platform`) para não quebrar o Root Directory do Vercel. Ver `MONOREPO.md`.
- Supabase: projeto `phuomgqgucrcljwddrmq`.

## Acessos (no `.env` local, NUNCA commitar)
- `VERCEL_API_TOKEN` — escopo time `francis-solarbuyside`. Permite deploy/env/domínio/projetos via API.
- `SUPABASE_PERSONAL_ACCESS_TOKEN` — Management API. Roda QUALQUER SQL via `POST https://api.supabase.com/v1/projects/<ref>/database/query` (cria tabela/RLS/seed sem migration manual).
- `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` — dados (PostgREST, bypassa RLS).
- `BREVO_API_KEY` (+ `BREVO_SENDER_NAME`, `BREVO_SENDER_EMAIL=contato@solarbuyside.com.br`) — email transacional + contatos.
- `GREENN_WEBHOOK_TOKEN`, `GREENN_API_KEY`, `GREENN_PUBLIC_KEY` — checkout/webhook.
- IDs úteis: Vercel team `team_DWcpl8WXv7PZVPB6IDDMJHkY`; projeto platform `prj_5BUiynn2KK3zWX96xu2x5ECpV7A6`; projeto landing `prj_hqk2typew7f9goBG14FIipDl3iI5`; repoId `1252679156`.

---

## O QUE ESTÁ PRONTO (no ar)

### Plataforma — regras de negócio (itens 1–11 + extras)
- Comparativo: reputação categórica (RA 1000…sem reputação) na empresa e nos 3 campos técnicos; consumo anual; remoção de geração mensal e peso do módulo; ROI auto-calculado; rótulos. Ver `src/domain/comparisons`.
- Comparativo: toda linha tem toggle "Avaliar? Sim/Não" + nota; linhas informativas viram critérios sintéticos DESLIGADOS por padrão (não mudam o ranking até serem ligadas); sem mais cinza apagando a linha.
- Termos de Uso atualizados (07.06) em `src/lib/legal/content.ts`.

### Acesso pago (Greenn + Brevo)
- `POST /api/greenn/webhook` (token nos 3 lugares, constant-time): `paid`→provisiona (cria user, 6 meses, link via Supabase `generateLink`, email via Brevo), `refunded`/`chargedback`→bloqueia. Webhook configurado na Greenn no produto (Conteúdos → Webhook).
- Cadastro público FECHADO (`/cadastro` vira aviso). Conta nasce pela compra.
- Enforcement em `(app)/layout.tsx` (admin e contas sem `access_expires_at` passam direto).
- Email de acesso: Brevo direto; Supabase só gera o link.

### Landing
- Migrada do HostGator para a Vercel. `solarbuyside.com.br` (apex A → 216.198.79.1) serve a LP. Email (Titan/MX) e DKIM Brevo intactos no DNS do HostGator.
- Conteúdo no Supabase (`landing_sections`, `landing_globals`); a LP lê de lá e SOBRESCREVE o `ContentData` (resolve o admin que não refletia). 18 seções semeadas.
- `/admin/landing` (na plataforma, admin-gated) edita textos por seção + globais (purchaseLink etc.).
- Newsletter/Ebook em serverless (`landing/api/newsletter/subscribe.js`, `landing/api/ebook/lead.js`) → Supabase (`newsletter_subscribers`, `ebook_leads`) + Brevo (listas 3/4). Testado (200, grava no Supabase).

### Acesso ao /admin + 2FA
- O **/admin é na PLATAFORMA**: `plataforma.solarbuyside.com.br/admin` (NÃO em `solarbuyside.com.br/admin`, que é a landing/admin legado morto).
- Admins: env `ADMIN_EMAILS` = gab.feelix@gmail.com, francis_poloni@yahoo.com.br, contato@buyside.com.br. Admin = bypassa acesso-gate E 2FA.
- **2FA por e-mail no login** (anti-compartilhamento): a cada login com senha de NÃO-admin, gera código de 6 dígitos (tabela `login_2fa_codes`, migration 0016), envia via Brevo, e o app só libera após `/verificar`. Cookie `sb-2fa` (HMAC) por login; apagado a cada login/logout. Admins não passam pelo 2FA. Pós-reset de senha cai em `/verificar` (usar "reenviar código").

### Admin, métricas e e-mails
- `/admin/landing` — editor **master-detail** (globais + lista de seções à esquerda na **ordem da LP**, textos/imagens da seção à direita, + **toggle Preview** com iframe da LP que rola até a seção). Salva em `landing_sections`/`landing_globals`. Os textos hardcoded dos componentes foram **extraídos pro banco** e **podados** para apenas as chaves que os componentes vivos leem (sem campos mortos). Praticamente todas as seções são editáveis (exceto as 3 legais — termos/privacidade/antipirataria — que vivem em `landing/src/legal/legalContent.ts`).
- `/admin/landing` tem aba **Depoimentos** (cards): editor add/editar/remover, gravado nas chaves `testimonial{i}*` do buyer-wave. Preview com **Padrão/Celular/Desktop**.
- `/admin/leads` (newsletter/ebook, dados reais do Supabase).
- **`/admin/vendas`**: vendas da Greenn (tabela `greenn_events`, migration 0017; o webhook loga todo evento). KPIs pagas/reembolsadas/chargeback/líquidas.
- **`/admin` reorganizado** em 3 áreas: Vendas (Greenn) · Landing Page · Plataforma.
- `solarbuyside.com.br/admin` **redireciona** para `plataforma.solarbuyside.com.br/admin` (admin único; o admin antigo da landing/Render foi aposentado).
- Vercel Web Analytics + Speed Insights: pacotes/componentes nos 2 apps; habilitados no painel.
- **E-mails 100% PT-BR**: Custom SMTP do Brevo no Supabase Auth (sender `contato@solarbuyside.com.br`, DKIM); todos os 13 templates do Auth traduzidos. Acesso pós-compra e teaser do ebook saem via API Brevo. Bloqueio de IP do Brevo está DESATIVADO (necessário p/ o SMTP do Supabase funcionar).

### Migrations (todas aplicadas)
0011 (consumo+reputação técnica), 0012 (reputação empresa), 0013 (profiles acesso), 0014 (landing_sections/globals), 0015 (leads). 0014/0015 aplicadas via Management API.

---

## O QUE FALTA

1. **Desligar o Render** (só o usuário, no painel Render, ou via Render API token). A LP não depende mais dele.
   - ⚠️ O admin ANTIGO embutido na landing (login + aba Leads em `landing/src/components/admin`, que batiam em `/api/auth/*` e `/api/admin/leads/*` no Render) vai parar. Substituto: `/admin/landing` (conteúdo) na plataforma; leads ficam no Supabase. TODO opcional: aba "Leads" no /admin da plataforma lendo `newsletter_subscribers`/`ebook_leads`.
2. **Confirmar o payload real da Greenn**: o webhook foi testado com payload simulado (parsing defensivo cobre vários formatos). Na 1ª compra real, ler o log da função no Vercel (`/api/greenn/webhook`) e ajustar o mapeamento dos campos se necessário (email/status/orderId) em `src/app/api/greenn/webhook/route.ts`.
3. **Item 12 (email confirmação Supabase Auth)**: com cadastro fechado, quase não ocorre. Opcional ligar Custom SMTP (Brevo) no Supabase para reset de senha.
4. **(Opcional) Promover para `apps/*`**: hoje platform na raiz + landing/. Com o token Vercel dá pra mover coordenando o Root Directory.

---

## Restrições / o que SÓ o usuário faz
- **Render**: desligar/gerenciar é no painel Render (sem token no `.env`).
- **DNS HostGator (Zone Editor)**: mudanças de DNS são manuais (sem acesso). Regra: ao mexer no apex, NÃO tocar em MX (titan.email), SPF, DKIM (brevo1/brevo2/titan1/default _domainkey), `_dmarc`, `brevo-code`, nem no CNAME `plataforma`.

## Como rodar/checar
- Plataforma: `npm run lint && npm test && npm run build` na raiz.
- Landing: `cd landing && npm install && npm run build`.
- SQL no Supabase: via Management API (token no `.env`).
- Deploy/env Vercel: via API (token no `.env`). Deploys também automáticos no push pra `main`.
