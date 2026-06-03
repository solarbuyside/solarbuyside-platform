# Plano de Correções — Primeira Alteração da Plataforma (v2, revisado com o cliente)

> Fonte: `ajustes/Alteração da plataforma de avaliação de proposta 01.06.2026.pptx` (24 slides).
> Cada anotação foi mapeada para **arquivo e linha reais**, já incorporando os esclarecimentos do Francis (dono do produto).
> Hierarquia (CLAUDE.md): UI = `design.md` · Negócio = planilha · Regra executável = `src/domain/comparisons`.

---

## ✅ STATUS — TODOS OS 24 SLIDES IMPLEMENTADOS

Verificado: `tsc` ✅ · `eslint` ✅ · 36 testes ✅ · `next build` ✅.

| Slide(s) | O que foi feito | Status |
|----------|-----------------|--------|
| 2 | Login: "Plataforma SaaS", "Compre energia solar com segurança", 1º ícone "Empresa, Tecnologia e Finança no Centro" | ✅ |
| 3 | Sidebar "Plataforma SaaS"; Curadoria/Curso ocultos (rotas preservadas); "Dicas & Guias"→"Guias" + conteúdo esvaziado | ✅ |
| 4 | "Entrevista"→"Preenchimento"; "Notas e ranking"→"Pontuação lado a lado" | ✅ |
| 5 / 6 | Faixas "+ de 500/1.000"; opções Equipe própria/terceirizada/Não sei | ✅ |
| 7/10/11/13/14 | Bug "ano válido 1900" corrigido por campo (lista explícita de anos de calendário) | ✅ |
| 8 | Título da seção, label "competência…", escala 1–10 (Select custom), link Reclame Aqui na nota da empresa | ✅ |
| 9 | Navegação por blocos ("Próxima Seção: …") | ✅ |
| 11 | Sobrecarga calculada automaticamente, exibida em % (read-only) | ✅ |
| 12 | **Reclame Aqui dividido em nome + nota; a nota pontua na Pontuação Técnica** (migration 0008) | ✅ |
| 15 | "Payback simples (meses)" | ✅ |
| 16 | Textos auto/manual aprovados; abas "Pontuação Empresas/Tecnológica/Viabilidade Financeira" | ✅ |
| 17/18/20 | Botão de avanço por aba ("Ir para Pontuação X") | ✅ |
| 19 | **Viabilidade pontuada 1–10, somando no ranking** (3ª categoria; rubric PROVISÓRIO; migration 0007) | ✅ |
| 21/22 | Linha "Viabilidade (Pontos)" no comparativo e nos cards; "Pontos de atenção" removido | ✅ |
| 23/24 | Botão "Baixar resultado (Excel)" removido; "Voltar" agora vai à aba Pontuação Geral | ✅ |
| 1 | Acentuação geral corrigida; épico GREENN/Brevo preparado em `src/lib/access/access-policy.ts` (stubs + janelas 6 meses / 7 dias) — **sem integração viva** | ✅ (scaffold) |

### Novos arquivos
- `src/components/ui/select.tsx` — Select custom (substitui `<select>` nativo).
- `src/lib/access/access-policy.ts` (+ teste) — política de acesso GREENN/Brevo (stubs).
- `supabase/migrations/0007_score_category_financial.sql` — categoria `financial` no `score_entries`.
- `supabase/migrations/0008_reclame_aqui_name_score_split.sql` — split nome/nota do Reclame Aqui.

### ⚠️ Pendências do cliente / Francis
1. **Migrations 0007 e 0008** precisam ser aplicadas no Supabase (a 0007 já foi).
2. **Rubric da Viabilidade (slide 19) é PROVISÓRIO** — contraria a planilha ("sem pontuação"); validar limiares.
3. **Nota do Reclame Aqui (slide 12) agora pontua** no ranking — mudança de regra vs. planilha; ciente o Francis.

---

## Decisões já fechadas (não precisam mais ser perguntadas)

