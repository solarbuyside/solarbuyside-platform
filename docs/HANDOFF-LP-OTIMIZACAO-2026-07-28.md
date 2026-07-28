# Otimização da Landing Page — estado em 28/07/2026

Contexto de origem: o Francis mandou a LP para ChatGPT e Claude analisarem como
usuário. As duas falharam. A causa não era bloqueio de indexação (diagnóstico
errado do ChatGPT) — é que a LP é uma SPA em React e o HTML servido tem 3,4 KB
com `<body>` vazio. Qualquer crítica que as IAs fizeram foi construída em cima
das meta tags.

Isso abriu uma auditoria completa (SEO, GEO/indexação, estrutura, performance).
Este documento registra o que foi feito, o que ficou e as armadilhas
encontradas.

---

## 1. Diagnóstico inicial (28/07, antes de qualquer mudança)

| Módulo | Score | Status |
|---|---|---|
| SEO & Onpage | 66/100 | Bom |
| **GEO & Indexação** | **26/100** | **Crítico** |
| Estrutura & Conversão | 83/100 | Excelente |
| Testes & Melhorias | 76/100 | Bom |
| **Média** | **63** | Bom |

PageSpeed mobile inicial: Desempenho 69 · Acessibilidade 86 · Práticas 100 ·
SEO 92 · Navegação agêntica 1/3. FCP 3,6s · LCP 6,6s · TBT 0ms · CLS 0,001.

Leitura do diagnóstico: a LP é forte no que foi construído (copy, prova social,
arquitetura de CTA) e frágil no que é entregue ao navegador. O Módulo 3 pontua
83 e o Módulo 2 desaba para 26 porque nada daquilo existe no HTML servido.

### Baseline técnico medido (Playwright, mobile 412px)

Guardado em `scratchpad/baseline-*.json|txt|html` da sessão. Números-chave:

```
HTML servido        3,4 KB     (body vazio)
DOM renderizado     143,7 KB   (42x maior)
Texto visível       16.118 chars   (0 no HTML servido)
Nós no DOM          1.459
Altura              29.062 px
Imagens             39 (5 vindas do Supabase)
Headings            54
Peso total          2.071 KB em 33 requisições
LCP                 o <h1> do Hero — texto, NÃO imagem
```

**O LCP ser texto é o achado que mais mudou o plano.** Descartou a ideia de
`fetchpriority` em imagem e promoveu fontes e bundle a prioridade.

---

## 2. O que já foi ganho (8 commits, todos no ar)

| Commit | Conteúdo |
|---|---|
| `17d7719` | robots/sitemap/llms.txt reais + 2 correções ARIA + imagem eager→lazy |
| `7b64661` | ordem da árvore de headings + llms.txt com autoria e apoiadores |
| `359a282` | fontes saem dos `@import` para o `<head>` |
| `2048cfa` | limpeza de rotas — **falhou no build** |
| `5c23879` | corrige o `vercel.json` que barrou o deploy acima |
| `aa36795` | imagens redimensionadas e recomprimidas |

### Resultados medidos

| Métrica | Antes | Depois |
|---|---|---|
| **Carregamento inicial** | **2.071 KB** | **633 KB** (−69%) |
| Assets em disco | 60 MB | 30 MB |
| Conjunto de imagens referenciado | 37,0 MB | 7,5 MB (−80%) |
| Bundle JS | 604,7 KB | 507,5 KB (−16%) |
| Bundle gzip | 164,6 KB | 141,3 KB |
| Requisições a fonts.googleapis | 4 | 1 |
| Fonte começa a baixar aos | 811 ms | 321 ms |
| `@import` no CSS servido | 3 | 0 |
| Acessibilidade | 86 | 93 (+ headings corrigidos depois) |
| `robots.txt` | HTML da SPA, 58 erros | arquivo real |
| `sitemap.xml` / `llms.txt` | HTML da SPA | arquivos reais |
| Rotas públicas | `/1 /2 /3 /4 /v1 /v2 /v3 /v4` + 3 `.html` | só `/` e `/1` |

### Detalhe do que cada mudança fez

- **robots/sitemap/llms**: o rewrite `/((?!api/).*)` → `index.html` engolia essas
  rotas. Viraram arquivos em `public/`, que a Vercel serve antes do rewrite.
- **ARIA**: `aria-hidden` nos CTAs flutuantes mantinha link focável pelo Tab
  (`tabIndex={-1}` enquanto invisível); `aria-label` em div genérica ganhou
  `role="img"`.
- **Imagem eager**: a capa do 1º card da oferta era `loading="eager"` mas fica a
  ~23.000px do topo. 977 KB competindo com o LCP no carregamento inicial.
