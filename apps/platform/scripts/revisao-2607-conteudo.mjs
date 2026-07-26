#!/usr/bin/env node
/**
 * Revisão do Gabriel de 26/07/2026: ajustes de CONTEÚDO no Supabase.
 *
 * Diferente do criar-secoes-admin.mjs (que só preenche lacuna), aqui há
 * substituição deliberada. Cada bloco abaixo diz o porquê.
 *
 *   node apps/platform/scripts/revisao-2607-conteudo.mjs --dry
 *   node apps/platform/scripts/revisao-2607-conteudo.mjs
 *
 * ⚠️ Muda a LP no ar na hora.
 */

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const AQUI = dirname(fileURLToPath(import.meta.url))
const DRY = process.argv.includes('--dry')

function lerEnv() {
  for (const nome of ['../.env.local', '../.env']) {
    const caminho = resolve(AQUI, nome)
    if (!existsSync(caminho)) continue
    const out = {}
    for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
      const m = linha.match(/^([A-Za-z0-9_]+)=(.*)$/)
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
    if (out.NEXT_PUBLIC_SUPABASE_URL && out.SUPABASE_SERVICE_ROLE_KEY) return out
  }
  throw new Error('faltou NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
}
const env = lerEnv()
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const H = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}
const MAX_LOGOS = 30

/* ── 1) Apoiadores: lista e ordem definidas pelo cliente ─────────────────
   Ordem dos Fabricantes ditada em 26/07: Clamper, Stäubli, LONGi, Solis,
   Hoymiles, Fluke, Huawei, Unipower, Sil. A BelEnergy entra DUAS vezes (é
   distribuidora âncora e também fabrica fixação e carregador); a terceira
   entrada espera os logos distintos. Proauto sai (não está na lista). A
   Electro Graphics volta: tinha sumido porque a chave ficou vazia. */
const LOGOS = [
  ['belenergy', 'BelEnergy', 'Distribuidora Âncora Solar Buy-Side', 'Distribuidora de equipamentos fotovoltaicos e parceira âncora do movimento Solar Buy-Side.'],
  ['belenergy', 'BelEnergy', 'Fabricantes', 'Fabrica sistema de fixação de módulo e carregador de veículo elétrico.'],
  ['clamper', 'Clamper', 'Fabricantes', 'Fabricante brasileira de dispositivos de proteção contra surtos elétricos.'],
  ['staubli', 'Stäubli', 'Fabricantes', 'Fabricante suíça de conectores fotovoltaicos e soluções de conexão elétrica.'],
  ['longi', 'Longi Solar', 'Fabricantes', 'Um dos maiores fabricantes mundiais de módulos fotovoltaicos.'],
  ['solis', 'Solis', 'Fabricantes', 'Fabricante global de inversores solares.'],
  ['hoymiles', 'Hoymiles', 'Fabricantes', 'Fabricante de microinversores e otimizadores para geração distribuída.'],
  ['fluke', 'Fluke', 'Fabricantes', 'Fabricante global de instrumentos de medição e diagnóstico elétrico.'],
  ['huawei', 'Huawei', 'Fabricantes', 'Fabricante global de inversores e soluções de energia inteligente.'],
  ['unipower', 'Unipower', 'Fabricantes', 'Marca UCB Power, fabricante de baterias e soluções de energia.'],
  ['sil', 'Sil', 'Fabricantes', 'Fabricante brasileira de fios e cabos elétricos.'],
  ['solergo', 'Electro Graphics', 'Tecnologia, Serviços e Seguros', 'Desenvolvedora do SOLergo, software de projeto e dimensionamento de sistemas fotovoltaicos.'],
  ['solarview', 'SolarView', 'Tecnologia, Serviços e Seguros', 'Plataforma de monitoramento de sistemas fotovoltaicos.'],
  ['pvclean', 'PV Clean', 'Tecnologia, Serviços e Seguros', 'Tecnologia e serviços de limpeza e manutenção de usinas fotovoltaicas.'],
  ['eletron-seguro-solar', 'Elétron Seguro Solar', 'Tecnologia, Serviços e Seguros', 'Seguros especializados para sistemas de energia solar.'],
  ['santander', 'Santander', 'Financiamento Solar', 'Financiamento para projetos de energia solar.'],
  ['energy-channel', 'Energy Channel', 'Mídia Solar', 'Canal de mídia e conteúdo especializado no setor de energia solar.'],
]

