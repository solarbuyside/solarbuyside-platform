/**
 * Pré-renderização pós-build: faz o conteúdo da LP existir no HTML servido.
 *
 * Por que existe: a LP é uma SPA e o HTML que a Vercel serve tem o <body>
 * vazio (3,4 KB). Google indexa tarde, e as IAs que não executam JS (ChatGPT,
 * Claude — o caso que originou a auditoria de 28/07) leem só as meta tags.
 * Este script renderiza o site já buildado num Chromium headless, com o
 * conteúdo REAL vindo do Supabase, e grava o DOM resultante dentro do
 * <div id="root"> de cada rota. O React continua montando por cima
 * (createRoot substitui o DOM pré-renderizado ao hidratar o conteúdo do banco).
 *
 * Guard obrigatório: se o fetch do Supabase falhar no build, o build ABORTA
 * (exit 1). Publicar HTML com o conteúdo default do código tornaria o texto
 * defasado permanente em vez de transitório. Pelo mesmo motivo, a captura da
 * raiz só é aceita se a PRÓPRIA PÁGINA tiver recebido 200 de landing_sections
 * (hidratou do banco; o merge dali em diante é código determinístico) e se o
 * texto renderizado passar de um piso de tamanho (pega render em branco).
 * Comparar texto do banco com texto renderizado não funciona como guard: o
 * banco guarda seções/chaves que a LP atual não exibe — verificado na prática.
 *
 * O rebuild é disparado pelo Publicar do /admin via Deploy Hook da Vercel
 * (LANDING_DEPLOY_HOOK_URL no projeto platform) — sem isso o HTML congelado
 * ficaria para trás a cada publicação.
 *
 * Rotas: / (sentinela do banco), /1 (snapshot congelado do bundle) e as 3
 * páginas legais. Rotas desconhecidas continuam caindo no rewrite da SPA.
 *
 * Ambiente: na Vercel (Linux) usa @sparticuz/chromium; em dev local usa o
 * Chrome/Edge instalado (ou PRERENDER_EXECUTABLE). Build local SEM as envs
 * VITE_SUPABASE_* apenas avisa e pula — o guard duro vale onde importa, no CI.
 *
 * Uso:
 *   npm run build            (roda automático via postbuild)
 *   node scripts/prerender.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const RAIZ = path.resolve(import.meta.dirname, '..')
const DIST = path.join(RAIZ, 'dist')
// Origem fictícia: todo request same-origin é respondido direto do dist/ por
// interceptação — sem servidor HTTP, sem porta, mesmo comportamento local e CI.
const ORIGEM = 'http://sbs-prerender.local'
const NA_VERCEL = Boolean(process.env.VERCEL)

// Telemetria não tem o que medir num build; página real continua enviando.
const HOSTS_BLOQUEADOS = ['va.vercel-scripts.com', 'vercel-insights.com']

// pisoTexto: mínimo de caracteres de texto renderizado para aceitar a captura.
// A raiz renderiza ~16.100 hoje; o piso folgado segura remoção de seções mas
// derruba o build se a página vier em branco ou pela metade.
// pisoCss: mínimo de bytes do CSS crítico extraído para aceitar a captura —
// derruba o build se a extração vier vazia/capenga (HTML sem estilo no ar é
// pior que build quebrado). A raiz extrai ~50 KB hoje; legais ~10 KB.
const ROTAS = [
  { rota: '/', saida: 'index.html', exigeBanco: true, pisoTexto: 10_000, pisoCss: 15_000 },
  // noindex: a /1 é cópia da LP oficial. O canonical para a raiz já dizia isso,
  // mas o Disallow no robots.txt impedia o Google de LER esse canonical — a
  // URL podia ser indexada mesmo assim, sem título nem descrição. Com o
  // Disallow removido, o robots meta é o sinal que de fato remove a página do
  // índice (é a via que o próprio Google recomenda em vez do robots.txt).
  { rota: '/1', saida: '1/index.html', pisoTexto: 10_000, pisoCss: 15_000, noindex: true },
  // titulo: a SPA não seta document.title, então as rotas internas herdariam o
  // título da home no HTML estático.
  // descricao: idem — sem isso as três legais herdavam a description COMERCIAL
  // da home ("...ganhando: Técnica, Credibilidade e Conversão"), que descreve
  // um produto, não um documento jurídico.
  { rota: '/politica-de-privacidade', saida: 'politica-de-privacidade/index.html', canonical: true, pisoTexto: 1_000, pisoCss: 3_000, titulo: 'Política de Privacidade — Solar Buy-Side', descricao: 'Como a Buy-Side Soluções coleta, usa, armazena e protege os dados pessoais de quem acessa o site e adquire o Manual Solar Buy-Side, conforme a LGPD.' },
  { rota: '/termos-de-uso', saida: 'termos-de-uso/index.html', canonical: true, pisoTexto: 1_000, pisoCss: 3_000, titulo: 'Termos de Uso — Solar Buy-Side', descricao: 'Condições de uso do site e dos materiais Solar Buy-Side: licença de acesso, responsabilidades das partes, pagamento, reembolso e propriedade intelectual.' },
  { rota: '/medidas-antipiratarias', saida: 'medidas-antipiratarias/index.html', canonical: true, pisoTexto: 1_000, pisoCss: 3_000, titulo: 'Medidas Antipiratarias — Solar Buy-Side', descricao: 'Medidas de proteção autoral do Manual Solar Buy-Side: rastreamento de cópias, limites da licença coletiva e providências em caso de compartilhamento indevido.' },
]

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
}

function falhar(msg) {
  console.error(`\n[prerender] ERRO: ${msg}`)
  process.exit(1)
}

const limpar = (v) => (v && v.trim() ? v.trim() : undefined)
const normalizar = (s) => s.replace(/\s+/g, ' ').trim()

/** Falha cedo e com mensagem clara se o Supabase estiver fora ou vazio. */
async function carregarSecoes(url, anon) {
  const headers = { apikey: anon, Authorization: `Bearer ${anon}` }
  let secoes
  try {
    const res = await fetch(`${url}/rest/v1/landing_sections?select=section_id,texts,images`, { headers })
    if (!res.ok) falhar(`Supabase respondeu ${res.status} para landing_sections — build abortado para não congelar conteúdo default.`)
    secoes = await res.json()
  } catch (e) {
    falhar(`fetch do Supabase falhou (${e.message}) — build abortado para não congelar conteúdo default.`)
  }
  if (!Array.isArray(secoes) || secoes.length === 0) {
    falhar('landing_sections voltou vazio — build abortado para não congelar conteúdo default.')
  }
  return secoes
}