- **Headings**: dois pulos de h2 → h4 (ManualStrategicV4 e PricingV4). Viraram
  h3. Zero mudança visual: as tags têm classes Tailwind explícitas.
- **Fontes**: 4 `@import` dentro de CSS serializavam HTML → CSS → import →
  fonte. Viraram um `<link rel="preload">` + `<link rel="stylesheet">`.
- **Rotas**: `/v2.html`, `/v3.html` e `/v4.html` eram protótipos antigos com
  13.027, 13.383 e 1.751 chars de texto legível — HTML estático que o crawler
  **consegue** ler, ao contrário da LP real. Risco concreto de o Google ter
  indexado a versão velha. Apagados. As demais rotas viraram redirect 308.
- **Imagens**: largura decidida por medição do maior tamanho de exibição em
  mobile e desktop, nas rotas `/` e `/1`, × 3 (dobro do necessário para retina).

### Verificação usada em todos os commits

Comparação do DOM renderizado contra o baseline de produção: nós, altura,
número de imagens, número de headings e o texto caractere a caractere. Nenhum
commit alterou copy ou layout.

---

## 3. O que falta

### Fase 3 — Pré-renderização ⚠️ PRIORIDADE
**Esforço:** 1–2 dias · **Risco:** médio · **Ganho:** GEO 26 → ~75

É a única fase que resolve o problema que originou tudo: fazer o conteúdo
existir no HTML servido.

**BLOQUEADA por uma dependência que precisa ser resolvida antes:**

O conteúdo vem do Supabase em runtime, no navegador. Pré-renderizar congela um
snapshot no momento do build. Se o Francis publicar no `/admin` e o site não
rebuildar, o HTML servido fica com texto velho — o usuário vê certo (o JS
hidrata), mas o Google e as IAs leem o antigo.

**Pré-requisito:** o botão "Publicar" do `/admin` precisa disparar um Deploy
Hook da Vercel da landing, de forma confiável. Já existe algo nesse caminho,
mas falha de vez em quando (commit vazio re-dispara). **Não subir a Fase 3 sem
isso resolvido.**

Implementação prevista:
- Script pós-build com Playwright renderizando `/` e as 3 páginas legais
- Build puxa o conteúdo do Supabase (`VITE_SUPABASE_URL` e
  `VITE_SUPABASE_ANON_KEY` já existem no build — confirmado)
- **Guard obrigatório:** se o fetch falhar no build, abortar o build. Publicar
  HTML com o `ContentData` do código tornaria o conteúdo defasado permanente
  em vez de transitório.

**Alternativa mais barata, se a completa assustar:** pré-renderizar só o Hero e
o `<h1>`. Resolve preview de link no WhatsApp/LinkedIn e dá ao Google um sinal
real na primeira passada. Ganho parcial, risco bem menor.

### Fase 2c — WebP com `<picture>`
**Esforço:** ~4h · **Risco:** baixo-médio · **Ganho:** −40% sobre o que sobrou

As imagens já foram redimensionadas e recomprimidas, mas seguem em PNG/JPEG.
WebP/AVIF cortaria mais uns 40%. Exige tocar 18 tags `<img>` — o caminho limpo
é um componente único em `src/v4/atoms.tsx` e trocar `<img` por ele.

Atenção: as 5 imagens que vêm do Supabase não passam pelo build. Para essas,
usar os transform params do próprio Supabase (`?width=800&format=webp`).

### Fase 4 — JSON-LD
**Esforço:** ~3h · **Risco:** baixo · **Ganho:** rich snippets + E-E-A-T

Hoje só existe `Organization`, com `sameAs: []`. Falta:
- `FAQPage` — a LP tem 15+ perguntas, nenhuma marcada
- `Product` + `Offer` — tem preço e não está marcado
- `Person` para Francis e Ovídio — sinal de autoridade mais barato disponível
- Preencher `sameAs` com as redes da marca

Observação: o `FAQPage` precisa espelhar o texto real do CMS, senão vira
marcação inconsistente. Ou seja, **depende da Fase 3**. Se a 3 não sair, marcar
só `Product` + `Person`, que são estáveis.

### Fase 5 — Medição
**Esforço:** ~4h · **Risco:** zero

Sem isso, toda avaliação de conversão é opinião — inclusive a auditoria inicial,
que leu código, não comportamento.

- **Google Search Console** — provavelmente nem está configurado. É o único
  jeito de saber se o site está de fato indexado.
- **Microsoft Clarity** — grátis, mapa de calor e gravação de sessão.
- **Ler o funil que já existe** — `observeSection` e `trackBuyClick` estão
  instrumentados em `AppV4.tsx` e ninguém lê o resultado. Dado de graça parado.
- **PageSpeed no CI** — trava regressão de performance no PR.

### Pontas soltas (rápidas, valem juntar num commit)

