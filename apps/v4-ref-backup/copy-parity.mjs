import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// Verifica que toda a copy (fallbacks e depoimentos) da v4 anterior continua
// presente nos arquivos reescritos. Uso: node copy-parity.mjs
const REF = 'D:/plataforma-solarbuy-side/apps/v4-ref-backup'
const NEW = 'D:/plataforma-solarbuy-side/apps/landing/src/v4'

const extract = (src) => {
  const out = new Set()
  const fallback = /\|\|\s*\n?\s*'((?:\\.|[^'\\]){12,})'/g
  let m
  while ((m = fallback.exec(src))) out.add(m[1])
  const prop = /(?:quote|highlight|title|desc|name|role|location|tag|subtitle):\s*\n?\s*'((?:\\.|[^'\\]){20,})'/g
  while ((m = prop.exec(src))) {
    const s = m[1]
    if (/[áéíóúâêôãõç]/i.test(s) && !s.includes('/assets')) out.add(s)
  }
  return out
}

let missing = 0
for (const f of readdirSync(REF).filter((f) => f.endsWith('.tsx'))) {
  const ref = extract(readFileSync(join(REF, f), 'utf8'))
  const cur = readFileSync(join(NEW, f), 'utf8')
  for (const s of ref) {
    if (!cur.includes(s)) {
      missing++
      console.log(`[${f}] FALTA: ${s.slice(0, 100)}`)
    }
  }
}
console.log(missing === 0 ? 'COPY PARITY: OK' : `COPY PARITY: ${missing} strings ausentes`)