/* ── JSON-LD (Fase 4) ─────────────────────────────────────────────────────
   Gerado AQUI, e não à mão no index.html, para a marcação espelhar sempre o
   que está no ar: FAQ e preço saem do DOM renderizado; as pessoas espelham a
   regra banco-vence-default da seção Authority. Marcação inconsistente com a
   página é pior que nenhuma. `sameAs` segue vazio de propósito: não há rede
   social da marca documentada no repo — preencher exige URLs do Francis. */

const SITE = 'https://solarbuyside.com.br'

// Fallbacks idênticos aos de AuthorityV4.tsx — valem quando o admin não
// preencheu a chave; se divergirem de lá, a marcação mente sobre a página.
const PESSOAS_DEFAULT = [
  {
    chaves: ['person1Name', 'person1Tag', 'person1Desc'],
    imagem: 'francis',
    nome: 'Francis Poloni',
    cargo: 'Especialista Visão Buy-Side (Comprador)',
    desc: 'Atua desde 2018 no setor de integração fotovoltaica e consultoria onde assessorou tanto no lado do comprador (Buy-Side) quanto no lado do vendedor (Sell-Side), ajudando na tomada de decisões inteligentes e seguras.',
    imagemDefault: '/assets/Francis Poloni LP PRO.jpg.jpeg',
  },
  {
    chaves: ['person2Name', 'person2Tag', 'person2Desc'],
    imagem: 'ovidio',
    nome: 'Ovídio Collesi',
    cargo: 'Especialista Visão Sell-Side (Vendedor)',
    desc: 'Com vasta experiência em venda e pós venda no setor de energia solar fotovoltaica desde 2020, teve passagens por marketplaces, distribuidores, integração solar e certificadora, trazendo uma visão completa do lado do vendedor e do suporte técnico.',
    imagemDefault: '/assets/Ovídio2.png',
  },
]

