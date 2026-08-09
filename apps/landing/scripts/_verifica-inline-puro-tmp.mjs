/**
 * Prova do primeiro paint real: renderiza a página SÓ com o <style
 * data-critico> (JS desligado, request do /assets/*.css abortado — nem o
 * noscript consegue carregar) e compara com o baseline que usa o CSS completo.
 * Se a extração perdeu qualquer regra do DOM servido, aparece aqui.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const DIST = path.resolve(import.meta.dirname, '../dist')
const ORIGEM = 'http://sbs-prerender.local'
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4',
}
const baseDir = process.argv[2]
if (!baseDir) {
  console.error('uso: node _verifica-inline-puro-tmp.mjs <dirBaseline>')
  process.exit(1)
}

const CAPTURAS = [
  { nome: 'raiz-desktop-semjs', rota: '/', viewport: [1366, 900] },
  { nome: 'raiz-mobile-semjs', rota: '/', viewport: [390, 844] },
  { nome: 'um-desktop-semjs', rota: '/1', viewport: [1366, 900] },
  { nome: 'politica-desktop-semjs', rota: '/politica-de-privacidade', viewport: [1366, 900] },
]

const chrome = [
  process.env.PRERENDER_EXECUTABLE,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean).find((p) => existsSync(p))

const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
let falhas = 0
try {
  for (const cap of CAPTURAS) {
    const page = await browser.newPage()
    await page.setViewport({ width: cap.viewport[0], height: cap.viewport[1] })
    await page.setJavaScriptEnabled(false)
    await page.setRequestInterception(true)
    page.on('request', async (req) => {
      let u
      try { u = new URL(req.url()) } catch { return req.abort() }
      // O ponto do teste: o CSS completo NUNCA chega.
      if (u.pathname.endsWith('.css')) return req.abort()
      if (u.origin !== ORIGEM) return req.continue()
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
    await page.goto(ORIGEM + cap.rota, { waitUntil: 'load', timeout: 90_000 })
    await new Promise((r) => setTimeout(r, 1500))
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' })
    await new Promise((r) => setTimeout(r, 300))
    const png = await page.screenshot({ fullPage: true })
    await page.close()

    const [a, b] = await Promise.all([
      sharp(path.join(baseDir, `${cap.nome}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    ])
    if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
      console.log(`  DIFERE ${cap.nome}: dimensões ${a.info.width}x${a.info.height} vs ${b.info.width}x${b.info.height}`)
      falhas++
      continue
    }
    let dif = 0
    for (let i = 0; i < a.data.length; i += 4) {
      if (
        Math.abs(a.data[i] - b.data[i]) > 2 ||
        Math.abs(a.data[i + 1] - b.data[i + 1]) > 2 ||
        Math.abs(a.data[i + 2] - b.data[i + 2]) > 2
      ) dif++
    }
    const total = a.info.width * a.info.height
    const pct = (100 * dif) / total
    console.log(`  ${pct === 0 ? 'IGUAL ' : 'DIFERE'} ${cap.nome} (inline puro vs CSS completo): ${pct.toFixed(4)}%`)
    if (pct > 0) falhas++
  }
} finally {
  await browser.close()
}
if (falhas) {
  console.error(`\n${falhas} captura(s) diferem — o CSS inline está incompleto. NÃO SUBIR.`)
  process.exit(1)
}
console.log('\nPrimeiro paint com inline puro é IDÊNTICO ao CSS completo.')