- **Curadoria** e **Curso**: apenas **OCULTAR** da navegação (não apagar arquivos — manter assinatura/Jacinto intacto).
- **Dicas & Guias** → renomear para **"Guias"** (sem "Dicas") e **esvaziar o conteúdo** interno, deixando placeholder "Em produção / ainda não há conteúdo".
- Abas que ficam visíveis: **Dashboard, Avaliações, Histórico, Guias** (Guias vazia).
- **SMS descartado.** Acesso/confirmação será por **e-mail via Brevo**. Integração GREENN fica para depois (plataforma ainda não instalada), mas já **deixar os CRONs/janelas de validade previstos e configuráveis** (6 meses de validade, 7 dias de arrependimento).
- Slide 23/24: o botão a remover é o **verde "Baixar resultado (Excel)"**.
- Dropdowns: **não usar `<select>` nativo** — criar um **componente Select custom** ("bonito") seguindo `design.md`.

---

## §0 — Slide 1 · Acesso via GREENN + Brevo (épico à parte, só deixar preparado)

Fluxo desejado: cliente compra o Manual no checkout GREENN → confirma **e-mail, celular, senha** → recebe acesso à plataforma → loga com **login (e-mail) + senha** já cadastrados.

**Ação agora (sem integração viva):**
- Modelar no schema/auth os campos de **validade do acesso** (`access_expires_at`, `purchased_at`, `refund_window_until`).
- Deixar previstos os **CRONs**:
  - **Validade 6 meses:** job que nega acesso após 6 meses do cadastro.
  - **Arrependimento 7 dias:** janela em que um pedido de reembolso na GREENN bloqueia o acesso.
- Envio de e-mail de acesso/confirmação **via Brevo** (não SMS).
- Webhook GREENN (compra/reembolso) → marcado como **TODO/stub** até a plataforma existir.
- **Não bloqueia** as correções abaixo. Tratar como épico separado "Acesso & Billing".

---

## §1 — Acentuação (Slide 7 / observação geral "símbolo Õ / til")

O cliente reforçou: faltam **acentos (til e demais)** em textos do sistema. Vários labels em `workflow.ts` e `score-definitions.ts` estão sem acento.
**Ação:** Varredura PT-BR e correção de acentuação em **todos os labels/sections** de campo. Exemplos a corrigir:
- "Atuacao" → "Atuação", "Potencia" → "Potência", "Colacao de grau" → "Colação de grau"
- "Instalacoes" → "Instalações", "manutencao" → "manutenção", "Avaliacao" → "Avaliação"
- "Numero" → "Número", "Modulo" → "Módulo", "Confiabilidade … equipamento" (ok), "Garantia" (ok), "portão" (verificar inputs que aceitam texto).
- Arquivos: `src/domain/comparisons/workflow.ts`, `src/domain/comparisons/score-definitions.ts`.
- ⚠️ Antes de alterar, conferir se algum desses strings é usado como **chave** em `__tests__` (são `label`/`section`, devem ser seguros — validar).

---

## §2 — Slide 2 (image1) · Tela de login (`auth-shell.tsx`)

Três trocas pontuais:
1. `auth-shell.tsx:62` — "SaaS Platform" → **"Plataforma SaaS"**.
2. `auth-shell.tsx:70` — frase laranja "Compre energia solar com critério" → **"Compre energia solar com segurança"**.
3. `auth-shell.tsx:8` — título do 1º ícone "Empresa e tecnologia no centro" → **"Empresa, Tecnologia e Finança no Centro"**.

(Os outros dois ícones permanecem.)

---

## §3 — Slide 3 (image2) · Sidebar / navegação

