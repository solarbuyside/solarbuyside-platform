/**
 * Gera as miniaturas das páginas de ÍNDICE dos livros do kit para a LP.
 *
 * Era `gerar-indice-manual.mjs`, só do Manual. Virou um script só com um mapa
 * de livros quando o Código do Vendedor ganhou a mesma tira na LP (Gabriel,
 * 09/08: "do mesmo jeito que tu fez isso aqui, faça no bloco do Código do
 * Vendedor Consultivo"). Duplicar o arquivo deixaria dois lugares para
 * consertar quando o pipeline mudar, e a única diferença entre eles seriam
 * três constantes.
 *
 * POR QUE MOSTRAR O ÍNDICE: ele é a única parte de um livro que mostra o
 * tamanho e a organização de uma vez, sem entregar o conteúdo. Na LP é prova
 * de volume, não material de leitura — por isso as páginas aparecem pequenas
 * na tira. Quem quiser ler de perto abre o lightbox.
 *
 * POR QUE UM SCRIPT E NÃO PNGs SOLTOS NO REPOSITÓRIO: quando um livro for
 * revisado, o índice muda de página e de conteúdo. Rodar isto de novo é mais
 * barato, e menos sujeito a esquecimento, do que recortar à mão.
 *
 *   node scripts/gerar-indice.mjs manual        # p. 8 a 14
 *   node scripts/gerar-indice.mjs codigo        # p. 3 a 4
 *   node scripts/gerar-indice.mjs codigo 3 5    # intervalo explícito
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

/* Os intervalos são as páginas de índice de cada PDF, conferidas lendo o texto
   das páginas (e não chutadas): no Manual o índice ocupa 7 páginas, no Código
   ocupa 2. Se um livro for reeditado, confira de novo antes de rodar.

   O PDF do Código foi convertido do `V21_Código_do_Vendedor_Consultivo.docx`
   que o Gabriel deixou na raiz do repositório. */
const LIVROS = {
  manual: {
    pdf: 'Manual  Solar Buy-Side 02.06.2026.pdf',
    prefixo: 'manual-indice',
    primeira: 8,
    ultima: 14,
  },
  codigo: {
    pdf: 'Codigo do Vendedor Consultivo V21.pdf',
    prefixo: 'codigo-indice',
    primeira: 3,
    ultima: 4,
  },
}

const nome = process.argv[2]
const livro = LIVROS[nome]
if (!livro) {
  console.error(`Uso: node scripts/gerar-indice.mjs <${Object.keys(LIVROS).join('|')}> [primeira] [ultima]`)
  process.exit(1)
}

const PDF = path.join(PLATFORM, 'public', livro.pdf)
const PRIMEIRA = Number(process.argv[3] ?? livro.primeira)
const ULTIMA = Number(process.argv[4] ?? livro.ultima)

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
console.log(`Gerando p. ${PRIMEIRA} a ${ULTIMA} como "${livro.prefixo}-pNN.png" em ${LANDING_ASSETS}\n`)

if (ULTIMA > doc.numPages) {
  console.error(`O PDF tem ${doc.numPages} páginas; ${ULTIMA} não existe.`)
  process.exit(1)
}

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

  const saida = path.join(LANDING_ASSETS, `${livro.prefixo}-p${String(n).padStart(2, '0')}.png`)
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
