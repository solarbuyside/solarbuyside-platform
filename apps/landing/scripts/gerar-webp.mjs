/**
 * Gera variantes .webp dos assets e o manifesto que o átomo <Img> consome.
 *
 * Por que manifesto: o src das imagens pode vir do CMS. Emitir <source> WebP
 * para um caminho sem .webp gerado quebra a imagem (o <picture> NÃO cai para
 * o <img> quando o source escolhido dá 404). O componente só oferece WebP
 * para caminhos listados em src/v4/webp-manifest.json — gerado aqui.
 *
 * Regras, na linha do otimizar-imagens.mjs (medir antes de aplicar):
 * - só grava o .webp se ficar pelo menos 5% menor que o original;
 * - qualidade 82; se o erro médio por canal passar de 2,5/255, tenta 90;
 *   se ainda passar, pula o arquivo (nitidez vale mais que os KB);
 * - originais ficam intactos como fallback para navegadores sem WebP.
 *
 * Ferramenta manual, fora do build (mesmo motivo do otimizar-imagens.mjs).
 * Uso: node scripts/gerar-webp.mjs
 */
import sharp from 'sharp'
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import path from 'path'

const ASSETS = path.resolve(import.meta.dirname, '../public/assets')
const MANIFESTO = path.resolve(import.meta.dirname, '../src/v4/webp-manifest.json')
const QUALIDADES = [82, 90]
const ERRO_MAX = 2.5 // erro médio por canal, em 255
const GANHO_MIN = 0.95 // webp precisa ser <= 95% do original

async function erroMedio(origBuf, webpBuf) {
  const [a, b] = await Promise.all([
    sharp(origBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(webpBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ])
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) return Infinity
  let soma = 0
  for (let i = 0; i < a.data.length; i++) soma += Math.abs(a.data[i] - b.data[i])
  return soma / a.data.length
}

// Recursivo: apoiadores/ e cms/ (uploads do admin) também contam — o upload
// de 1,3 MB da seção Plataforma era a maior imagem da página.
const arquivos = readdirSync(ASSETS, { recursive: true })
  .map(String)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .map((f) => f.replaceAll('\\', '/'))
const manifesto = {}
let totalOrig = 0
let totalWebp = 0

for (const nome of arquivos) {
  const arquivo = path.join(ASSETS, nome)
  const orig = readFileSync(arquivo)
  const kbOrig = statSync(arquivo).size / 1024

  let escolhido = null
  let erro = null
  for (const q of QUALIDADES) {
    const webp = await sharp(orig).webp({ quality: q, effort: 6 }).toBuffer()
    if (webp.length > orig.length * GANHO_MIN) break // maior não interessa; q maior só cresce
    erro = await erroMedio(orig, webp)
    if (erro <= ERRO_MAX) {
      escolhido = { webp, q }
      break
    }
  }

  if (!escolhido) {
    console.log(`  pulado  ${nome} (${erro ? `erro ${erro.toFixed(2)}` : 'webp não compensa'})`)
    continue
  }

  const destino = arquivo.replace(/\.(png|jpe?g)$/i, '.webp')
  writeFileSync(destino, escolhido.webp)
  manifesto[`/assets/${nome}`.normalize('NFC')] = true
  totalOrig += orig.length
  totalWebp += escolhido.webp.length
  console.log(
    `  ok      ${nome}  ${kbOrig.toFixed(0)} KB -> ${(escolhido.webp.length / 1024).toFixed(0)} KB (q${escolhido.q}, erro ${erro.toFixed(2)})`,
  )
}

writeFileSync(MANIFESTO, `${JSON.stringify(Object.fromEntries(Object.entries(manifesto).sort()), null, 2)}\n`)
console.log(
  `\n${Object.keys(manifesto).length}/${arquivos.length} com webp — conjunto ${(totalOrig / 1048576).toFixed(1)} MB -> ${(totalWebp / 1048576).toFixed(1)} MB (${Math.round((1 - totalWebp / totalOrig) * 100)}% menor)`,
)
console.log(`manifesto: ${MANIFESTO}`)