1. `app-shell.tsx:115` — "SaaS Platform" (no sidebar) → **"Plataforma SaaS"**.
2. **Ocultar "Curadoria"**: remover de `NAV` (`app-shell.tsx:55`) e do mapa de títulos (`:281`). **Não apagar** rotas/actions/`domain/contracts` — só esconder da UI.
3. **Ocultar "Curso"**: remover de `NAV` (`:56`) e título (`:280`). Não apagar.
4. **"Dicas & Guias" → "Guias"**: `app-shell.tsx:58` (nav) e `:283` (título) → label **"Guias"**.
   - `src/app/(app)/dicas/page.tsx` — esvaziar o conteúdo e mostrar placeholder "Conteúdo em produção". (Rota `/dicas` mantida; só o rótulo muda para "Guias".)
5. Buscador de tópicos do Manual por palavra-chave em todas as abas → **pré-requisito da Fase 2** (Manual Solar). Não implementar agora.

---

## §4 — Slide 4 (image3) · Renomear etapas da fase

1. "ENTREVISTA" → **"PREENCHIMENTO"** (primeira tab/etapa):
   - `app-shell.tsx:277` (`preencher: "Entrevista"`).
   - `phase-nav.tsx:14` (label + hint "Coletar dados dos fornecedores").
   - `preencher/page.tsx:24` (title), `step-wizard.tsx:53` (subtitle).
   - `comparativo-view.tsx:277` ("← Voltar à entrevista"), `:186`.
   - Manter o **id interno** `"entrevista"` no tipo `Phase`; trocar só o **texto** visível.
2. "Notas e ranking lado a lado" → **"Pontuação lado a lado"**:
   - `phase-nav.tsx:15` (hint do Comparativo).

---

## §5 — Slides 5 e 6 · Opções de selects (`step-wizard.tsx CHOICE_OPTIONS`)

### Slide 5 (image4) — `company.installedSystemsRange` (`step-wizard.tsx:416`)
Acrescentar **abaixo de "Mais de 100"**:
- `gt_500` → **"Mais de 500"**
- `gt_1000` → **"Mais de 1.000"**
Refletir as novas faixas em `auto-scoring.ts` (nota por faixa) e na planilha.

### Slide 6 (image5) — `company.ownInstallationTeam` (`step-wizard.tsx:424`)
Reformular para **exatamente** três opções (remover "Não" e "Terceirizado conhecido"):
- `own` → **"Equipe própria"**
- `outsourced` → **"Equipe terceirizada"**
- `unknown` → **"Não sei"**
Atualizar `auto-scoring.ts` (mapeamento valor→nota) e o label em `workflow.ts:80`.

---

## §6 — Bug "Informe um ano válido (a partir de 1900)" — corrigir POR CAMPO

**Causa raiz (única):** em `step-wizard.tsx:602`, `YEAR_FIELD = /year/i` aplica a regra de 1900 a **qualquer campo cuja key contenha "year"**. Isso pega campos que **não são data**.

Dos 10 campos com "year" na key, só **3 são ano de calendário** (regra 1900 OK):
- ✅ `company.solarSinceYear` (ano que atua no ramo)
- ✅ `company.companyFoundedYear` (ano de abertura)
- ✅ `company.engineerGraduationYear` (ano de colação de grau)

Os outros **7 NÃO são data** (a regra 1900 é o bug — Slides 7, 10, 11, 13):
- ❌ `company.projectExecutionWarrantyYears` — garantia em anos (1,2,3…)
- ❌ `technical.moduleDefectWarrantyYears`
- ❌ `technical.moduleEfficiencyWarrantyYears`
- ❌ `technical.inverterDefectWarrantyYears`
- ❌ `financial.monthlySavingsFirstYear` — R$ (economia)
- ❌ `financial.annualSavingsFirstYear` — R$
- ❌ `financial.accumulatedSavings25Years` — R$

**Ação:** Trocar a heurística do regex por uma **lista explícita** de campos que são ano de calendário (os 3 acima). Para todos os demais:
- Sem validação de "1900" nem `max = anoAtual`.
- Apenas **números** (≥ 0). Garantias = inteiros de anos; economias = valores monetários.
- `types.ts:16-19`: manter `.min(1900)` **só** nos 3 campos de ano de calendário; remover dos demais.
- Arquivos: `step-wizard.tsx:601-644` (heurística + `min/max`), `types.ts`.

