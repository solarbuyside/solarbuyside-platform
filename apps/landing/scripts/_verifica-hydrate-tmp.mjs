// Prova da hidratação: (1) zero erros de hydration no console; (2) o nó do h1
// SOBREVIVE ao mount (marcador setado pré-JS continua lá => o React adotou o
// DOM, não descartou); (3) sem JS o conteúdo segue visível; (4) reveals
// funcionam pós-hidratação; (5) LCP ancora no primeiro paint.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const DIST = path.resolve(import.meta.dirname, '../dist')
const ORIGEM = 'http://sbs-prerender.local'
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp' }

async function servir(page) {
  await page.setRequestInterception(true)
  page.on('request', async (req) => {
    const u = new URL(req.url())
    if (u.origin !== ORIGEM) {
      if (u.pathname.startsWith('/rest/v1/landing_events')) return req.respond({ status: 201, body: '' })
      return req.continue()
    }
    const semExt = !path.extname(u.pathname)
    const arquivo = semExt
      ? path.join(DIST, u.pathname === '/' ? 'index.html' : `${decodeURIComponent(u.pathname)}/index.html`)
      : path.join(DIST, decodeURIComponent(u.pathname))
    try { return req.respond({ status: 200, contentType: MIME[path.extname(arquivo)] ?? 'text/html', body: await readFile(arquivo) }) }
    catch { return req.respond({ status: 404, body: 'nf' }) }
  })
}

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })

// 1+2+4+5: com JS
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1350, height: 940 })
  await servir(page)
  const consoleErros = []
  page.on('console', (m) => {
    if (m.type() === 'error' || /hydrat|Hydrat|mismatch/i.test(m.text())) consoleErros.push(`${m.type()}: ${m.text().slice(0, 160)}`)
  })
  page.on('pageerror', (e) => consoleErros.push(`pageerror: ${String(e).slice(0, 160)}`))
  await page.evaluateOnNewDocument(() => {
    window.__lcp = []
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp.push({ t: Math.round(e.startTime), size: e.size, tag: e.element?.tagName })
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    const marca = () => {
      const h1 = document.querySelector('h1')
      if (h1 && !h1.dataset.marcador) h1.dataset.marcador = 'estatico'
      if (!window.__marcou && h1) window.__marcou = true
      if (performance.now() < 3000 && !window.__marcou) setTimeout(marca, 5)
      else if (performance.now() < 200) setTimeout(marca, 5)
    }
    setTimeout(marca, 0)
  })
  await page.goto(ORIGEM + '/', { waitUntil: 'networkidle0', timeout: 90000 })
  await new Promise((r) => setTimeout(r, 2500))
  const r = await page.evaluate(() => ({
    sobreviveu: document.querySelector('h1')?.dataset.marcador === 'estatico',
    pre: document.documentElement.classList.contains('pre'),
    js: document.documentElement.classList.contains('js'),
    temConteudo: Boolean(window.__SBS_CONTENT__),
    chars: document.body.innerText.replace(/\s+/g, ' ').length,
    lcp: window.__lcp,
  }))
  console.log('COM JS:', JSON.stringify({ ...r, lcp: undefined }))
  console.log('LCP entries:', JSON.stringify(r.lcp))
  console.log('erros de console:', consoleErros.length ? consoleErros.slice(0, 6) : 'nenhum')

  const antes = await page.evaluate(() => document.querySelectorAll('.v4r.in').length)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
  await new Promise((r) => setTimeout(r, 1200))
  const depois = await page.evaluate(() => document.querySelectorAll('.v4r.in').length)
  console.log(`reveals .in: ${antes} -> ${depois} (deve crescer)`)
  await page.close()
}

// 3: sem JS — conteúdo visível (opacidade do h1 e de um bloco de baixo)
{
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(false)
  await page.setViewport({ width: 412, height: 900 })
  await servir(page)
  await page.goto(ORIGEM + '/', { waitUntil: 'load', timeout: 60000 })
  const r = await page.evaluate(() => {
    const w = document.querySelector('h1 .v4-word')
    const baixo = [...document.querySelectorAll('.v4r')].slice(-1)[0]
    return {
      chars: document.body.innerText.replace(/\s+/g, ' ').length,
      h1Opacity: w ? getComputedStyle(w).opacity : null,
      v4rOpacity: baixo ? getComputedStyle(baixo).opacity : null,
    }
  })
  console.log('SEM JS:', JSON.stringify(r))
  await page.close()
}
await browser.close()