1. **Preço default desalinhado — é bug de produção hoje.**
   O código diz `12x de R$ 61,38` / `R$ 597,00` (`HeaderV4.tsx:241-242` e
   `PricingV4.tsx:143,191,385-391`); o CMS serve `12x de R$ 81,94` / `R$ 797,00`.
   Se o fetch do Supabase falhar no navegador de alguém, essa pessoa vê R$ 597.

2. **Rota desconhecida renderiza a LP oficial.**
   Os redirects cobrem caminhos exatos. `/5`, `/teste`, `/xpto` ainda caem no
   rewrite da SPA e renderizam a raiz. Fechar com uma checagem no `App.tsx`,
   mesma lógica que já existe para `/admin`.

3. **`design.md` é da plataforma, não da LP.**
   Ele descreve modo claro `#f8fafc`, Outfit/Inter, sidebar escura, shadcn. A LP
   é o dark "Solar Dawn" com Sora/Fraunces/JetBrains Mono. São sistemas
   diferentes, mas o `CLAUDE.md` manda seguir `design.md` para toda decisão de
   UI. **Um agente futuro vai "corrigir" a LP para o padrão errado.** Criar um
   `design-landing.md` ou uma seção no `design.md` separando os dois.

4. **`public/.htaccess`** ainda referencia os `v2/v3/v4.html` apagados. É config
   legada do HostGator, morta na Vercel — inofensivo, mas é lixo.

5. **`llms.txt` tem prosa que o Francis não revisou.** Não há copy inventada —
   são títulos reais capturados do DOM e descrições factuais. Mas é conteúdo
   público falando pela marca. Vale ele ler: `apps/landing/public/llms.txt`.

---

## 4. Armadilhas encontradas (para não repetir)

- **`vercel.json` não aceita chave de comentário.** Uma chave `"//"` derruba o
  deploy com `should NOT have additional property`. Foi o que quebrou o
  `2048cfa`. Comentário vai na mensagem de commit.

- **Existem dois `v4.css`.** `src/v4/v4.css` (LP oficial) e
  `src/v4-full/v4.css` (cópia congelada da `/1`). O Vite empacota o CSS de
  todas as rotas num arquivo só, então mexer só em um não surte efeito. Foi o
  que fez a otimização de fontes parecer inútil na primeira medição.

- **Não comparar performance de `localhost` com a Vercel.** Servidores
  diferentes, CDN e compressão diferentes. Cheguei a reportar um "+524ms pior"
  que era só isso. Para performance, medir sempre no mesmo alvo, ou usar o
  PageSpeed.

- **Polling em produção derruba seu acesso.** Um loop de `curl` a cada 15s por
  10 minutos ativou a mitigação automática da Vercel
  (`x-vercel-mitigated: challenge`) e passou a devolver 403 para o meu IP —
  inclusive para browser real. Não há firewall configurado no projeto; expira
  sozinho. **Para acompanhar deploy, consultar a API da Vercel, não o site.**

- **O código tem defaults; o banco vence.** Ordem de precedência:
  banco > `ContentData` > default do componente. Analisar só o código dá
  conclusão errada — foi assim que o preço defasado apareceu.

- **Medir antes de otimizar imagem.** `Ovídio2.png` parecia superdimensionada
  no mobile, mas tem 394px nativos para 734px de necessidade em retina: já
  estava abaixo do ideal. Reduzir teria piorado a nitidez.

---

## 5. Ordem recomendada

1. **Verificar o deploy hook do "Publicar"** — pré-requisito da Fase 3
2. **Fase 3** — pré-renderização (o prêmio)
3. **Fase 4** — JSON-LD (fica melhor depois da 3)
4. **Fase 5** — medição
5. **Fase 2c** — WebP
6. Pontas soltas, em qualquer momento

---

## 6. Como verificar o que já está no ar

```bash
# arquivos que passaram a existir
curl -sI https://solarbuyside.com.br/robots.txt   # deve ser text/plain
curl -sI https://solarbuyside.com.br/sitemap.xml  # deve ser application/xml
curl -sI https://solarbuyside.com.br/llms.txt     # deve ser text/plain

# rotas: tudo abaixo deve dar 308 para a raiz
for r in /v1 /v2 /v3 /v4 /2 /3 /4 /v2.html; do
  curl -s -o /dev/null -w "$r %{http_code}\n" https://solarbuyside.com.br$r
done

# /1 deve seguir servindo a cópia congelada
```

No navegador, o que mais merece olho: **as fotos dos depoimentos e as capas dos
livros** — foi onde a otimização de imagem mexeu mais. Se algo parecer mole,
`git revert aa36795` desfaz só isso.

E rodar o PageSpeed de novo: é o número que vale.