function montarJsonLd(secoes, dados) {
  const blocos = []
  const authority = secoes.find((s) => s.section_id === 'authority')
  const hero = secoes.find((s) => s.section_id === 'hero')

  const pessoas = PESSOAS_DEFAULT.map((p) => {
    const t = authority?.texts ?? {}
    const img = (authority?.images ?? {})[p.imagem] || p.imagemDefault
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: t[p.chaves[0]] || p.nome,
      jobTitle: t[p.chaves[1]] || p.cargo,
      description: t[p.chaves[2]] || p.desc,
      image: img.startsWith('http') ? img : `${SITE}${encodeURI(img)}`,
      worksFor: { '@type': 'Organization', name: 'Solar Buy-Side', url: SITE },
    }
  })
  blocos.push(...pessoas)

  if (dados?.precoVista) {
    blocos.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: hero?.texts?.manualTitle || 'Manual Solar Buy-Side',
      description:
        'Manual de compra de sistema solar fotovoltaico: método Buy-Side para avaliar propostas e decidir pela perspectiva do comprador.',
      brand: { '@type': 'Organization', name: 'Solar Buy-Side', url: SITE },
      author: pessoas.map(({ name, jobTitle }) => ({ '@type': 'Person', name, jobTitle })),
      offers: {
        '@type': 'Offer',
        price: dados.precoVista,
        priceCurrency: 'BRL',
        url: dados.checkout || `${SITE}/#oferta`,
        availability: 'https://schema.org/InStock',
      },
    })
  }

  if (dados?.faq?.length) {
    blocos.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: dados.faq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    })
  }

  return blocos
    .map(
      (b) =>
        `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`,
    )
    .join('\n')
}

async function abrirNavegador() {
  if (NA_VERCEL || process.platform === 'linux') {
    const { default: chromium } = await import('@sparticuz/chromium')
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }
  const candidatos = [
    limpar(process.env.PRERENDER_EXECUTABLE),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean)
  const achado = candidatos.find((p) => existsSync(p))
  if (!achado) falhar('nenhum Chrome/Edge encontrado — defina PRERENDER_EXECUTABLE.')
  return puppeteer.launch({ executablePath: achado, headless: true })
}

async function interceptar(page) {
  await page.setRequestInterception(true)
  page.on('request', async (req) => {
    let url
    try {
      url = new URL(req.url())
    } catch {
      return req.abort()
    }
    if (url.origin === ORIGEM) {
      // Sem extensão = rota da SPA: serve o index.html, como o rewrite da Vercel.
      const semExt = !path.extname(url.pathname)
      const arquivo = semExt
        ? path.join(DIST, 'index.html')
        : path.join(DIST, decodeURIComponent(url.pathname))
      try {
        const body = await readFile(arquivo)
        return req.respond({ status: 200, contentType: MIME[path.extname(arquivo)] ?? 'application/octet-stream', body })
      } catch {
        return req.respond({ status: 404, body: 'not found' })
      }
    }
    if (HOSTS_BLOQUEADOS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
      return req.abort()
    }
    // O funil da LP (landing_events) não pode registrar as navegações do build
    // como visitas; responde 201 falso para o silent-fail nem aparecer.
    if (url.pathname.startsWith('/rest/v1/landing_events')) {
      return req.respond({ status: 201, body: '' })
    }
    return req.continue()
  })
}

