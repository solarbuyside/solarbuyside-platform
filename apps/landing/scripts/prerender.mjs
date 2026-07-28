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
async function validarBanco(url, anon) {
  const headers = { apikey: anon, Authorization: `Bearer ${anon}` }
  let secoes
  try {
    const res = await fetch(`${url}/rest/v1/landing_sections?select=section_id`, { headers })
    if (!res.ok) falhar(`Supabase respondeu ${res.status} para landing_sections — build abortado para não congelar conteúdo default.`)
    secoes = await res.json()
  } catch (e) {
    falhar(`fetch do Supabase falhou (${e.message}) — build abortado para não congelar conteúdo default.`)
  }
  if (!Array.isArray(secoes) || secoes.length === 0) {
    falhar('landing_sections voltou vazio — build abortado para não congelar conteúdo default.')
  }
  return secoes.length
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
  await page.evaluate(() => {
    // Blocos que nunca intersectaram no viewport desktop (ex.: variantes
    // mobile-only) ficariam invisíveis no HTML estático; força o estado final.
    document.querySelectorAll('.v4r:not(.in)').forEach((el) => el.classList.add('in'))
    document.querySelectorAll('.v4-words:not(.go)').forEach((el) => el.classList.add('go'))
    window.scrollTo(0, 0)
  })
  // Estados ligados ao scroll (header, CTA flutuante, contadores) assentam.
  await new Promise((r) => setTimeout(r, 1500))

  const { html, titulo, texto } = await page.evaluate(() => ({
    html: document.querySelector('#root').innerHTML,
    titulo: document.title,
    texto: document.body.innerText,
  }))
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
  return { html, titulo, chars }
}

function montarSaida(template, rota, captura) {
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

  const nSecoes = await validarBanco(supaUrl, supaAnon)
  console.log(`[prerender] banco OK: ${nSecoes} seções em landing_sections`)

  // Template lido UMA vez, antes de a raiz sobrescrever dist/index.html.
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8')

  const browser = await abrirNavegador()
  try {
    for (const rota of ROTAS) {
      const captura = await capturarRota(browser, rota)
      const saida = montarSaida(template, rota, captura)
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
