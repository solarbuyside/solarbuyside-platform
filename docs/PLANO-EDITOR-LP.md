# Plano — Editor de Conteúdo da Landing Page (`/admin/landing`)

> Objetivo: tornar o editor usável por um cliente **não-técnico**, que vai editar o
> texto da LP ao longo do tempo, **sem precisar de um dev do lado**.
> Documento de planejamento — nada implementado ainda.

## Contexto atual (como está hoje)

- Fonte da verdade: tabelas `landing_sections` (`texts` jsonb, `images` jsonb) e
  `landing_globals`. A landing lê com a anon key (leitura pública); o `/admin`
  escreve via service role. Ver `migrations/0014_landing_content.sql`.
- Editor: [editor.tsx](../apps/platform/src/app/(app)/admin/landing/editor.tsx).
  Coluna esquerda = globais + lista de seções (na ordem da LP via `LP_ORDER`).
  Coluna direita = editar (textareas) / preview (iframe da LP de produção).
- **204 chaves de texto** distintas em 18 seções, nomes camelCase de máquina
  (`alertTitle`, `card1Item2`, `bullet3`).

## Diagnóstico (resumo)

Casca boa, conteúdo impossível de entender. Detalhe:

**Bom (manter):** ordem das seções espelha a LP; preview com device + scroll-to-section;
feedback de salvar (salvando/salvo/erro); globais separados; depoimentos já têm
editor dedicado com add/remover.

**Ruim (mapeado à pesquisa UX — NN/g, Contentful, Storyblok, Smashing, Baymard):**