/** Rola até o fim em passos para acionar reveals, contadores e lazy-load. */
async function rolarTudo(page) {
  await page.evaluate(async () => {
    const passo = 600
    const alturaDe = () => document.body.scrollHeight
    for (let y = 0; y < alturaDe(); y += passo) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    window.scrollTo(0, alturaDe())
    await new Promise((r) => setTimeout(r, 400))
  })
}

async function capturarRota(browser, rota) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 900 })
  await interceptar(page)
  // Guard: a página em si precisa ter hidratado do banco. Observa a resposta
  // de landing_sections dentro do próprio browser.
  let statusBanco = null
  page.on('response', (res) => {
    if (res.url().includes('/rest/v1/landing_sections')) statusBanco = res.status()
  })
  await page.goto(ORIGEM + rota.rota, { waitUntil: 'networkidle0', timeout: 90_000 })
  // Margem para o fetch do Supabase aplicar o conteúdo do banco após o idle.
  await new Promise((r) => setTimeout(r, 1200))
  await rolarTudo(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  // Estados ligados ao scroll (header, CTA flutuante, contadores) assentam.
  await new Promise((r) => setTimeout(r, 1500))

  const { html, titulo, texto, conteudo, cssCritico } = await page.evaluate(() => {
    // ── CSS crítico por DOM-matching ─────────────────────────────────────
    // Como o HTML é 100% pré-renderizado, "crítico" = toda regra cujo seletor
    // casa com o DOM servido (página inteira, não só acima da dobra — elimina
    // FOUC no scroll rápido). O arquivo completo vira carga async (ver
    // aplicarCssCritico). Decisões:
    // - matching por SELETOR, não por coverage: coverage perde :hover,
    //   :focus-visible e media queries de outros viewports (renderizamos a
    //   1366px; as regras mobile entram porque o seletor casa).
    // - pseudo-classes/elementos NÃO escapados saem antes do teste
    //   (`.group:hover .x` testa `.group .x`); o lookbehind (?<!\\) preserva
    //   `.hover\:bg-x` e afins do Tailwind, que são nome de classe literal.
    // - viés conservador: seletor que não parseia => MANTÉM (byte a mais não
    //   quebra UI; regra a menos quebra).
    // - safelist de runtime: html.js/html.pre (main.tsx), .in/.go (reveals) e
    //   :not(.js) (visibilidade sem JS) ficam sempre — no primeiro paint elas
    //   ainda não existem no DOM mas regem o comportamento pós-JS/sem-JS.
    //   Estados de interação (FAQ aberto, menu) NÃO precisam: interagir exige
    //   JS, e o preload do CSS completo (20 KB) chega antes do bundle (105 KB).
    // - @font-face/@keyframes/@property: mantidos por inteiro (baratos).
    // Rodar ANTES do strip dos reveals: .v4r.in também casa naturalmente.
    // Nota: o inline é o CSS re-serializado pelo CSSOM (expande ~1,3x e
    // arredonda micro-valores). Custo conhecido e aceito: 2 px de AA de glifo
    // na /1 com JS (invisível; crops verificados) — a alternativa verbatim
    // testada dropava regras e quebrava o sem-JS.
    const extrairCssCritico = () => {
      const SAFE = /\.(?:js|pre|in|go)(?![\w-])|:not\(\.js\)/
      const limparPseudos = (sel) => {
        let s = sel.replace(/(?<!\\)::[a-zA-Z-]+(\([^()]*\))?/g, '')
        let antes
        do {
          antes = s
          s = s.replace(/(?<!\\):[a-zA-Z-]+\([^()]*\)/g, '')
        } while (s !== antes)
        return s.replace(/(?<!\\):[a-zA-Z-]+/g, '').trim()
      }
      const mantem = (selRaw) => {
        const sel = selRaw.trim()
        if (!sel) return false
        if (SAFE.test(sel)) return true
        const limpo = limparPseudos(sel)
        if (!limpo || limpo === '*') return true
        try {
          return Boolean(document.querySelector(limpo))
        } catch {
          return true
        }
      }
      const coletar = (rules, out) => {
        for (const r of rules) {
          if (r.type === CSSRule.STYLE_RULE) {
            if (r.selectorText.split(',').some(mantem)) out.push(r.cssText)
          } else if (r.type === CSSRule.MEDIA_RULE || r.type === CSSRule.SUPPORTS_RULE) {
            const sub = []
            coletar(r.cssRules, sub)
            if (sub.length) {
              const cabecalho = r.cssText.slice(0, r.cssText.indexOf('{')).trim()
              out.push(`${cabecalho}{${sub.join('')}}`)
            }
          } else {
            out.push(r.cssText)
          }
        }
      }
      const partes = []
      for (const sheet of document.styleSheets) {
        // SÓ a folha do bundle da entrada (/assets/index-*.css) — o arquivo
        // que sai do caminho crítico. Fora: o CSS de chunk lazy (AppV4-*.css
        // da /1 carrega com o próprio chunk, como sempre; inliná-lo mudaria a
        // cascata do primeiro paint em relação à produção de hoje), a folha do
        // Google Fonts (inlinarFontes cuida no template) e qualquer <style>
        // inline futuro (re-inlinar duplicaria).
        if (!sheet.href || !sheet.href.includes('/assets/index-')) continue
        try {
          coletar(sheet.cssRules, partes)
        } catch {
          // folha ilegível: ignora
        }
      }
      return partes.join('\n')
    }
    const cssCritico = extrairCssCritico()

    // As classes de reveal (in/go) são adicionadas pelo IntersectionObserver e
    // NÃO existem no primeiro render do React. Ficar com elas no HTML servido
    // quebraria a hidratação (mismatch de className => o React descarta o DOM
    // e volta a repintar, que é o que estamos eliminando). Quem mantém o
    // conteúdo visível sem JS é a regra html:not(.js) do v4.css; após o
    // hydrate, os observers revelam como sempre.
    document.querySelectorAll('.v4r.in').forEach((el) => el.classList.remove('in'))
    document.querySelectorAll('.v4-words.go').forEach((el) => el.classList.remove('go'))
    return {
      cssCritico,
      html: document.querySelector('#root').innerHTML,
      titulo: document.title,
      // innerText ignora display:none mas INCLUI texto com opacity 0 — o piso
      // continua medindo o conteúdo todo mesmo com os reveals "recolhidos".
      texto: document.body.innerText,
      // Estado exato com que esta página foi renderizada (o provider grava o
      // merge no localStorage). Vira window.__SBS_CONTENT__ para o primeiro
      // render do cliente bater com o DOM e a hidratação colar.
      conteudo: {
        sections: JSON.parse(localStorage.getItem('cms-content') ?? 'null'),
        assets: JSON.parse(localStorage.getItem('cms-global-assets') ?? 'null'),
        settings: JSON.parse(localStorage.getItem('cms-global-settings') ?? 'null'),
      },
    }
  })

  // Insumos do JSON-LD, tirados do DOM renderizado — a fonte que o visitante vê.
  let dados = null
  if (rota.exigeBanco) {
    dados = await page.evaluate(() => {
      const faq = [...document.querySelectorAll('#faq [aria-expanded]')]
        .map((btn) => {
          const q = btn.querySelector('span.flex-1')?.textContent?.trim()
          const a = btn.parentElement?.querySelector('.v4-faq-body p')?.textContent?.trim()
          return q && a ? { q, a } : null
        })
        .filter(Boolean)
      const oferta = document.querySelector('#oferta')
      // "Ou R$ 797,00 à vista no PIX" -> 797.00 (formato do schema.org)
      const m = (oferta?.innerText ?? '').match(/R\$\s*([\d.]+,\d{2})\s*à vista/i)
      const precoVista = m ? m[1].replace(/\./g, '').replace(',', '.') : null
      const cta = [...(oferta?.querySelectorAll('a[href^="http"]') ?? [])].find((a) =>
        /greenn|checkout|pay/i.test(a.href),
      )
      return { faq, precoVista, checkout: cta?.href ?? null }
    })
  }
  await page.close()

  if (rota.exigeBanco && statusBanco !== 200) {
    falhar(
      `a rota ${rota.rota} não hidratou do Supabase dentro do browser ` +
        `(landing_sections respondeu ${statusBanco ?? 'nada'}) — a página congelaria os defaults do código.`,
    )
  }
  const chars = normalizar(texto).length
  if (chars < rota.pisoTexto) {
    falhar(`a rota ${rota.rota} renderizou só ${chars} chars de texto (piso: ${rota.pisoTexto}) — captura rejeitada.`)
  }
  if ((cssCritico?.length ?? 0) < rota.pisoCss) {
    falhar(`a rota ${rota.rota} extraiu só ${cssCritico?.length ?? 0} bytes de CSS crítico (piso: ${rota.pisoCss}) — captura rejeitada para não servir página sem estilo.`)
  }
  return { html, titulo, chars, dados, conteudo, cssCritico }
}

