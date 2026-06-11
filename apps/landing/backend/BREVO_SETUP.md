# Brevo Setup — Solar Buy-Side

## O que ja está pronto no código

- `newsletterController.subscribe` — após salvar no DB, adiciona contato à **lista 3 (Newsletter)** e dispara email de boas-vindas.
- `ebookController.saveLead` — após salvar no DB, adiciona contato à **lista 4 (Interessados)** com atributos `NOME`, `SOBRENOME`, `SMS`, e dispara email com link do PDF.
- Falha do Brevo NÃO bloqueia resposta da API. Erros vão pro log do Render.

## Configuração no Render (produção)

1. https://dashboard.render.com → service `solar-buy-side-v2`
2. Menu lateral → **Environment**
3. Adicionar variáveis:

| Key | Value |
|---|---|
| `BREVO_API_KEY` | `xkeysib-...` (do painel Brevo → Settings → SMTP & API → Chaves API) |
| `BREVO_SENDER_NAME` | `Solar Buy-Side` |
| `BREVO_SENDER_EMAIL` | email verificado no Brevo (ex: `contato@solarbuyside.com.br`) |
| `BREVO_PDF_URL` | `https://solarbuyside.com.br/assets/Teaser_Codigo_Vendedor_Consultivo.pdf` |

4. Save → Render redeploys automático.

## Configuração no Brevo (dashboard)

### 1. Verificar sender email
- Settings → Senders, Domains & Dedicated IPs
- Adicionar `contato@solarbuyside.com.br` (ou o que estiver em `BREVO_SENDER_EMAIL`)
- Confirmar via email recebido

### 2. Listas (já criadas)
- **Lista 3** — Newsletter — https://app.brevo.com/contact/list-listing/id/3
- **Lista 4** — Interessados Ebook — https://app.brevo.com/contact/list-listing/id/4

### 3. Atributos de contato
Brevo deve aceitar os atributos `NOME`, `SOBRENOME`, `SMS` automaticamente.
Se não:
- Contacts → Settings → Attributes & CRM
- Criar: `NOME` (text), `SOBRENOME` (text), `SMS` (text)

### 4. Automation (opcional — pra substituir transactional)

Hoje o backend dispara email transacional direto. Se quiser que Brevo controle o envio (templates editáveis pela Francis, sem deploy):

1. Automations → Create new automation
2. Trigger: **Contact added to list** → seleciona lista 3 ou 4
3. Action: **Send an email** → cria template
4. Para lista 4 (ebook): use placeholder `{{params.NOME}}` no template, link do PDF como botão
5. **Depois de ativar**, remover `sendTransactionalEmail()` dos controllers pra não duplicar

## Testar

### Local
```bash
cd backend
cp .env.example .env
# preencher BREVO_API_KEY no .env
npm install
npm start
```

### Smoke test
```bash
# Newsletter
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"teste@example.com"}'

# Ebook
curl -X POST http://localhost:5000/api/ebook/lead \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Teste","sobrenome":"Silva","email":"teste@example.com","celular":"11999999999"}'
```

Verificar no Brevo:
- Contacts → busca pelo email → deve estar na lista correta com atributos
- Transactional → Logs → email enviado

## Troubleshooting

- **`[brevo] addContact failed 401`** — chave inválida ou expirada
- **`[brevo] addContact failed 400` "duplicate_parameter"** — contato já existe, mas `updateEnabled: true` deveria evitar. Veja o body.
- **Email não chega** — sender não verificado, ou caiu no spam (verifica Brevo → Transactional → Logs)
- **`[brevo] BREVO_API_KEY not set`** — env var não configurada no Render
