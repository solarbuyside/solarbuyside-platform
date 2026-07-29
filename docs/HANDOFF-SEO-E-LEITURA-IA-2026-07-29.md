# Handoff — SEO técnico e o falso alarme de "IA não lê a LP" (29/07/2026)

Dia inteiro em cima de uma auditoria externa da landing page. Metade virou
conserto real; a outra metade era diagnóstico errado de ferramenta alheia, e
custou horas. Este documento existe para o próximo que ouvir **"as IAs não
conseguem ler o site"** não repetir a investigação.

---

## 1. A conclusão que importa: o site está certo

**Sintoma:** ChatGPT, claude.ai e Gemini buscam `https://solarbuyside.com.br/`
e devolvem só o `<head>`. Corpo vazio. Todos concluem "é SPA client-side, o
conteúdo só existe depois do JavaScript".

**Causa real:** cache por URL **do lado das ferramentas**. Elas guardaram um
snapshot de antes de 28/07 21:00 — quando a home realmente era um shell vazio,
antes do prerender (commit `5e3a25f`). Servem esse snapshot em vez de rebuscar.

**Nada a consertar no site.**

### Como isso foi provado

| Leitor | `/` |
|---|---|
| `curl` (5 User-Agents diferentes) | lê os 293 KB, texto completo |
| Socket HTTP/1.1 cru, cliente burro | 16.824 chars no body |
| Googlebot ("Ver a página rastreada" no GSC) | `<div id="root">` cheio |
| WebFetch do Claude Code | H1 e H2 corretos |
| r.jina.ai (extrator de terceiro) | 14.918 bytes de markdown |
| **ChatGPT / claude.ai / Gemini** | **vazio** |

O experimento decisivo foi acidental. A rota `/leve` foi criada para testar a
hipótese de peso, mas o deploy dela demorou — e nesse intervalo o claude.ai
buscou `/leve` e **leu a página inteira**. Só que naquele momento `/leve` ainda
caía no rewrite da SPA e servia o documento pesado, byte a byte igual ao da
raiz (mesmo md5).

**Mesmos bytes, URL diferente, leitura bem-sucedida.** Isso elimina peso,
parser e User-Agent de uma vez, e deixa só uma variável: a URL.

Confirmado depois com `?v=2`:

```
/       293KB  md5 7da7679d5f4a0a693cfc6a671e455785  texto 16.907  h1: 1
/?v=2   293KB  md5 7da7679d5f4a0a693cfc6a671e455785  texto 16.907  h1: 1
```

Arquivo idêntico. As ferramentas leem `/?v=2` e não leem `/`.

### Contorno

Mandar a URL com query string nova: `https://solarbuyside.com.br/?v=2`. O
servidor ignora o parâmetro; o cache não, porque a chave dele é a URL inteira.
Não afeta SEO — o `canonical` aponta para a raiz. Se `?v=2` também cachear,
usar `?v=3`.

### Hipóteses testadas e descartadas

Todas vieram das auditorias externas. Nenhuma sobreviveu à medição:

1. **SPA sem prerender** — o prerender está em produção contínua desde
   28/07 23:59 UTC (`5e3a25f`), sem `ERROR` nem rollback no log da Vercel.
2. **Bloqueio por User-Agent / WAF** — ClaudeBot, GPTBot, PerplexityBot,
   Googlebot e navegador recebem `301574` bytes idênticos. Sem Cloudflare:
   `server: Vercel`.
3. **`robots.txt`/`sitemap.xml` retornando 403** — os três arquivos dão 200
   com e sem UA de bot.
4. **`</script>` sem escape dentro de `__SBS_CONTENT__`** — zero ocorrências
   de `</script` e zero `<` literal; os 111 estão escapados como `<` pelo
   `prerender.mjs`.
5. **Quebra de parser** — o validador W3C percorre o documento inteiro e
   reporta erros nas linhas 1299–1389, muito depois do blob. São 30 erros,
   **todos de CSS** (`background: text`, `drop-shadow`), zero de estrutura.
6. **Peso do documento** — derrubado pelo teste da `/leve` acima.
7. **Ausência de JSON-LD** — são 5 blocos, validados pelo Rich Results.
8. **`<iframe>` de vídeo sem lazy** — a página tem **zero** `<iframe>` e zero
   `<video>`.