/**
 * Fontes: troca os <link> do Google Fonts por CSS inline — remove a folha
 * render-blocking (fonts.googleapis) do caminho crítico, que era "economia
 * estimada de 1,5s" no mobile do Lighthouse.
 *
 * Preload de woff2 SÓ NO DESKTOP (media min-width 768px), e o porquê importa:
 * - No desktop, o CLS depende de a fonte vencer o primeiro paint. O fallback
 *   métrico ("Sora Fallback") aproxima larguras médias, mas a Sora 800
 *   extrabold quebra linha diferente do Arial ajustado em certas larguras de
 *   viewport (medido: shift 0,175 no h1 a 1350px quando a fonte chega tarde).
 *   Com preload, a corrida nunca acontece.
 * - No mobile, os ~150 KB de woff2 disputam o 4G com CSS e bundle e pioram
 *   FCP/LCP — lá o preload não entra (media não casa) e o swap tardio tem
 *   CLS pequeno no viewport estreito.
 *
 * Se o fetch falhar, mantém os <link> originais (enhancement, não guard).
 */
async function inlinarFontes(template) {
  const mHref = template.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/)
  if (!mHref) return template
  let css
  try {
    const res = await fetch(mHref[1], {
      headers: {
        // UA de Chrome atual: o css2 devolve woff2 com unicode-range por subset.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    css = await res.text()
  } catch (e) {
    console.warn(`[prerender] Google Fonts não inlinado (${e.message}) — seguem os <link>.`)
    return template
  }
  if (!css.includes('woff2') || css.includes('</style>')) return template

  // Fontes visíveis no primeiro paint do hero, subset latin. A Sora 800 (fonte
  // do h1, o elemento LCP) vai SEM gate: quando ela chega depois do paint, o
  // h1 repinta maior e o Chrome re-registra o LCP na hora da fonte — ~20 KB
  // que ancoram o LCP no primeiro paint em qualquer viewport. As outras duas
  // ficam atrás do gate de desktop: no 4G, 150 KB de fontes atrasavam o FCP.
  const alvos = [
    { familia: 'Sora', peso: '800', sempre: true },
    { familia: 'Fraunces', estilo: 'italic' },
    { familia: 'Manrope', peso: '400' },
  ]
  const preloads = []
  for (const bloco of css.split('@font-face').slice(1)) {
    if (!bloco.includes('U+0000-00FF')) continue // só latin
    const familia = bloco.match(/font-family:\s*'([^']+)'/)?.[1]
    const estilo = bloco.match(/font-style:\s*(\w+)/)?.[1]
    const peso = bloco.match(/font-weight:\s*([\d ]+)/)?.[1]?.trim()
    const arquivo = bloco.match(/url\((https:[^)]+\.woff2)\)/)?.[1]
    if (!arquivo) continue
    const alvo = alvos.find(
      (a) =>
        a.familia === familia &&
        (!a.peso || peso === a.peso || Boolean(peso?.includes(' '))) &&
        (!a.estilo || estilo === a.estilo),
    )
    if (alvo && !preloads.some((p) => p.arquivo === arquivo)) {
      preloads.push({ arquivo, sempre: Boolean(alvo.sempre) })
    }
  }
  const linksPreload = preloads
    .map(
      (p) =>
        `<link rel="preload" as="font" type="font/woff2" crossorigin${p.sempre ? '' : ' media="(min-width: 768px)"'} href="${p.arquivo}" />`,
    )
    .join('\n    ')

  let saida = template.replace(/<link[^>]*as="style"[^>]*>/, linksPreload)
  saida = saida.replace(
    /<link[^>]*rel="stylesheet"[^>]*href="https:\/\/fonts\.googleapis\.com[^>]*>/,
    () => `<style>${css}</style>`,
  )
  console.log(
    `[prerender] Google Fonts inlinado (${(css.length / 1024).toFixed(0)} KB) + ${preloads.length} preloads de woff2 só desktop`,
  )
  return saida
}

