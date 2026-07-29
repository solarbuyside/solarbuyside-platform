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
const ROTAS = [
  { rota: '/', saida: 'index.html', exigeBanco: true, pisoTexto: 10_000 },
  { rota: '/1', saida: '1/index.html', pisoTexto: 10_000 },
  // titulo: a SPA não seta document.title, então as rotas internas herdariam o
  // título da home no HTML estático.
  { rota: '/politica-de-privacidade', saida: 'politica-de-privacidade/index.html', canonical: true, pisoTexto: 1_000, titulo: 'Política de Privacidade — Solar Buy-Side' },
  { rota: '/termos-de-uso', saida: 'termos-de-uso/index.html', canonical: true, pisoTexto: 1_000, titulo: 'Termos de Uso — Solar Buy-Side' },
  { rota: '/medidas-antipiratarias', saida: 'medidas-antipiratarias/index.html', canonical: true, pisoTexto: 1_000, titulo: 'Medidas Antipiratarias — Solar Buy-Side' },
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

  const { html, titulo, texto, conteudo } = await page.evaluate(() => {
    // As classes de reveal (in/go) são adicionadas pelo IntersectionObserver e
    // NÃO existem no primeiro render do React. Ficar com elas no HTML servido
    // quebraria a hidratação (mismatch de className => o React descarta o DOM
    // e volta a repintar, que é o que estamos eliminando). Quem mantém o
    // conteúdo visível sem JS é a regra html:not(.js) do v4.css; após o
    // hydrate, os observers revelam como sempre.
    document.querySelectorAll('.v4r.in').forEach((el) => el.classList.remove('in'))
    document.querySelectorAll('.v4-words.go').forEach((el) => el.classList.remove('go'))
    return {
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
  return { html, titulo, chars, dados, conteudo }
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

function montarSaida(template, rota, captura, secoes) {
  const marcador = /<div id="root">\s*<\/div>/
  if (!marcador.test(template)) falhar('dist/index.html não tem <div id="root"></div> — o template mudou?')
  let saida = template.replace(marcador, () => `<div id="root">${captura.html}</div>`)

  const titulo = rota.titulo ?? captura.titulo
  if (titulo) {
    const escapado = titulo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    saida = saida.replace(/<title>[^<]*<\/title>/, `<title>${escapado}</title>`)
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

  const browser = await abrirNavegador()
  try {
    for (const rota of ROTAS) {
      const captura = await capturarRota(browser, rota)
      const saida = montarSaida(template, rota, captura, secoes)
      const destino = path.join(DIST, rota.saida)
      await mkdir(path.dirname(destino), { recursive: true })
      await writeFile(destino, saida)
      console.log(
        `[prerender] ${rota.rota} -> ${rota.saida} (${(saida.length / 1024).toFixed(0)} KB, ${captura.chars} chars de texto)`,
      )
    }
  } finally {
    await browser.close()
  }
  console.log('[prerender] concluído.')
}

await main()