9. **Headings genéricos** — um agente citou três headings ("A Solução
   Definitiva", "Conteúdo Exclusivo", "O Código Oficial") que **não existem**
   na página. Confabulação.
10. **Cache vazio no CDN da Vercel** — `curl` em `/` traz o documento cheio.
    Se houvesse versão vazia na borda, viria vazia.

### Screenshot em branco no Search Console

O "Captura de tela" da Inspeção de URL vem preto. **Não é bug.** A orientação
do Google é que a aba **HTML** é a autoritativa; o screenshot é indicativo.
Confirmado por medição: renderizei a URL ao vivo num Chromium headless com
viewport 412×823 e UA do Googlebot mobile — o hero pinta inteiro, `h1` com
`opacity: 1` em `y=262`. E o próprio GSC diz "todos os recursos foram
carregados" e "nenhuma mensagem" no console.

Causa provável: `document.body.scrollHeight = 29.881px`. Página de ~30 mil
pixels estoura o orçamento do capturador. Render funciona, captura não.

### Regra para o próximo agente

**Claim sobre conteúdo de página sem os bytes crus anexados não vale nada.**
Cinco agentes erraram hoje pelo mesmo motivo: leram vazio e reportaram "o site
é client-side" em vez de "minha ferramenta voltou vazia". Um deles chegou a
inventar headings e um iframe.

Antes de mexer em qualquer coisa por causa de um relatório desses:

```bash
curl -s https://solarbuyside.com.br/ | wc -c          # espere ~301.500
curl -s https://solarbuyside.com.br/ | grep -c "<h1"  # espere 1
```

---

## 2. O que foi corrigido de verdade (commits `438ccd5` … `e457e71`)

Tudo verificado por medição em produção depois do deploy.

### CNPJ errado na política de privacidade

A página servia `55.463.06/0001-80` (dígitos faltando). O commit `8cb87df`
tinha corrigido os **arquivos** do repositório, mas isso não muda a página:
as legais vêm da tabela `legal_docs` do Supabase, e os arquivos são só
fallback. Corrigido no banco (`landing/privacidade` e `platform/privacidade`).

> Ver também: as páginas legais são CMS. Editar `src/` não muda o que está no
> ar.

### `llms.txt` sabotando a própria correção

Dizia *"a landing page é uma SPA em React — o conteúdo só existe depois que o
JavaScript executa"*. Virou mentira quando o prerender subiu, e é o arquivo
que crawler de IA lê primeiro. Provável contaminação de parte dos relatórios
externos. Reescrito.

### `www` sem redirect

`www.solarbuyside.com.br` respondia 200 com o mesmo conteúdo (duplicado).
Agora 308 para o apex.

Pegadinha: a primeira tentativa usou `"source": "/:path*"`, que funciona em
subpath e **não casa com a raiz** (string vazia). Tem que ser `"/(.*)"`. E a
regra precisa vir **primeiro** na lista, senão `www/v2` bate na regra antiga e
resolve para `/` relativo — dois hops sem sair do www.

### `cache-control` em `/assets`

A Vercel servia tudo com `max-age=0, must-revalidate`, inclusive bundles
hashados. Agora:

- `immutable` 1 ano para o que tem hash no nome (bundles do Vite, `/assets/cms/`)
- 30 dias + `stale-while-revalidate` para imagem de nome fixo (`Boleto.png`),
  que pode ser trocada mantendo o caminho — `immutable` prenderia a versão
  velha por um ano

### `width`/`height` nas imagens (CLS)

As 39 imagens iam sem dimensão. Novo `scripts/gerar-dimensoes.mjs` mede os
assets (121 medidos) e o átomo `<Img>` injeta a partir do manifesto.

**Par obrigatório:** a regra `img { height: auto }` em `App.css`. Sem ela, numa
imagem fluida (CSS define largura, não altura) o `height` do atributo viraria
altura fixa em px e a imagem esticaria.

Sobram 5 imagens vindas do Storage do CMS — fora do manifesto por design, e já
com altura fixa via CSS.

### Meta description das páginas legais

As três herdavam a description comercial da home. Agora cada uma tem a sua, em
`description`, `og:` e `twitter:` (ver `ROTAS` em `prerender.mjs`).

**Pendência conhecida:** o `og:title` das legais ainda herda o da home.

### `/1` — noindex em vez de redirect

A auditoria pediu 308 de `/1` para `/`. **Não foi feito**: a `/1` é o snapshot
congelado da LP íntegra (ver comentário em `App.tsx`) e o redirect a apagaria.

Em vez disso, `noindex, follow` no prerender **e** remoção do `Disallow: /1` do
`robots.txt`. Os dois juntos: bloquear o rastreio impedia o Google de ler o
próprio `noindex`, e URL bloqueada ainda pode ser indexada sem título nem
descrição.

### Schema.org — entidade única

Antes: `Organization` com 5 campos e `sameAs: []`; `Product` sem `image`.

Agora, validado pelo Rich Results do Google ("Snippets do produto: 1 item
válido", "Listagens do comerciante: 1 item válido"):

- `Organization` com `@id`, `legalName`, `taxID` (CNPJ), endereço completo e
  e-mail — dados tirados da política de privacidade, que é a fonte legal
- `Product`, `Offer` e os dois `Person` referenciam esse `@id` em vez de
  redeclararem um `Organization` anônimo cada um
- `Product` com `image`, `sku`, `priceValidUntil` (renovado a cada build) e
  `hasMerchantReturnPolicy` espelhando os 7 dias do FAQ
- `sameAs` **removido** em vez de ficar como array vazio — array vazio não
  consolida nada e sugere que o campo foi tratado. Volta quando houver perfil
  oficial da marca.
- `returnMethod` fica **de fora** de propósito: o produto é digital, e as
  opções do schema (`ReturnByMail`, `ReturnInStore`) descreveriam algo que não
  acontece.

**Não adicionar `aggregateRating`.** A auditoria pediu, para ganhar estrelas na
SERP. O Google não considera elegível review que o próprio site coleta sobre o
próprio produto, e marcar depoimento da LP como `aggregateRating` é caminho
conhecido para ação manual por spam de dados estruturados. Os "2 erros não
críticos" que o Rich Results acusa são exatamente `review` e `aggregateRating`
ausentes — ambos opcionais.

### `og-image.png`

234 KB → 93 KB por quantização de paleta. Erro médio de 0,35/255 por canal (o
limite que o `gerar-webp.mjs` usa é 2,5). Mesmas dimensões, mesmo formato.

### Seis erros de português

Corrigidos em `landing_sections`, nas colunas `texts` **e** `texts_draft` —
chave que só existe numa das duas some no próximo Publicar.

| Errado | Certo | Seção |
|---|---|---|
| O impacto direto nos seus faturamento | no seu faturamento | `manual-strategic` |
| Com base anos de pesquisa | Com base em anos de pesquisa | `retorno` |
| Anticipa objeções | Antecipa objeções | `transformacao` |
| empresariais e tecnologicas | tecnológicas | `plataforma` |
| 10 copias | 10 cópias | `pricing` |
| comparam propostas | comparar propostas | `manual-strategic` |

Corrigir o banco **não muda a página sozinho**: o prerender assa o conteúdo no
HTML durante o build. Precisa de deploy (commit vazio serve).

---

## 3. Search Console e GA4

### Search Console

Propriedade de **Domínio**, verificada por TXT na zona DNS da **HostGator** —
o domínio delega os nameservers para lá, mesmo com o site na Vercel.

O cPanel **não aceita `@`** no campo Nome; tem que ser `solarbuyside.com.br.`
(com ponto final). E o TXT novo é **adicionado**, nunca substitui: a raiz já
tem `brevo-code:...` (entrega de e-mail) e `v=spf1 include:spf.titan.email`
(SPF). Sobrescrever quebra o envio.

Estado: sitemap processado (4 páginas), home **indexada**, reindexação
solicitada.

Cuidado: a propriedade foi criada numa conta Google de trabalho. Adicionar o
Francis como Proprietário **antes** de remover a conta atual — apagar zera a
coleta, que não é retroativa.

### GA4 — `G-1HC0KJXB6S`

A LP **já tinha** funil próprio em `landing_events` (`page_view`,
`section_view`, `buy_click`), lido pelo `/admin`. O GA4 entra para dar
aquisição — canal e campanha —, não para substituir.

- `utils/analytics.ts`: `trackEvent` espelha no GA4 **antes** do INSERT, fora
  do `try/catch` do fetch. O evento não pode depender do INSERT ter dado certo.
- `lib/analytics.ts`: eventos de granularidade fina (`cta_click`, `faq_open`,
  `video_play`) vão **só** para o GA4. O `event_type` de `landing_events` tem
  `CHECK` com os cinco tipos do funil, e ampliar aquilo é migration.
- O átomo `Cta` emite `cta_click` com texto, seção e destino lidos do DOM no
  clique, em vez de uma prop nova — a LP tem CTA em quase toda dobra e a prop
  seria esquecida na próxima seção criada.

**A tag é estática, com `ga-disable-<ID>` por hostname.** A primeira versão
injetava o script por JS para não poluir os dados com o Chromium do prerender;
o efeito colateral foi o verificador do Google não achar a tag ("sua tag não
foi detectada"), porque ele lê o HTML servido e não executa JS. A flag
`ga-disable` é o opt-out oficial do GA e resolve os dois lados: o `gtag.js`
carrega, o detector vê, e nada é enviado fora do domínio de produção.

### IndexNow

`scripts/indexnow.mjs` + chave estática em `public/`. Notifica Bing e Yandex
para rebuscar as URLs. Como o ChatGPT navega via Bing, é o caminho mais curto
para o snapshot velho dele ser trocado. Rodado em 29/07: `202 Accepted` e
`200 OK`.

A chave precisa ser **arquivo em `public/`**, mesmo motivo do `robots.txt`: o
rewrite da SPA engoliria a rota.

---

## 4. O que NÃO fazer

- **Não podar o `__SBS_CONTENT__`.** Uma auditoria classificou os 43 KB como
  "o conserto candidato número um". Não é: tem consumidor real
  (`main.tsx:48` usa como gate de hidratação, `ContentContext.tsx:341` lê), e o
  peso foi descartado como causa. Além disso os números citados são **crus** —
  na rede o blob são 12 KB brotli, e o HTML inteiro 49 KB.
- **Não externalizar o CSS crítico.** Os 73 KB inline são 10 KB brotli e foram
  otimização medida de FCP. Reverter custa render bloqueante.
- **Não migrar para Astro/Next.** O prerender já entrega HTML completo, provado
  pelo Googlebot. Seria reescrever a LP para ganhar quase nada.
- **Não adicionar `aggregateRating`.** Ver acima.

---

## 5. Pendente

Tudo aqui espera decisão ou dado de fora.

- **WhatsApp quebrado.** `getWhatsAppLink()` monta `https://wa.me/?text=...`
  sem número — `landing_globals` só tem a chave `purchaseLink`,
  `whatsappNumber` nunca foi cadastrado. Quem clica abre o WhatsApp sem
  destinatário. Está em `v4/ClosingV4.tsx`, `v4-full/ClosingV4.tsx` e
  `components/FAQSection.tsx`. Conserto = um INSERT em `landing_globals`.
- **`og:title` das três páginas legais** ainda herda o da home.
- **`sameAs`** — falta perfil oficial da marca.
- **Conflito de público.** O `<title>` vende "Manual de Compra de Sistema Solar
  Fotovoltaico" (fala com o comprador); o H1 é "Saia da Disputa de Preço e
  Passe a Vender Decisões" (fala com o integrador). Foi o único achado que as
  cinco auditorias externas levantaram por caminhos independentes e que
  sobreviveu à verificação. É copy — decisão do Francis.
- **"Antipiratarias" vs "Antipirataria"** — a URL, o `<title>` e o footer usam
  uma forma; o heading interno usa outra.
- **`contato@buyside.com.br`** é o canal de contato da LGPD, e
  `buyside.com.br` responde HTTP 500. E-mail e web são serviços separados, mas
  vale confirmar o MX ou trocar para `@solarbuyside.com.br`.
- **Política de privacidade** se autodefine como `("Landing Page" ou "nós")` e
  alterna entre "Landing Page" e "Loja", falando de carrinho num infoproduto.
  Template de e-commerce mal adaptado. Revisão jurídica, não técnica.
- **Migration `0024_landing_events.sql`** — a tabela existe no banco, mas
  confirmar se a migration está registrada.
- **Rota `/leve`** (`scripts/gerar-leve.mjs`) — criada só para o diagnóstico.
  Sai com `noindex` e fora do sitemap. **Apagar**, junto com a linha do
  `postbuild` no `package.json`.

---

## 6. Números de referência

Medidos em 29/07, para comparação futura.

```
HTML da home     293 KB cru  /  49 KB brotli
  head           151 KB cru  /  25 KB brotli
    CSS crítico   73 KB      /  10 KB
    __SBS_CONTENT 43 KB      /  12 KB
    @font-face    23 KB      /   4 KB
  body           142 KB cru  /  18 KB brotli
texto útil       16.907 chars
estrutura        1 h1, 17 h2, 26 h3, 140 p, 1 main, 6 article, 15 section
TTFB             73–90 ms
body.scrollHeight  29.881 px
```