/**
 * CSS crítico: o <link rel="stylesheet"> do bundle (render-blocking, 850 ms
 * no 4G medidos pelo Lighthouse) sai do caminho crítico. No lugar:
 *   1. <style data-critico> com as regras que o DOM servido usa (por rota);
 *   2. o arquivo completo como preload que vira stylesheet no onload —
 *      cobre hover/estados de interação e navegação SPA posterior.
 * SEM <noscript>: o inline cobre 100% do DOM servido (verificado por diff de
 * screenshot 0,0000% renderizando SÓ com o inline), e sem JS não existe
 * navegação nem interação numa SPA — o link duplicado só criava um estado
 * "inline+completo" exclusivo do sem-JS, com micro-diferenças de serialização
 * do CSSOM (medido: 2 px de anti-aliasing na /1).
 * Cascata preservada: o inline entra na MESMA posição do link e é subconjunto
 * ordenado do arquivo; quando o completo aplica, os valores computados são
 * idênticos. A hidratação não é afetada (tudo no <head>; hydrateRoot só olha
 * o #root).
 */
function aplicarCssCritico(saida, cssCritico) {
  const reLink = /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/
  const m = saida.match(reLink)
  if (!m) falhar('template sem <link rel="stylesheet"> do bundle — o formato do Vite mudou?')
  return saida.replace(reLink, () =>
    `<style data-critico>${cssCritico}</style>\n    ` +
    `<link rel="preload" as="style" crossorigin href="${m[1]}" onload="this.onload=null;this.rel='stylesheet'">`,
  )
}