---

## §7 — Slide 8 (image7) · Avaliação do vendedor + Reclame Aqui

1. **Título da seção** `"Avaliacao do vendedor pelo comprador"` (`workflow.ts:133`) → **"Avaliação do vendedor e da empresa pelo comprador"**.
2. **Label** `company.sellerTrustScore` (`workflow.ts:128`, hoje "Sentiu empatia e confianca com o vendedor") →
   **"Sentiu competência e confiança com o vendedor (pontua de 1 a 10)"**.
3. **Escala 1–10** nesse campo: virar **dropdown custom** de 1 a 10 (não input numérico solto, não `<select>` nativo).
4. **Link do Reclame Aqui** faltando no campo `company.reclameAquiScore` (nota média 12 meses) — adicionar botão "Buscar no Reclame Aqui" (hoje só os 3 campos técnicos têm — `RECLAME_AQUI_FIELDS`, `step-wizard.tsx:440`).
5. **Dropdowns custom (transversal):** `step-wizard.tsx` usa `<select>` nativo (linhas 522 e 537) e **não existe** componente Select em `src/components/ui/`. Criar `src/components/ui/select.tsx` seguindo tokens do `design.md` e trocar os selects nativos por ele em todo o wizard.

---

## §8 — Slide 9 (image8) · Reorganizar navegação por blocos

Estrutura-alvo dos botões "Próxima Seção" (em toda a plataforma):
```
Bloco EMPRESA:            Empresa → Tecnológica → Viabilidade → Pontuação Empresa
Bloco PONTUAÇÃO           Pontuação Empresa → Pontuação Tecnológica →
(antigo "AVALIAÇÃO"):       Pontuação Viabilidade → Pontuação Geral
Bloco ESCOLHA DOS         Definir Finalistas
FINALISTAS:
```
**Ação:**
- Renomear bloco **"AVALIAÇÃO" → "PONTUAÇÃO"** onde aparecer.
- Botões de avanço passam a dizer **"Próxima Seção: <nome>"** apontando o destino exato (isso conecta com os botões "Ir para Pontuação X" dos Slides 17/18/20).
- Abas internas do comparativo (`comparativo-view.tsx:45-48`) e navegação do wizard (`step-wizard.tsx`), `phase-nav.tsx`.

---

## §9 — Slides 10, 11, 13 · Datas + sobrecarga + frase Viabilidade

### Slide 10 (image9) — Garantias só números
Campos `projectExecutionWarrantyYears` e `moduleEfficiencyWarrantyYears` (os do print): remover regra 1900 (já coberto no §6), aceitar só inteiros (ex.: "12 anos").

### Slide 11 (image10) — Sobrecarga calculada automaticamente (em %)
Campo `technical.inverterOversizingRatio` (`workflow.ts:284`).
**Ação:**
- Campo **calculado / read-only** a partir de:
  - `technical.systemPowerKwp` (kWp) ÷ `technical.inverterPowerKw` (kW).
  - Exemplo do slide: 6,435 / 5,0 = 1,28 → exibir o resultado conforme o slide.
- **Label** com unidade "kWp / kW" e exibir o valor **em %** (sufixo "%"). *(Ver o slide 11 para a forma exata do que deve aparecer no campo — seguir o exemplo do slide.)*
- Remover regra 1900 desse campo (§6).
- Tocar: `step-wizard.tsx` (render calculado read-only), `workflow.ts:283-288`, `score-definitions.ts:318` / `auto-scoring.ts` (pontuação por sobrecarga).

### Slide 13 (image12) — Viabilidade financeira: frase + datas
- **Substituir a frase** abaixo de "Viabilidade financeira" por: **"Economia, investimento, prazo de retorno, e inflação como comparativo."** (texto/hint da seção — `comparativo-view.tsx` / `step-wizard.tsx`).
- Remover regra 1900 dos campos: `monthlySavingsFirstYear`, `annualSavingsFirstYear`, `accumulatedSavings25Years` (§6).

