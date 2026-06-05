# HANDOFF — Épico Brevo (item 12) + Greenn (item 13)

> Continuação noutro notebook. Este doc é o estado completo. Leia antes de codar.
> Data: 2026-06-05. Branch: `main` (commits já no GitHub).

---

## 0. Onde paramos

Itens **1–11** (ajustes da comparação técnica/reputação/textos) → **FEITOS e no `main`**:
- commit `0e40119` (itens 2–11) + `4f0e9d0` (placeholder "ex: 750 kWh" do consumo).

⚠️ **PENDENTE DO USUÁRIO:** aplicar as migrations **`0011`** e **`0012`** no Supabase.
Sem elas, salvar a comparação quebra em produção. Rodar no Supabase SQL Editor:
- `0011_technical_consumption_and_reputation.sql` (consumo + reputação dos 3 campos técnicos).
- `0012_company_reclame_aqui_reputation.sql` (Reclame Aqui da empresa numeric→text).
(Ver §6 sobre por que o agente não aplica sozinho.)

Itens **12 (Brevo) + 13 (Greenn)** → **decisões fechadas, build NÃO começado.** Este doc.

---

## 1. Decisões já tomadas (não re-perguntar)

- **Cadastro público:** vai ser **FECHADO** (gated). Conta só nasce pela compra na Greenn (webhook). Login continua normal.
- **SMS / 2FA:** **NÃO**. Só email. (mantém decisão do scaffold `src/lib/access/access-policy.ts`.)
- **Email de ACESSO (pós-compra):** sai por **Brevo transacional DIRETO** (API `/smtp/email`), **não** pelo Supabase. O Supabase só gera o link seguro via `admin.generateLink` (que **não envia email** — confirmado na doc). Padrão oficial p/ provedor custom.
- **Email "recibo/compra aprovada":** deixa a **Greenn** mandar (automático, não mexer).
- **Validade do acesso:** 6 meses (`ACCESS_VALIDITY_MONTHS`). Reembolso/chargeback dentro de 7 dias → bloqueia (`REFUND_WINDOW_DAYS`). Constantes já em `access-policy.ts`.
- **Quem manda o quê:** Supabase = 0 emails. Brevo = 100%.

---

## 2. Brevo — config (conta Francis / BUY-SIDE, plano Free 300/dia)

- **Sender a usar:** `contato@solarbuyside.com.br` (id 2, **active**, domínio com DKIM autenticado).
  NÃO usar `contato@buyside.com.br` (sem DKIM → spam).
- **API key:** está no `.env` do projeto-irmão da landing
  `/home/gabrielbarbosa/dev/gabriel/solar-buy-side/.env` (linha "Chave API"), ou
  Brevo → Settings → SMTP & API → API Keys. **NÃO commitar.**
- **Service de referência (funciona em produção):**
  `/home/gabrielbarbosa/dev/gabriel/solar-buy-side/backend/src/services/brevoService.js`
  (`sendTransactionalEmail` + `addContact`). Portar `sendTransactionalEmail` pro Next.
- **SMTP relay** (se precisar): `smtp-relay.brevo.com:587`.

**Env vars a setar no Vercel (projeto `solarbuyside-platform`) — usuário faz:**
```
BREVO_API_KEY=<a key>
BREVO_SENDER_NAME=Solar Buy-Side
BREVO_SENDER_EMAIL=contato@solarbuyside.com.br
```
`BREVO_API_KEY` é server-side — **NUNCA** com prefixo `NEXT_PUBLIC_`.

---

## 3. Greenn — webhook (checkout greenn.com.br)

- Webhook: `"type": "sale"`, `"event": "saleUpdated"`.
- Status (`currentStatus`): `paid`, `refused`, `refunded`, `chargedback`, `waiting_payment`.
- Payload traz: nome, email, telefone, CPF/CNPJ, id da venda, produto (id/nome), valor, método.
- Doc deles (2021) **não descreve assinatura** → validar por **segredo** (token).
- Config no painel Greenn: Produto → Editar → Conteúdo → Sistema externo → Webhook,
  ou integração nível conta (gera token + escolhe eventos **Venda paga / Reembolsada / Chargeback** + URL).

**FALTA DO USUÁRIO (bloqueia finalizar o webhook):**
1. **1 payload de teste real** (JSON do "enviar teste") → pra mapear os nomes exatos dos campos.
2. **Como o token vem** no postback: header (qual?), query (`?token=`) ou campo no corpo?
3. As **chaves de acesso/token** da Greenn → vão em env (`GREENN_WEBHOOK_TOKEN`, `GREENN_API_KEY`), **não no chat/repo**.
   (Usuário JÁ TEM as chaves — só faltou passar o formato/payload.)
4. A **URL do webhook** o agente define após subir o endpoint (ex: `https://<app>/api/greenn/webhook?token=<segredo>`).

