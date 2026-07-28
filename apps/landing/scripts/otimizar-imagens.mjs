/**
 * Redimensiona e recomprime os assets da landing, mantendo o formato.
 *
 * Por que existe: public/assets tinha 60 MB e nenhuma imagem estava
 * dimensionada para o tamanho em que aparece. Casos extremos medidos no
 * navegador: livro-de-frente.png com 1024px de largura nativa exibido a 53px,
 * e Edivaldo.png com 5,6 MB. Fotos salvas em PNG são a maior fonte do peso.
 *
 * Como decide a largura: mediu-se, com Playwright, o MAIOR tamanho de
 * exibição de cada imagem em mobile (412px) e desktop (1440px), nas rotas /
 * e /1. A largura final é 3x esse valor, com piso de 360px — ou seja, o dobro
 * do necessário para telas retina. A folga é intencional: se um layout
 * futuro exibir a imagem maior, ainda há resolução sobrando.
 *
 * Nunca aumenta uma imagem: se a nativa já é menor que o alvo, é só
 * recomprimida. Ovídio2.png é exatamente esse caso — está abaixo do ideal
 * para retina e reduzi-la teria piorado a nitidez.
 *
 * Uso:
 *   node scripts/otimizar-imagens.mjs --dry     (só relatório)
 *   node scripts/otimizar-imagens.mjs           (aplica)
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync, statSync, existsSync } from 'fs'
import path from 'path'

const RAIZ = path.resolve(import.meta.dirname, '../public/assets')
const DRY = process.argv.includes('--dry')
const PISO = 360
const FATOR = 1.5 // sobre o alvo já calculado (que é 2x a exibição) => 3x a exibição

// arquivo -> maior largura de exibição x2, medido no navegador
const ALVOS = {
  'Edivaldo.png': 652,
  'empresariomanualk.png': 712,
  'Manual de Compra -OF.png': 832,
  'livro-de-frente.png': 106,
  'codigo-oficial-norm.png': 600,
  'Rogerio_cleanup.png': 652,
  'mockup-codigo-vendedor.png': 720,
  'foto-o-codigo-do-vendedor.png': 760,
  'Capa-manual-buy-side-definitiva.png': 780,
  'manual-norm.png': 238,
  'jorge of_cleanup.png': 688,
  'Ovídio2.png': 734,
  'Integrador_Lucas_BH.jpg': 840,
  'Francis Poloni LP PRO.jpg.jpeg': 734,
  'LOGOSOLARBUYSIDE3.png': 96,
  'cms-01-7bfdc9eed5.png': 840,
  'cms-02-4bd1ab7655.png': 724,
  'cms-03-03aada3113.png': 652,
  'Lucineide 1.png': 652,
  'Ricardo 1.png': 652,
  'Integrador_Rodrigo_SP.png': 652,
  'codigo-norm.png': 600,
  'coletiva-norm.png': 600,
  'capa-plataforma-tablet.png': 780,
  'capa-video-solar.jpeg': 840,
  'img-coletiva-frente.png': 780,
  'manual.jpg.png': 780,
  'Mockup_Manual.png': 780,
  'img-hero-solar.png': 1600,
  'equipe-vendas-solar.png': 1200,
}

const kb = (n) => (n / 1024).toFixed(0)
let antes = 0
let depois = 0
const linhas = []

for (const [arquivo, alvo] of Object.entries(ALVOS)) {
  const p = path.join(RAIZ, arquivo)
  if (!existsSync(p)) {
    linhas.push([arquivo, '—', '—', 'ausente'])
    continue
  }

  const tamAntes = statSync(p).size
  const buf = readFileSync(p)
  const meta = await sharp(buf).metadata()

  const largura = Math.min(meta.width, Math.max(Math.round(alvo * FATOR), PISO))
  const ehJpeg = /jpe?g$/i.test(meta.format) || /\.jpe?g$/i.test(arquivo)

  let pipe = sharp(buf)
  if (largura < meta.width) pipe = pipe.resize({ width: largura, withoutEnlargement: true })

  // PNG com paleta: fotos guardadas em PNG são o grosso do peso aqui.
  // effort 10 + palette costuma cortar 80–90% sem diferença perceptível.
  const out = ehJpeg
    ? await pipe.jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer()
    : await pipe.png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 }).toBuffer()

  // Só grava se realmente encolheu — nunca piorar um arquivo.
  const ganhou = out.length < tamAntes
  antes += tamAntes
  depois += ganhou ? out.length : tamAntes

  linhas.push([
    arquivo,
    `${meta.width}x${meta.height}`,
    largura < meta.width ? `${largura}px` : 'mantém',
    ganhou ? `${kb(tamAntes)}KB -> ${kb(out.length)}KB  (-${(100 - (out.length / tamAntes) * 100).toFixed(0)}%)` : 'sem ganho',
  ])

  if (!DRY && ganhou) writeFileSync(p, out)
}

console.log('arquivo'.padEnd(40), 'nativo'.padEnd(12), 'largura'.padEnd(9), 'peso')
console.log('-'.repeat(96))
for (const l of linhas) console.log(l[0].slice(0, 39).padEnd(40), l[1].padEnd(12), l[2].padEnd(9), l[3])
console.log('-'.repeat(96))
console.log(`TOTAL: ${(antes / 1024 / 1024).toFixed(1)} MB -> ${(depois / 1024 / 1024).toFixed(1)} MB  (-${(100 - (depois / antes) * 100).toFixed(0)}%)`)
if (DRY) console.log('\n(dry-run — nada gravado)')