function montarSaida(template, rota, captura, secoes) {
  const marcador = /<div id="root">\s*<\/div>/
  if (!marcador.test(template)) falhar('dist/index.html não tem <div id="root"></div> — o template mudou?')
  let saida = template.replace(marcador, () => `<div id="root">${captura.html}</div>`)
  saida = aplicarCssCritico(saida, captura.cssCritico)

  const titulo = rota.titulo ?? captura.titulo
  if (titulo) {
    const escapado = titulo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    saida = saida.replace(/<title>[^<]*<\/title>/, `<title>${escapado}</title>`)
  }

  if (rota.descricao) {
    const escapado = rota.descricao.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    // og:description junto: senão o card do WhatsApp anuncia o produto quando
    // alguém compartilha o link de um documento legal.
    saida = saida
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapado}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapado}$2`)
      .replace(/(<meta property="twitter:description" content=")[^"]*(")/, `$1${escapado}$2`)
  }

  if (rota.noindex) {
    saida = saida.replace('</head>', '<meta name="robots" content="noindex, follow">\n</head>')
  }

  if (rota.canonical) {
    // Páginas legais apontam para a própria URL; / e /1 mantêm o canonical da
    // raiz (a /1 é cópia da LP e não deve competir com ela na busca).
    const urlRota = `https://solarbuyside.com.br${rota.rota}`
    saida = saida
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${urlRota}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${urlRota}$2`)
      .replace(/(<meta property="twitter:url" content=")[^"]*(")/, `$1${urlRota}$2`)
  }

  if (rota.exigeBanco && captura.dados) {
    const jsonLd = montarJsonLd(secoes, captura.dados)
    if (jsonLd) saida = saida.replace('</head>', `${jsonLd}\n</head>`)
    console.log(
      `[prerender] JSON-LD: ${captura.dados.faq.length} FAQs, preço à vista ${captura.dados.precoVista ?? 'NÃO ACHADO'}, checkout ${captura.dados.checkout ? 'ok' : 'ausente'}`,
    )
  }

  // Conteúdo do build embutido — pré-condição do hydrateRoot (ver main.tsx).
  // Só na raiz: a /1 é determinística (snapshot) e as legais são chunk lazy.
  if (rota.exigeBanco && captura.conteudo?.sections) {
    const json = JSON.stringify(captura.conteudo).replace(/</g, '\\u003c')
    saida = saida.replace('</head>', `<script>window.__SBS_CONTENT__=${json}</script>\n</head>`)
  }

  return saida.replace('</head>', `<!-- prerender: ${new Date().toISOString()} -->\n</head>`)
}

async function main() {
  const supaUrl = limpar(process.env.VITE_SUPABASE_URL)
  const supaAnon = limpar(process.env.VITE_SUPABASE_ANON_KEY)
  if (!supaUrl || !supaAnon) {
    if (NA_VERCEL) falhar('VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ausentes no build da Vercel.')
    console.warn('[prerender] sem VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY — pré-renderização PULADA (build local).')
    return
  }
  if (!existsSync(path.join(DIST, 'index.html'))) falhar('dist/index.html não existe — rode o vite build antes.')

  const secoes = await carregarSecoes(supaUrl, supaAnon)
  console.log(`[prerender] banco OK: ${secoes.length} seções em landing_sections`)

  // Template lido UMA vez, antes de a raiz sobrescrever dist/index.html.
  const template = await inlinarFontes(await readFile(path.join(DIST, 'index.html'), 'utf8'))

  // DUAS FASES: primeiro TODAS as capturas, depois as escritas. A saída da
  // raiz sobrescreve dist/index.html — que é o arquivo que a interceptação
  // serve como template da SPA para toda rota sem extensão. Capturar depois de
  // escrever fazia as rotas seguintes carregarem a raiz JÁ pré-renderizada
  // (CSS crítico inline + fontes inline + __SBS_CONTENT__), poluindo a
  // extração de CSS delas com folhas duplicadas.
  const browser = await abrirNavegador()
  const capturas = []
  try {
    for (const rota of ROTAS) {
      capturas.push({ rota, captura: await capturarRota(browser, rota) })
    }
  } finally {
    await browser.close()
  }
  for (const { rota, captura } of capturas) {
    const saida = montarSaida(template, rota, captura, secoes)
    const destino = path.join(DIST, rota.saida)
    await mkdir(path.dirname(destino), { recursive: true })
    await writeFile(destino, saida)
    console.log(
      `[prerender] ${rota.rota} -> ${rota.saida} (${(saida.length / 1024).toFixed(0)} KB, ${captura.chars} chars de texto, CSS crítico ${(captura.cssCritico.length / 1024).toFixed(0)} KB)`,
    )
  }
  console.log('[prerender] concluído.')
}

await main()