### Slide 14 (image13) — Consequência
Os 3 campos vazios são efeito do bug de preenchimento dos slides 11/13. **Sem ação própria** — validar após corrigir §6/§9.

---

## §10 — Slide 12 (image11) · Reclame Aqui em 3 linhas inteiras

Hoje a seção "Reclame Aqui" tem campos em 2 colunas + 1 embaixo (`step-wizard.tsx:550-575`), confuso.
**Ação:** Reestruturar para **3 itens, cada um ocupando a linha inteira**, seguindo a proposta desenhada no slide:
- Distribuidora · Fabricante do módulo · Fabricante do inversor.
- Cada linha com: **Nome da empresa** (ex.: Aldo Solar / Trina Solar / Goodwe) + botão **"Buscar no Reclame Aqui"** + **"Digite aqui a nota"** (ex.: 6,8).
- O link de busca (`step-wizard.tsx:562`) deve usar o **nome digitado**, não a nota.
- Labels em `workflow.ts:291-308`: separar "nome" e "nota".
- Layout: forçar `col-span` cheio nesses campos (quebra do grid de 2 colunas do `InterviewForm`).

---

## §11 — Slide 15 (image14) · Payback só em meses

Campo `financial.simplePaybackMonths` (`workflow.ts:414`) já é meses; o print mostra "Payback simples - anos e meses".
**Ação:** Label → **"Payback simples (meses)"**; remover "anos" do label e da linha do comparativo (`comparison-rows.ts`). Garantir exibição só em meses em todo lugar.

---

## §12 — Slide 16 (image15) · Modo de pontuação + abas

1. Toggle **Pontuação Automática / Pontuação Manual** (já existe: `comparativo-view.tsx:171/198`, `actions.ts:52`). Ajustar os textos de ajuda para **exatamente**:
   - Automática: **"As notas são geradas automaticamente a partir dos dados fornecidos por você. Você poderá revisar e alterar qualquer nota a qualquer momento."**
   - Manual: **"Com base nos dados que você informou, caberá a você realizar a atribuição manual das notas para cada critério avaliado."**
2. Renomear abas internas (`comparativo-view.tsx:45-47`):
   - "Avaliação Empresas" → **"Pontuação Empresas"**
   - "Avaliação Tecnológica" → **"Pontuação Tecnológica"**
   - "Viabilidade Financeira" → **"Pontuação Viabilidade Financeira"**
   - (a 4ª já é "Pontuação Geral".)

---

## §13 — Slides 17, 18, 20 · Botões de avanço entre abas de pontuação

O botão hoje rotulado "Definir finalistas" (`comparativo-view.tsx:283`) muda conforme a aba ativa:
- **Slide 17 (image16):** na aba Empresas → botão **"Ir para Pontuação Tecnológica"** (linka a aba Tecnológica).
- **Slide 18 (image17):** na aba Tecnológica → botão **"Ir para Pontuação Viabilidade"** (linka a aba Viabilidade).
- **Slide 20 (image19):** na aba Viabilidade → botão **"Ir para Pontuação Geral"** (linka a aba Geral).
  - Texto auxiliar: **"alterarei somente uma vez o sistema de pontuação automático definido"** (revisar copy exata).
- Na aba **Pontuação Geral** → botão segue como **"Definir finalistas"**.
**Ação:** Tornar o rótulo/destino do botão de avanço **dependente da aba ativa** em `comparativo-view.tsx`.

---

## §14 — Slide 19 (image18) · Pontuação da Viabilidade com cursor 1–10 (MAIOR ESFORÇO)