const apoiadoresTexts = {
  // Redação do slide 16 do Francis. O banco tinha "Players nacionais e
  // internacionais...", que não é o texto aprovado.
  subtitle:
    'Empresas referência no mercado solar apoiam o Movimento Solar Buy-Side e contribuem para um novo padrão de profissionalismo, transparência e geração de valor no setor.',
}
const apoiadoresImages = {}
LOGOS.forEach(([slug, nome, cat, desc], i) => {
  const n = i + 1
  apoiadoresTexts[`logo${n}Name`] = nome
  apoiadoresTexts[`logo${n}Cat`] = cat
  apoiadoresTexts[`logo${n}Desc`] = desc
  apoiadoresImages[`logo${n}Src`] = `/assets/apoiadores/${slug}.png`
})
// Zera o resto: posição ausente no banco faz o logo do ContentData reaparecer.
for (let i = LOGOS.length + 1; i <= MAX_LOGOS; i++) {
  apoiadoresTexts[`logo${i}Name`] = ''
  apoiadoresTexts[`logo${i}Cat`] = ''
  apoiadoresTexts[`logo${i}Desc`] = ''
  apoiadoresImages[`logo${i}Src`] = ''
}

/* ── 2) Promo: "Compra agora" -> "Compre agora" (imperativo) ──────────── */
const PRECO = {
  promoNote:
    'Compre agora e reembolsamos a diferença de <span class="cms-orange">R$ 119,55</span> sob apresentação do cupom!',
}

/* ── 3) Travessões que sobraram, vindos de texto escrito no admin. A LP não
   usa travessão. Troca só o caractere, o resto da frase fica idêntico. ─── */
const SEM_TRAVESSAO = ['authority', 'manual-strategic']

async function pegar(id) {
  const r = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.${id}&select=*`, { headers: H })
  if (!r.ok) throw new Error(`GET ${id}: ${r.status}`)
  return (await r.json())[0] ?? null
}

async function gravar(id, textos, imagens = {}) {
  const atual = await pegar(id)
  if (!atual) { console.log(`[${id}] NAO EXISTE, pulando`); return }

  const texts = { ...(atual.texts ?? {}) }
  const draft = { ...(atual.texts_draft ?? atual.texts ?? {}) }
  const images = { ...(atual.images ?? {}) }
  const imagesDraft = { ...(atual.images_draft ?? atual.images ?? {}) }

  const mudou = []
  for (const [k, v] of Object.entries(textos)) {
    if (texts[k] !== v) mudou.push(k)
    texts[k] = v; draft[k] = v
  }
  for (const [k, v] of Object.entries(imagens)) {
    if (images[k] !== v) mudou.push(k)
    images[k] = v; imagesDraft[k] = v
  }
  console.log(`[${id}] ${mudou.length} chave(s) alterada(s)`)
  if (DRY) return

  const r = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ texts, texts_draft: draft, images, images_draft: imagesDraft }),
  })
  if (!r.ok) throw new Error(`PATCH ${id}: ${r.status} ${await r.text()}`)
  console.log('   OK')
}

console.log(DRY ? '=== DRY RUN ===' : '=== APLICANDO ===')
await gravar('apoiadores', apoiadoresTexts, apoiadoresImages)
await gravar('pricing', PRECO)

for (const id of SEM_TRAVESSAO) {
  const s = await pegar(id)
  if (!s) continue
  const arrumado = {}
  for (const [k, v] of Object.entries(s.texts ?? {})) {
    if (typeof v === 'string' && v.includes('—')) {
      arrumado[k] = v.replace(/\s*—\s*/g, ', ')
      console.log(`[${id}] travessao em "${k}"`)
      console.log(`   antes:  ${v}`)
      console.log(`   depois: ${arrumado[k]}`)
    }
  }
  if (Object.keys(arrumado).length) await gravar(id, arrumado)
}

console.log(DRY ? '\n(nada gravado)' : '\nPronto.')