| # | Problema | Princípio violado |
|---|---|---|
| 1 | Rótulo do campo = chave de máquina (`card1Item2`) | Rótulo humano acima do campo; nunca chave técnica. **Maior impacto.** |
| 2 | Sem dica e sem limite de caractere | Help text ≤150 chars; informar limite antes, não no erro |
| 3 | Lista plana de textareas (seções com 20+ campos) | ≤5 campos por tela; agrupar/colapsar o resto (Miller's Law 5–9) |
| 4 | Ordem dos campos = ordem do JSON, não a visual | Campos seguem topo→base da seção |
| 5 | Imagem = colar URL | Reduzir fricção; cliente não tem URL → upload |
| 6 | Save vai DIRETO pra produção | Autosave→rascunho + Publicar explícito |
| 7 | Preview = LP de produção, exige salvar→recarregar | Live preview do rascunho |
| 8 | Sem aviso "não salvo", sem undo, sem validação | Guardrails / proteção contra perda |
| 9 | Blocos repetíveis travados (card1/card2/bullet1..) | Add/remover/reordenar (como nos depoimentos) |

**Números de referência (pesquisa):** ≤5 campos por tela; tooltip ≤150 caracteres;
linguagem nível 6ª–8ª série; autosave em rascunho + publicar explícito; validação
inline com tom amigável; 69% de abandono de formulário é por UX (Baymard).

---

## STATUS

- **Fase 1 — COMPLETA** (front 100%; back já estava ligado e vivo). Ver "Feito".
- **Fase 2 — COMPLETA** (rascunho/publicar). Ver "Fase 2" abaixo.
- Fase 3 — não iniciada.

### Feito (Fase 2 — rascunho/publicar)

- Migration **`0019_landing_draft.sql`**: colunas `texts_draft`/`images_draft` em
  `landing_sections` e `value_draft` em `landing_globals`, inicializadas com o
  publicado. Editor grava no rascunho; a landing (anon) continua lendo o publicado.
- `content-admin.ts`: `listLandingSections`/`getLandingGlobals` leem rascunho +
  flag `hasUnpublishedChanges`; saves gravam no rascunho; `publishLanding()` copia
  rascunho → publicado. Fallback se a migration ainda não foi aplicada (lê publicado).
- `actions.ts`: `publishLandingAction` (admin-gated, revalida a rota).
- `editor.tsx`: barra "Publicar na LP" com contador de pendências + confirmação;
  botão de salvar = "Salvar rascunho"; bolinha âmbar nas seções com rascunho não
  publicado. tsc + eslint + `next build` limpos.
- ⚠️ **Aplicar 0019 no Supabase** (Francis) p/ o editor gravar/publicar de verdade
  (tem fallback de leitura, mas salvar exige as colunas).

### Feito (Fase 1)

**Front (plataforma):**
- `src/lib/landing/field-schema.ts` — manifesto: rótulo PT, grupo, ordem, tipo por
  campo + `sanitizeCmsHtml` + `humanizeKey` + `buildSectionGroups` (fallback seguro).
  **15 seções curadas** (toda a LP editável; só as 3 páginas legais ficam de fora):
  hero, context, video, audience, manual-strategic, testimonials, story-bridge,
  seller-code, pricing, buyer-wave, authority, lead-magnet, faq, newsletter, contact.
- `src/app/(app)/admin/landing/rich-text.tsx` — WYSIWYG: caixa única, destaque já
  colorido na caixa, toolbar de marca (laranja/azul/gradiente/negrito/limpar),
  Enter=`<br>`, saída sanitizada. **Ativo nos 4 campos `CMSText`:** `video.title`,
  `manual-strategic.section2Title`, `buyer-wave.title`, `pricing.title`.
- `globals.css` — classes `cms-*` na plataforma. `editor.tsx` — render por grupos
  (rótulo humano + dica + contador) + aviso de alterações não salvas.
- **Campo COMPOSTO (abordagem A — adaptador no editor):** frases que a landing
  renderiza fatiadas em vários campos (`titlePrefix`/`titleHighlight`/`titleSuffix`,
  ou `title`+`titleHighlight`) viram UMA caixa rich-text. O editor compõe a frase pra
  exibir e DESMONTA de volta nas chaves originais ao salvar — landing intacta, sem
  deploy, sem perder animação (`WordReveal` do hero). Botão único "Destaque".
  `composeComposite`/`decomposeComposite` (round-trip testado). **Aplicado em:** hero,
  context, seller-code, authority, **lead-magnet** (ClosingV4: "Ainda com dúvidas?").
  Todas as 5 frases fatiadas do v4 cobertas. (Badge do seller-code fica separado:
  são blocos empilhados, não uma frase única.)

**Back — JÁ ESTAVA LIGADO E VIVO (verificado):**
- A landing lê do Supabase (`loadFromSupabase`, `override=true` → DB vence
  ContentData; Render aposentado, é só referência morta de `void loadContent`).
- O bundle de produção (`solarbuyside.com.br/assets/index-*.js`) contém o ref
  `phuomgqgucrcljwddrmq` → `VITE_SUPABASE_URL`/`ANON_KEY` **estão setados na Vercel**
  da landing. Logo o loop /admin → Supabase → LP já funciona em produção.
- O DB `landing_sections` **já está populado**: 15 seções, ~268 chaves de texto
  (mais que o ContentData). Anon read OK via RLS.
- Conclusão: **nenhum seed/migration era necessário.** Um seed a partir do
  ContentData só adicionaria chaves legadas (`title1/title2`) e sujaria o DB, que
  hoje está limpo. O refactor da landing (contentResolver) e o `0019_*.sql` foram
  **revertidos/descartados**. Landing voltou ao original (sem diff em `src/`).
- `.env.example` da landing passou a documentar `VITE_SUPABASE_*` (antes faltava).
  Criado `apps/landing/.env.local` (gitignored) p/ rodar a landing local contra o
  Supabase real.

### Pendência menor / polish

- O DB tem algumas chaves legadas que aparecem em "Outros campos" no editor.
  Inofensivo (render usa as resolvidas). Limpar depois se incomodar.
- Frase-única resolvida via campo composto (abordagem A) em hero/context/seller-code/
  authority. O destaque na caixa é uma APROXIMAÇÃO do estilo final (cms-* vs o
  gradiente/serif real do v4). Se quiser preview 100% fiel → abordagem B (migrar
  render da landing p/ `<CMSText>`), com custo de deploy + rever animação do hero.
- lead-magnet ainda com pares separados (confirmar render v4 antes de compor).

## Fase 1 — Manifesto de campos (rótulos humanos)  ⭐ maior ganho, baixo risco

**Por quê primeiro:** transforma "impossível sem dev" em "cliente edita sozinho".
Mexe **só no front**, zero migration, zero risco em produção. É a base que destrava
Fase 2 e 3 (a pesquisa chama isso de "content modeling > UI design").

**O que fazer:**

1. Novo arquivo `src/lib/landing/field-schema.ts` — manifesto declarativo:

   ```ts
   // Exemplo de forma (não final)
   export type FieldDef = {
     key: string;            // chave real no banco (não muda)
     label: string;          // rótulo humano PT: "Título do alerta"
     help?: string;          // dica ≤150 chars
     maxLength?: number;     // limite p/ não quebrar layout
     type: "text" | "textarea" | "image" | "url";
     placeholder?: string;
   };
   export type SectionGroup = { label: string; fields: FieldDef[] };
   export type SectionSchema = {
     label: string;          // nome humano da seção: "Contexto / Alerta"
     order: number;          // ordem na LP (substitui LP_ORDER)
     groups: SectionGroup[]; // campos agrupados, na ordem visual
   };
   export const LANDING_SCHEMA: Record<string, SectionSchema> = { /* ... */ };
   ```

2. Mapear as **204 chaves** → rótulo PT + grupo + ordem + tipo + limite.
   - Extrair de onde a landing usa `texts.X` (ex.: `apps/landing/src/components/*`)
     + a cópia default, pra saber o que cada chave é na página.
   - Este levantamento é o grosso do trabalho da fase. Saída: o manifesto preenchido.

3. Refatorar [editor.tsx](../apps/platform/src/app/(app)/admin/landing/editor.tsx):
   - Lista de seções usa `schema.label` e `schema.order` (aposenta `LP_ORDER`).
   - Painel de edição renderiza por **grupo** → rótulo humano, dica, contador de
     caracteres, ordem visual. Textarea só onde `type === "textarea"`.
   - **Fallback seguro:** chave que não está no manifesto continua aparecendo com a
     chave crua + aviso "não mapeado" (nada some, regressão impossível).
   - Colapsar grupos secundários por padrão (progressive disclosure).

**Entregável:** cliente abre "Contexto / Alerta" e vê *"Título do alerta"*,
*"Texto do alerta"*, com dica e contador — em vez de `alertTitle`, `alertSubtitle`.

**Risco:** baixo. Sem banco, sem produção. Pior caso = rótulo errado, corrige no arquivo.

---

## Fase 2 — Segurança de edição (guardrails)

**Por quê:** cliente editando sozinho ao longo do tempo **vai** errar. Hoje todo
save vai live na hora. Precisa de rede de proteção.

1. **Rascunho vs Publicar** (migration `0019_landing_draft.sql`):
   - Adicionar `texts_draft jsonb`, `images_draft jsonb` em `landing_sections`
     (e equivalente em `landing_globals`). `texts`/`images` continuam sendo o
     **publicado** que a landing lê (zero mudança na landing).
   - Editor salva sempre no `_draft`. Botão **"Publicar"** copia `_draft` → publicado.
   - Indicador visual de estado: "rascunho com alterações não publicadas".
2. **Aviso de alterações não salvas:** `beforeunload` + guarda ao trocar de seção.
3. **Contador + limite de caractere** vindos do `maxLength` do manifesto (Fase 1),
   com mudança visual perto do limite.
4. **Validação inline** com tom amigável (campo obrigatório vazio etc.).
5. (Opcional) **Histórico de versões / desfazer publicação** — guardar o publicado
   anterior pra rollback de 1 clique.

**Risco:** médio (mexe em schema). Mitigação: colunas novas, landing não muda.

---

## Fase 3 — Conforto

1. **Upload de imagem** (Supabase Storage, bucket `landing-images`) substituindo o
   input de URL. Picker com preview da imagem atual.
2. **Live preview do rascunho:** a landing passa a aceitar um modo preview que lê o
   `_draft` (via query param/rota de preview), ou o editor injeta o rascunho no
   iframe por `postMessage` sobrescrevendo o ContentContext. Tira o ciclo
   salvar→recarregar.
3. **Blocos repetíveis** (cards, bullets) viram array editável com add/remover/
   reordenar — mesmo padrão do [testimonials-editor.tsx](../apps/platform/src/app/(app)/admin/landing/testimonials-editor.tsx).
   Maior refaturação (muda o shape no banco); avaliar custo/benefício por seção.

**Risco:** médio-alto na parte de blocos repetíveis (muda shape de dados).

---

## Ordem recomendada e por quê

1. **Fase 1** isolada e completa primeiro — entrega 90% da usabilidade, sem risco,
   e cria o manifesto que as outras fases consomem.
2. **Fase 2** logo após — segurança antes de soltar o cliente editando sozinho.
3. **Fase 3** conforme demanda — melhorias incrementais.

## Decisões em aberto (precisam do Francis/cliente)

- Os rótulos PT de cada campo — quem valida o texto final? (sugiro eu propor, ele revisa).
- Fluxo de publicação: 1 botão "Publicar" global, ou por seção?
- Quais seções têm cópia editável vs fixa no código (hoje é inconsistente — algumas
  mostram "sem campos editáveis").
