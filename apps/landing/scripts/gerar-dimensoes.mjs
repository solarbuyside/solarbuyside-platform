/**
 * Gera o manifesto de dimensões intrínsecas que o átomo <Img> consome.
 *
 * Por que existe: as 39 imagens da LP iam para o HTML sem width/height. Sem
 * esses atributos o navegador não sabe a proporção antes do byte da imagem
 * chegar, reserva altura zero e empurra o conteúdo quando ela carrega — é CLS
 * puro, e a LP é quase toda imagem abaixo da dobra.
 *
 * Por que um manifesto em vez de escrever os números nos componentes: o src
 * pode vir do CMS, e ninguém vai medir imagem à mão a cada troca. O <Img> só
 * emite width/height para caminhos listados aqui; o resto sai como antes.
 *
 * Os atributos são a PROPORÇÃO, não o tamanho de exibição — o CSS continua
 * mandando no tamanho real (ver a regra `img { height: auto }` em v4.css, que
 * impede o height do atributo de virar altura fixa em imagem fluida).
 *
 * Ferramenta manual, fora do build — mesma política do gerar-webp.mjs. Rode
 * junto com ele ao adicionar imagem em public/assets/.
 * Uso: node scripts/gerar-dimensoes.mjs
 */
import sharp from 'sharp'
import { readdirSync, writeFileSync } from 'fs'
import path from 'path'

const ASSETS = path.resolve(import.meta.dirname, '../public/assets')
const MANIFESTO = path.resolve(import.meta.dirname, '../src/v4/dim-manifest.json')

// SVG fica de fora: é vetor, não tem dimensão intrínseca em px que valha como
// proporção confiável (viewBox pode divergir de width/height do arquivo).
const arquivos = readdirSync(ASSETS, { recursive: true })
  .map(String)
  .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))
  .map((f) => f.replaceAll('\\', '/'))

const manifesto = {}
let falhas = 0

for (const nome of arquivos) {
  try {
    const { width, height } = await sharp(path.join(ASSETS, nome)).metadata()
    if (!width || !height) throw new Error('sem dimensão')
    manifesto[`/assets/${nome}`.normalize('NFC')] = [width, height]
  } catch (e) {
    falhas++
    console.log(`  pulado  ${nome} (${e.message})`)
  }
}

writeFileSync(MANIFESTO, `${JSON.stringify(Object.fromEntries(Object.entries(manifesto).sort()), null, 2)}\n`)
console.log(`\n${Object.keys(manifesto).length}/${arquivos.length} com dimensão${falhas ? ` (${falhas} falha(s))` : ''}`)
console.log(`manifesto: ${MANIFESTO}`)
