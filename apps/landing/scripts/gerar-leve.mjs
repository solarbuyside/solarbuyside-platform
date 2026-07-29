/**
 * /leve — cópia de diagnóstico da home com o <head> reduzido ao osso.
 *
 * Por que existe: três pipelines de extração de IA (claude.ai, ChatGPT) leem
 * as páginas legais desta origem (60–80 KB) e devolvem vazio na home (301 KB).
 * Mesma infra, mesmo build, mesmo prerender, mesmos bytes para qualquer
 * User-Agent — já testado. A variável que sobra é o TAMANHO do documento.
 *
 * Esta rota isola essa variável: mesmo <body> da home, sem os três blocos que
 * engordam o <head> — CSS crítico inline (73 KB), window.__SBS_CONTENT__
 * (43 KB) e as @font-face inlinadas (23 KB). O CSS volta como folha externa,
 * então a página continua renderizando.
 *
 * Como ler o resultado:
 * - /leve é lida e / não  -> o teto está entre os dois tamanhos; enxugar a
 *   home resolve, e aí vale pagar o custo (podar o blob mexe na hidratação,
 *   tirar o CSS inline custa FCP).
 * - /leve também vem vazia -> o teto é menor que o body sozinho, ou o
 *   problema não é tamanho. Nos dois casos, enxugar a home não resolveria
 *   nada e o assunto morre aqui.
 *
 * Página de diagnóstico, não de produção: sai com noindex e fora do sitemap,
 * para não competir com a raiz nem virar conteúdo duplicado. Apagar quando o
 * teste terminar.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const ENTRADA = path.join(RAIZ, 'dist', 'index.html')
const SAIDA = path.join(RAIZ, 'dist', 'leve', 'index.html')

const html = readFileSync(ENTRADA, 'utf8')

const iBody = html.indexOf('<body')
if (iBody < 0) {
  console.error('[leve] dist/index.html sem <body> — o prerender rodou?')
  process.exit(1)
}
const body = html.slice(iBody)

// A folha externa é a mesma que a home carrega; o prerender troca o <link
// rel=stylesheet> por preload+onload, então o href sai daquele preload.
const css = html.match(/<link rel="preload" as="style"[^>]*href="([^"]+\.css)"/)?.[1]
if (!css) {
  console.error('[leve] não achei o href da folha de estilos no HTML da raiz')
  process.exit(1)
}

const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'Solar Buy-Side'

const saida = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${titulo}</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="https://solarbuyside.com.br/" />
    <link rel="stylesheet" href="${css}" />
  </head>
${body}`

mkdirSync(path.dirname(SAIDA), { recursive: true })
writeFileSync(SAIDA, saida)

const kb = (n) => `${(n / 1024).toFixed(0)} KB`
console.log(`[leve] /leve -> leve/index.html (${kb(saida.length)}; a raiz tem ${kb(html.length)})`)