Hoje a Viabilidade é **informativa, sem nota** (`comparativo-view.tsx:459` "Viabilidade Financeira (informativo, sem nota)") e **não há nenhuma `section: financial.*`** em `score-definitions.ts`.
**Ação:**
- Criar critérios pontuáveis (1–10) da Viabilidade em `score-definitions.ts` (alinhar com a planilha).
- Renderizar a coluna de notas da Viabilidade no `comparativo-view.tsx` usando o **mesmo `score-cell.tsx`** (cursor 1–10) das abas Empresa/Tecnológica.
- Refletir no `auto-scoring.ts` (cálculo automático da nota de viabilidade) e nos testes `__tests__`.
- É o item que mais toca domínio + UI; fazer isolado e rodar a suíte.

---

## §15 — Slides 21 e 22 · Linha "Viabilidade (Pontos)" + limpeza finalistas

### Slide 21 (image19/20) — Pontuação Geral
Na seção "Pontuação das Propostas" (entre **Tecnológica (Pontos)** e **Total (Pontos)**, abaixo de "Nota sobre 10"):
- **Acrescentar a linha "Viabilidade (Pontos)"**.
- Tocar: `comparison-rows.ts`, `comparativo-view.tsx` (seção Pontuação Geral). Depende do §14.

### Slide 22 (image21) — Cards de finalistas (`finalists-view.tsx`)
- **Acrescentar "Viabilidade (Pontos)"** no detalhamento de pontos do card.
- **Eliminar o card "Pontos de atenção"** e os comentários (`finalists-view.tsx:223`).

---

## §16 — Slides 23 e 24 · Remover botão Excel + voltar correto

### Slide 23 (image22) — Remover Excel
- **Desativar** a funcionalidade e **remover o botão verde "Baixar resultado (Excel)"** (`finalists-view.tsx:131-137`).
- **Não apagar** a rota `export/route.ts` — só ocultar o botão (e a funcionalidade fica desativada na UI).

### Slide 24 (image23) — Voltar para Pontuação Geral
- O link "Voltar ao comparativo" (`finalists-view.tsx:123`) hoje vai para `/comparativo` (topo). Deve voltar para a **aba Pontuação Geral** (id `overview`) do comparativo.
- **Ação:** Trocar destino para a aba `overview` (via query/estado, ex.: `/comparativo?tab=overview`) e rótulo para **"Voltar à Pontuação Geral"**.
- Remover o mesmo botão Excel (é o mesmo do slide 23).

---

## Ordem de execução sugerida (por risco/dependência)

1. **Copy/labels puros:** §2 (slide 2), §3 textos, §4 (slide 4), §11 (slide 15), §12 textos (slide 16), §1 acentuação.
2. **Navegação/ocultar:** §3 (ocultar Curadoria/Curso, renomear Guias), §8 (blocos), §16 (voltar correto + remover Excel).
3. **Selects + componente Select custom:** criar `ui/select.tsx`; §5 (slides 5/6); §7 (escala 1–10).
4. **Validações de data por campo:** §6 (lista explícita de anos de calendário) → resolve slides 7/10/11/13/14.
5. **Cálculo:** §9 slide 11 (sobrecarga %).
6. **Reclame Aqui:** §10 (slide 12) + link do §7.
7. **Pontuação Viabilidade (grande):** §14 (slide 19) → depois §15 (slides 21/22 linha Viabilidade).
8. **Validar:** rodar `src/domain/comparisons/__tests__` após mudanças de domínio.
9. **Épico à parte:** §0 (GREENN/Brevo/CRONs) — só preparar estrutura, sem integração viva.

## Itens que ainda dependem de redação/visual final
- §13 (slide 20): texto auxiliar exato "alterarei somente uma vez…".
- §9 slide 11: confirmar a forma de exibição do % seguindo o desenho do slide.

---

## FASE 2 (depois) — "Manual Solar"
Nova aba "Manual Solar" em modo leitor (estilo PDF/flipbook): páginas navegáveis, virar página, busca por **categorias** e por **títulos**, acesso rápido no buscador. O buscador de tópicos do Slide 3 é o primeiro degrau (busca integrada ao Manual em todas as abas). Planejar à parte: estrutura de páginas, índice navegável, busca full-text.
