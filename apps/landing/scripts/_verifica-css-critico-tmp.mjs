/**
 * Verificação do CSS crítico inline (rodada 29/07). Dois modos:
 *   node scripts/_verifica-css-critico-tmp.mjs capturar <dirSaida>
 *     — tira screenshots determinísticos do dist/ atual (raiz desktop/mobile
 *       com e sem JS; /1 e política sem JS) e grava PNGs no dir.
 *   node scripts/_verifica-css-critico-tmp.mjs comparar <dirBaseline> <dirNovo>
 *     — compara PNG a PNG, pixel a pixel (sharp). Falha se qualquer par
 *       diferir. 0,00% é o gate de subida.
 *
 * Determinismo: animation/transition zeradas via addStyleTag ANTES do
 * screenshot nos dois lados — o marquee dos apoiadores e os reveals pausam no
 * estado final, idêntico entre builds.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const DIST = path.resolve(import.meta.dirname, '../dist')
const ORIGEM = 'http://sbs-prerender.local'
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
}

const CAPTURAS = [
  { nome: 'raiz-desktop-comjs', rota: '/', viewport: [1366, 900], js: true },
  { nome: 'raiz-mobile-comjs', rota: '/', viewport: [390, 844], js: true },
  { nome: 'raiz-desktop-semjs', rota: '/', viewport: [1366, 900], js: false },
  { nome: 'raiz-mobile-semjs', rota: '/', viewport: [390, 844], js: false },
  { nome: 'um-desktop-comjs', rota: '/1', viewport: [1366, 900], js: true },
  { nome: 'um-desktop-semjs', rota: '/1', viewport: [1366, 900], js: false },
  { nome: 'politica-desktop-semjs', rota: '/politica-de-privacidade', viewport: [1366, 900], js: false },
]

async function servir(page) {
  await page.setRequestInterception(true)
  page.on('request', async (req) => {
    let u
    try { u = new URL(req.url()) } catch { return req.abort() }
    if (u.origin !== ORIGEM) {
      if (u.pathname.startsWith('/rest/v1/landing_events')) return req.respond({ status: 201, body: '' })
      if (/vercel-scripts|vercel-insights/.test(u.hostname)) return req.abort()
      return req.continue()
    }
    const semExt = !path.extname(u.pathname)
    const arquivo = semExt
      ? path.join(DIST, u.pathname === '/' ? 'index.html' : `${decodeURIComponent(u.pathname)}/index.html`)
      : path.join(DIST, decodeURIComponent(u.pathname))
    try {
      return req.respond({ status: 200, contentType: MIME[path.extname(arquivo)] ?? 'text/html', body: await readFile(arquivo) })
    } catch {
      return req.respond({ status: 404, body: 'nf' })
    }
  })
}

function acharChrome() {
  const candidatos = [
    process.env.PRERENDER_EXECUTABLE,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean)
  const achado = candidatos.find((p) => existsSync(p))
  if (!achado) throw new Error('Chrome não encontrado')
  return achado
}

async function capturar(dir) {
  await mkdir(dir, { recursive: true })
  const browser = await puppeteer.launch({ executablePath: acharChrome(), headless: true })
  try {
    for (const cap of CAPTURAS) {
      const page = await browser.newPage()
      await page.setViewport({ width: cap.viewport[0], height: cap.viewport[1] })
      await page.setJavaScriptEnabled(cap.js)
      await servir(page)
      await page.goto(ORIGEM + cap.rota, { waitUntil: cap.js ? 'networkidle0' : 'load', timeout: 90_000 })
      await new Promise((r) => setTimeout(r, cap.js ? 2500 : 1500))
      if (cap.js) {
        // Rola tudo para reveals e contadores assentarem no estado final.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 60))
          }
          window.scrollTo(0, 0)
        })
        await new Promise((r) => setTimeout(r, 1200))
        // Estado final FORÇADO: screenshot não pode depender do timing do
        // IntersectionObserver (flake). Tudo revelado, nos dois builds.
        await page.evaluate(() => {
          document.querySelectorAll('.v4r:not(.in)').forEach((el) => el.classList.add('in'))
          document.querySelectorAll('.v4-words:not(.go)').forEach((el) => el.classList.add('go'))
        })
      }
      // Estado final determinístico: sem animação/transição nos dois builds.
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' })
      await new Promise((r) => setTimeout(r, 300))
      await page.screenshot({ path: path.join(dir, `${cap.nome}.png`), fullPage: true })
      const extra = cap.js
        ? await page.evaluate(() => ({
            chars: document.body.innerText.replace(/\s+/g, ' ').length,
            reveals: document.querySelectorAll('.v4r.in').length,
          }))
        : null
      console.log(`  ${cap.nome}.png ok${extra ? ` (${extra.chars} chars, ${extra.reveals} reveals)` : ''}`)
      await page.close()
    }
  } finally {
    await browser.close()
  }
}

async function comparar(dirA, dirB) {
  let falhas = 0
  for (const cap of CAPTURAS) {
    const [a, b] = await Promise.all([
      sharp(path.join(dirA, `${cap.nome}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(path.join(dirB, `${cap.nome}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    ])
    if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
      console.log(`  DIFERE ${cap.nome}: dimensões ${a.info.width}x${a.info.height} vs ${b.info.width}x${b.info.height}`)
      falhas++
      continue
    }
    let diferentes = 0
    for (let i = 0; i < a.data.length; i += 4) {
      if (
        Math.abs(a.data[i] - b.data[i]) > 2 ||
        Math.abs(a.data[i + 1] - b.data[i + 1]) > 2 ||
        Math.abs(a.data[i + 2] - b.data[i + 2]) > 2
      ) diferentes++
    }
    const total = a.info.width * a.info.height
    const pct = (100 * diferentes) / total
    console.log(`  ${pct === 0 ? 'IGUAL ' : 'DIFERE'} ${cap.nome}: ${pct.toFixed(4)}% (${diferentes}/${total} px)`)
    if (pct > 0) {
      falhas++
      // Mapa da diferença para inspeção
      const diff = Buffer.alloc(a.data.length)
      for (let i = 0; i < a.data.length; i += 4) {
        const d = Math.abs(a.data[i] - b.data[i]) > 2 || Math.abs(a.data[i + 1] - b.data[i + 1]) > 2 || Math.abs(a.data[i + 2] - b.data[i + 2]) > 2
        diff[i] = d ? 255 : a.data[i] / 4
        diff[i + 1] = d ? 0 : a.data[i + 1] / 4
        diff[i + 2] = d ? 0 : a.data[i + 2] / 4
        diff[i + 3] = 255
      }
      await writeFile(
        path.join(dirB, `${cap.nome}.DIFF.png`),
        await sharp(diff, { raw: { width: a.info.width, height: a.info.height, channels: 4 } }).png().toBuffer(),
      )
    }
  }
  if (falhas > 0) {
    console.error(`\n${falhas} captura(s) diferem — NÃO SUBIR.`)
    process.exit(1)
  }
  console.log('\nTodas as capturas idênticas (0,0000%).')
}

const [modo, arg1, arg2] = process.argv.slice(2)
if (modo === 'capturar' && arg1) await capturar(arg1)
else if (modo === 'comparar' && arg1 && arg2) await comparar(arg1, arg2)
else {
  console.error('uso: capturar <dir> | comparar <dirBaseline> <dirNovo>')
  process.exit(1)
}
