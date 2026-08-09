// Shifts em produção com fontes atrasadas (pior caso da corrida) — desktop.
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1350, height: 940 })
await page.setRequestInterception(true)
page.on('request', async (req) => {
  const u = new URL(req.url())
  if (u.hostname === 'fonts.gstatic.com') {
    await new Promise((r) => setTimeout(r, 800))
    return req.continue()
  }
  if (u.pathname.startsWith('/rest/v1/landing_events')) return req.respond({ status: 201, body: '' })
  return req.continue()
})
await page.evaluateOnNewDocument(() => {
  window.__shifts = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__shifts.push({
        t: Math.round(e.startTime),
        score: Math.round(e.value * 10000) / 10000,
        nos: e.sources?.map((s) => {
          const n = s.node
          const cls = n?.className?.toString?.().slice(0, 60)
          return (n?.tagName ?? '?') + (cls ? '.' + cls : '')
        }) ?? [],
      })
    }
  }).observe({ type: 'layout-shift', buffered: true })
})
await page.goto('https://solarbuyside.com.br/', { waitUntil: 'networkidle0', timeout: 120000 })
await new Promise((r) => setTimeout(r, 2500))
const shifts = await page.evaluate(() => window.__shifts)
let total = 0
for (const s of shifts) {
  total += s.score
  console.log(JSON.stringify(s))
}
console.log('CLS total:', Math.round(total * 1000) / 1000)
await browser.close()
