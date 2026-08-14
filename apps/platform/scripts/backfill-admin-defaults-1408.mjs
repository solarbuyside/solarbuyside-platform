#!/usr/bin/env node
/**
 * Materializa no Admin os fallbacks visíveis da LP oficial.
 *
 * Só adiciona chaves AUSENTES. Chave existente, inclusive "", nunca é
 * alterada. Publicado e rascunho são atualizados juntos e o script aborta se
 * encontrar qualquer rascunho pendente. Use --dry primeiro e --apply para
 * gravar. Um snapshot integral é salvo em /tmp antes do primeiro PATCH.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '../.env.local')
const apply = process.argv.includes('--apply')

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8').split('\n').flatMap((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    return match ? [[match[1], match[2].trim().replace(/^["']|["']$/g, '')]] : []
  }),
)
const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Credenciais do Supabase ausentes em apps/platform/.env.local')
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

const manualPages = ['08', '09', '10', '11', '12', '13', '14']
const codePages = ['03', '04']
const pageFields = (prefix, pages, book) => Object.fromEntries(
  pages.flatMap((page, index) => [
    [`${prefix}${index + 1}Label`, `p. ${Number(page)}`],
    [`${prefix}${index + 1}Alt`, `Página ${Number(page)} do ${book}: índice de conteúdo`],
  ]),
)
const pageImages = (prefix, assetPrefix, pages) => Object.fromEntries(
  pages.map((page, index) => [`${prefix}${index + 1}Src`, `/assets/${assetPrefix}-p${page}.png`]),
)

const sections = {
  hero: { texts: {
    navPlatform: 'Plataforma', navMentor: 'Mentor', navPanorama: 'Panorama',
    navVideo: 'Vídeo', navAudience: 'Para Quem', navFaq: 'FAQ', headerCta: 'Garantir Acesso',
  } },
  video: {
    texts: {
      bullet1: 'Os 3 riscos: integrador, tecnológico e financeiro',
      bullet2: 'A solução: o Manual de Compra de Sistema Solar Buy-Side',
      bullet3: 'O resultado: o comprador leigo vira comprador informado',
    },
    images: { videoPoster: '/assets/capa-video-solar.jpeg' },
  },
  apoiadores: { texts: { hoverHint: 'Passe o mouse ou toque nos logos' } },
  'manual-strategic': {
    texts: {
      indexKicker: 'O índice completo',
      indexTitle: 'As 7 páginas de índice do Manual',
      indexLead: 'São 160 tópicos organizados em 4 fases, do primeiro cálculo de consumo à assinatura do contrato. É este roteiro que o seu próximo cliente vai usar para avaliar a sua proposta.',
      codeIndexKicker: 'O índice completo',
      codeIndexTitle: 'Tudo o que o Código cobre, tópico a tópico',
      codeIndexLead: 'Da imersão no olhar do comprador à rodada final de negociação: 4 fases, um roteiro de treinamento em 3 etapas, o mapa do essencial e o checklist Buy-Side.',
      ...pageFields('manualIndexPage', manualPages, 'Manual Solar Buy-Side'),
      ...pageFields('codeIndexPage', codePages, 'Código do Vendedor Consultivo'),
    },
    images: {
      manualImage: '/assets/Capa-manual-buy-side-definitiva.png',
      codeImage: '/assets/codigo-oficial-norm.png',
      ...pageImages('manualIndexPage', 'manual-indice', manualPages),
      ...pageImages('codeIndexPage', 'codigo-indice', codePages),
    },
  },
  transformacao: { texts: {
    row7Hoje: 'Sem diferencial na reunião', row7Depois: 'Autoridade desde o início',
    audienceTitle: 'Para quem o Método Solar Buy-Side foi desenvolvido',
    audience1: 'Empresas de integração solar', audience2: 'Empresas iniciantes',
    audience3: 'Representantes comerciais',
  } },
  pricing: {
    texts: {
      heroKit1Title: 'Manual de Compra de Sistema Solar',
      heroKit2Title: 'Código do Vendedor Consultivo',
      heroKit3Title: 'Plataforma de Avaliação de Proposta Comercial',
      teamNote: 'E tem mais economia: Integradoras Credenciadas <span class="cms-bold">Belenergy</span> garantem 15% OFF.',
    },
    images: {
      teamImage: '/assets/coletiva-norm.png',
      cardPlatformImage: '/assets/capa-plataforma-tablet.png',
    },
  },
}

const stable = (value) => JSON.stringify(value ?? {}, Object.keys(value ?? {}).sort())
const get = async (path) => {
  const response = await fetch(`${url}/rest/v1/${path}`, { headers })
  if (!response.ok) throw new Error(`GET ${path}: ${response.status} ${await response.text()}`)
  return response.json()
}

const rows = await get('landing_sections?select=section_id,name,texts,images,texts_draft,images_draft')
const globals = await get('landing_globals?select=key,value,value_draft')
for (const row of rows) {
  const draftTexts = row.texts_draft ?? row.texts ?? {}
  const draftImages = row.images_draft ?? row.images ?? {}
  if (stable(row.texts) !== stable(draftTexts) || stable(row.images) !== stable(draftImages)) {
    throw new Error(`Abortado: ${row.section_id} possui rascunho pendente.`)
  }
}
for (const item of globals) {
  if ((item.value_draft ?? item.value ?? '') !== (item.value ?? '')) {
    throw new Error(`Abortado: global ${item.key} possui rascunho pendente.`)
  }
}

const byId = new Map(rows.map((row) => [row.section_id, row]))
const changes = []
for (const [sectionId, defaults] of Object.entries(sections)) {
  const row = byId.get(sectionId)
  if (!row) throw new Error(`Seção ausente: ${sectionId}`)
  const texts = { ...(row.texts ?? {}) }
  const images = { ...(row.images ?? {}) }
  const addedTexts = []
  const addedImages = []
  for (const [field, value] of Object.entries(defaults.texts ?? {})) {
    if (texts[field] !== undefined) continue
    texts[field] = value
    addedTexts.push(field)
  }
  for (const [field, value] of Object.entries(defaults.images ?? {})) {
    if (images[field] !== undefined) continue
    images[field] = value
    addedImages.push(field)
  }
  if (addedTexts.length || addedImages.length) changes.push({ sectionId, texts, images, addedTexts, addedImages })
}

const globalDefaults = { logo: '/assets/LOGOSOLARBUYSIDE3.png', favicon: '/favicon.png' }
const existingGlobals = new Map(globals.map((item) => [item.key, item]))
const newGlobals = Object.entries(globalDefaults).filter(([field]) => !existingGlobals.has(field))

console.log(`${apply ? 'APLICAR' : 'DRY-RUN'}: ${changes.length} seções, ${changes.reduce((n, c) => n + c.addedTexts.length + c.addedImages.length, 0)} chaves e ${newGlobals.length} globais.`)
for (const change of changes) console.log(`- ${change.sectionId}: ${[...change.addedTexts, ...change.addedImages].join(', ')}`)
for (const [field] of newGlobals) console.log(`- global: ${field}`)
if (!apply) process.exit(0)

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backup = `/tmp/solarbuy-landing-before-admin-backfill-${stamp}.json`
writeFileSync(backup, `${JSON.stringify({ createdAt: new Date().toISOString(), sections: rows, globals }, null, 2)}\n`)
console.log(`Snapshot: ${backup}`)

for (const change of changes) {
  const response = await fetch(`${url}/rest/v1/landing_sections?section_id=eq.${change.sectionId}`, {
    method: 'PATCH', headers, body: JSON.stringify({
      texts: change.texts, texts_draft: change.texts,
      images: change.images, images_draft: change.images,
    }),
  })
  if (!response.ok) throw new Error(`PATCH ${change.sectionId}: ${response.status} ${await response.text()}`)
}
for (const [field, value] of newGlobals) {
  const response = await fetch(`${url}/rest/v1/landing_globals`, {
    method: 'POST', headers, body: JSON.stringify({ key: field, value, value_draft: value }),
  })
  if (!response.ok) throw new Error(`POST global ${field}: ${response.status} ${await response.text()}`)
}
console.log('OK: backfill aplicado sem sobrescrever chaves existentes.')
