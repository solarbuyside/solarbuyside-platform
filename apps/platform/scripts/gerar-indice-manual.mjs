/**
 * Gera as miniaturas das páginas do ÍNDICE do Manual Solar Buy-Side para a LP.
 *
 * Francis, revisão de 06/08/2026, slide 12: "criar mockup do manual com as 7
 * páginas do ÍNDICE, p. 8 a 14". O Manual tem 161 páginas e 160 tópicos; o
 * índice é a única parte que mostra esse tamanho de uma vez, sem entregar
 * conteúdo. É prova de volume, não material de leitura: na LP as páginas
 * aparecem pequenas, de propósito.
 *
 * Por que um script e não um PNG solto no repositório: quando o Manual for
 * revisado, o índice muda de página e de conteúdo. Rodar isto de novo é mais
 * barato (e menos sujeito a esquecimento) do que recortar à mão.
 *
 *   node scripts/gerar-indice-manual.mjs            # p. 8 a 14
 *   node scripts/gerar-indice-manual.mjs 8 14       # intervalo explícito
 *
 * Depois de rodar, gere o WebP e as dimensões na landing:
 *   cd ../landing && node scripts/gerar-webp.mjs && node scripts/gerar-dimensoes.mjs
 *
 * O script vive aqui (e não em apps/landing/scripts) porque pdfjs-dist e
 * @napi-rs/canvas são dependências declaradas DESTE app. ESM resolve
 * node_modules a partir da pasta do arquivo, não do cwd.
 */

import { createRequire } from 'node:module'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const AQUI = path.dirname(fileURLToPath(import.meta.url))
const PLATFORM = path.resolve(AQUI, '..')
const LANDING_ASSETS = path.resolve(PLATFORM, '../landing/public/assets')

const PDF = path.join(PLATFORM, 'public', 'Manual  Solar Buy-Side 02.06.2026.pdf')
const PRIMEIRA = Number(process.argv[2] ?? 8)
const ULTIMA = Number(process.argv[3] ?? 14)

/** Largura final de cada miniatura. Na LP elas aparecem a ~260px; 520 cobre
 *  telas 2x sem virar um arquivo de 700 KB por página. */
const LARGURA = 520
/** Escala de renderização antes do downscale. 2 já dá nitidez de sobra depois
 *  do sharp reduzir para 520px, e mantém o passo intermediário leve. */
const ESCALA = 2

const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
const { createCanvas } = require('@napi-rs/canvas')
const sharp = require('sharp')

const doc = await getDocument({ url: PDF, useSystemFonts: true, verbosity: 0 }).promise
console.log(`PDF: ${path.basename(PDF)} (${doc.numPages} páginas)`)
console.log(`Gerando p. ${PRIMEIRA} a ${ULTIMA} em ${LANDING_ASSETS}\n`)

await fs.mkdir(LANDING_ASSETS, { recursive: true })

for (let n = PRIMEIRA; n <= ULTIMA; n++) {
  const pagina = await doc.getPage(n)
  const viewport = pagina.getViewport({ scale: ESCALA })
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
  const ctx = canvas.getContext('2d')

  // O PDF não pinta o fundo: sem isto a página sai com transparência e o texto
  // preto fica ilegível sobre o fundo escuro da seção.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // pdfjs 5.x exige `canvas` além do `canvasContext` quando roda no Node.
  await pagina.render({ canvas, canvasContext: ctx, viewport }).promise

  const saida = path.join(LANDING_ASSETS, `manual-indice-p${String(n).padStart(2, '0')}.png`)
  const info = await sharp(canvas.toBuffer('image/png'))
    .resize({ width: LARGURA, withoutEnlargement: true })
    // palette: o índice é texto preto e azul sobre branco, pouquíssimas cores.
    // Em PNG indexado cada página cai de ~700 KB para ~60 KB sem perda visível.
    .png({ compressionLevel: 9, palette: true })
    .toFile(saida)

  console.log(`  p.${String(n).padStart(2, '0')}  ${path.basename(saida)}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
}

console.log(`\nPronto: ${ULTIMA - PRIMEIRA + 1} páginas.`)
console.log('Agora rode, em apps/landing: node scripts/gerar-webp.mjs && node scripts/gerar-dimensoes.mjs')