Doc oficial: https://greenn.crisp.help/pt-br/article/documentacao-webhook-greenn-cbbxsl/

---

## 4. Build pendente (plano de implementação)

1. **Migration `0012`** — `public.profiles`:
   `access_expires_at timestamptz`, `greenn_order_id text`, `blocked_at timestamptz`, `access_source text`.
2. **`src/lib/email/brevo.ts`** — portar `sendTransactionalEmail` (fetch `https://api.brevo.com/v3/smtp/email`), HTML do email de acesso inline. Lê `BREVO_*`.
3. **`src/lib/access/provisioning.ts`** (ou implementar os stubs em `access-policy.ts`):
   - `handleGreennPurchase`: `admin.createUser({email, email_confirm:true})` (ou pega existente) → grava `access_expires_at = +6m`, `greenn_order_id`, limpa `blocked_at` → `admin.generateLink({type:'recovery', email})` → manda email via Brevo com `action_link`.
   - `handleGreennRefund`: seta `blocked_at = now`.
   - Usa `createAdminClient()` de `src/lib/supabase/admin.ts` e `getAppUrl()` de `src/lib/env.ts`.
4. **`src/app/api/greenn/webhook/route.ts`** (POST):
   - valida segredo (`GREENN_WEBHOOK_TOKEN`), parseia `type/event/currentStatus`.
   - `paid` → provisão; `refunded`/`chargedback` → revoga. Sempre retorna 200.
   - parsing DEFENSIVO + `console.log` do payload cru até ter o sample real.
   - **Não está nos `protectedPrefixes` do middleware (`src/proxy.ts`)** → já passa público. Confirmar.
5. **Enforcement de acesso** em `src/app/(app)/layout.tsx`:
   - busca `access_expires_at`/`blocked_at` do profile do usuário atual.
   - bloqueia SÓ se `blocked_at != null` OU (`access_expires_at != null` E expirado).
   - **`access_expires_at == null` = liberado** (grandfather: admin/usuários atuais/manuais NÃO podem ser trancados). Admin (`isAdmin`) sempre liberado.
   - mostrar tela "acesso expirado/bloqueado" + botão sair (não redirect cego).
6. **Fechar cadastro público:**
   - `src/app/(auth)/actions.ts` `signUpAction` → retornar erro/redirect ("acesso só via compra").
   - `src/app/(auth)/cadastro/page.tsx` → trocar form por aviso "compre o Manual na Greenn pra ganhar acesso" + link.
   - Tirar links "Crie sua conta" / "Já tem conta? Cadastre-se" das telas de login se houver.
7. **`.env.example`** + `src/lib/supabase/database.types.ts` (refletir colunas novas do profile).
8. (Opcional v2) admin: botão bloquear/desbloquear + provisão manual; cron de expiração (o enforcement por-request já cobre funcionalmente).

Depois: `npm run lint && npm test && npm run build`, commit, push. **Usuário** aplica migration `0012` + seta envs + dá redeploy.

---

## 5. Item 12 — email de confirmação do Supabase (print original)

Com cadastro FECHADO, o "Confirm signup" do Supabase quase some. Mas pra reset de senha
e qualquer email do Auth: opcional ligar **Custom SMTP (Brevo)** no Supabase (Auth → SMTP Settings),
sender "Solar Buy-Side". Textos PT prontos em `access-policy.ts` (`EMAIL_CONFIRM_*`).
Não é prioridade dado o gating.

---

## 6. Restrições do ambiente (o agente NÃO consegue, usuário faz)

- **Migrations Supabase:** projeto `phuomgqgucrcljwddrmq` não aparece no conector Supabase do agente, e não há senha do banco no `.env`. → usuário aplica no SQL Editor / `npx supabase db push`.
- **Vercel:** conector dá 403 no time `francis-solarbuyside`. → usuário seta env vars e confere deploys no painel. Deploy é automático no push pra `main`.

---

## 7. Infra (discutido, NÃO executado — fazer depois, com cuidado)

- **Landing:** Vite/React, repo `github.com/gabrielfeelix/solar-buy-side-v2`, hoje estática na **HostGator** (`solarbuyside.com.br`). Backend dela (Express+Brevo+MySQL) na **Render**.
- **Plataforma:** este Next, na **Vercel**.
- **DNS:** registrador **registro.br**, mas DNS gerenciado no **Zone Editor da HostGator** (nameserver HostGator). DKIM do Brevo + MX do email + CNAME do subdomínio da plataforma estão lá.
- **Se for mover a landing pra Vercel (decisão "depois"):** **NÃO trocar nameserver.** No Zone Editor mexer só no **A do apex** + **CNAME do www** → Vercel. **NÃO tocar** em MX / `brevo._domainkey` / SPF / DMARC / subdomínio da plataforma. Reversível.
- Decisão de sequência do usuário: **"epic já, infra depois"**.
