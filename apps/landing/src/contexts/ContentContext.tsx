import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { initialContent, CONTENT_VERSION } from './ContentData'
import contentSnapshot from '../v4-full/content-snapshot.json'
import { API_URL } from '../utils/api'

export interface SectionContent {
  id: string
  name: string
  texts: { [key: string]: string }
  images: { [key: string]: string }
}

export interface GlobalAssets {
  favicon: string
  logo: string
}

export interface GlobalSettings {
  whatsappNumber: string
  purchaseLink: string
}

interface ContentContextType {
  content: SectionContent[]
  globalAssets: GlobalAssets
  globalSettings: GlobalSettings
  updateText: (sectionId: string, key: string, value: string) => void
  updateImage: (sectionId: string, key: string, value: string) => void
  updateGlobalAsset: (key: keyof GlobalAssets, value: string) => void
  updateGlobalSetting: (key: keyof GlobalSettings, value: string) => void
  saveSection: (
    sectionId: string,
    overrides?: {
      texts?: { [key: string]: string }
      images?: { [key: string]: string }
    }
  ) => Promise<boolean>
  saveGlobalAsset: (key: keyof GlobalAssets, value?: string) => Promise<boolean>
  saveGlobalSetting: (key: keyof GlobalSettings, value?: string) => Promise<boolean>
  getSection: (sectionId: string) => SectionContent | undefined
}

const DEFAULT_GLOBAL_ASSETS: GlobalAssets = {
  favicon: '/favicon.png',
  logo: '/assets/LOGOSOLARBUYSIDE3.png',
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  whatsappNumber: '',
  purchaseLink: '',
}

const DEFAULT_BUYER_TESTIMONIALS = [
  {
    name: 'Ricardo',
    role: 'Empresário',
    location: 'São Paulo, SP',
    avatar: '/assets/Ricardo 1.png',
    objectPosition: '50% 50%',
    reviewTitle: 'Errar na escolha de um fornecedor pode gerar prejuízo enorme.',
    quote:
      'No mundo dos negócios, errar na escolha de um fornecedor pode gerar um prejuízo enorme. O manual foi indispensável para evitar armadilhas, ensinando-me a identificar empresas despreparadas e equipamentos duvidosos. Aprendi a buscar parceiros que garantem suporte técnico e manutenção contínua. Graças ao Solar Buy-Side, fechei negócio com a melhor empresa: meu investimento de R$ 195 mil foi muito bem aplicado.',
    highlight:
      'Mais que um guia, o Manual é o seguro que todo empresário precisa para investir com risco controlado.',
  },
  {
    name: 'Guilherme',
    role: 'Particular',
    location: 'Santana de Parnaíba, SP',
    avatar: '/assets/empresariomanualk.png',
    objectPosition: '50% 50%',
    reviewTitle: 'Decisão segura em investimento complexo.',
    quote:
      'Resido na região de São Paulo, em uma residência de grande porte, com elevado consumo elétrico e exposta a apagões frequentes, que podem durar horas ou dias. Para reduzir a fatura e garantir conforto energético, optei pela instalação de um sistema solar híbrido com baterias. Para embasar um investimento de alta complexidade técnica e valor, utilizei com sucesso o Manual de Compra Solar Buy-Side, que orientou todo o processo de avaliação e decisão.',
    highlight:
      'Para quem busca segurança e ganho de tempo, recomendo com total confiança.',
  },
  {
    name: 'Jorge Luiz',
    role: 'Empresário',
    location: 'Rio de Janeiro, RJ',
    avatar: '/assets/jorge of_cleanup.png',
    objectPosition: '50% 100%',
    reviewTitle: 'O manual foi o divisor de águas.',
    quote:
      'Viver no Rio é aquilo: você tem que estar sempre ligado pra não cair em furada. Quando precisei cortar os custos fixos da minha metalúrgica, confesso que travei, porque de energia solar eu não entendia nada. O manual foi o divisor de águas; me deu o mapa da mina pra estudar as propostas e descartar de cara quem estava só no gogó. Investi R$ 188 mil com total segurança e o alívio já chegou no bolso.',
    highlight:
      'O Manual valeu demais! Recomendo mesmo!',
  },
  {
    name: 'Rogério',
    role: 'Particular',
    location: 'Campinas, SP',
    avatar: '/assets/Rogerio_cleanup.png',
    objectPosition: '50% 100%',
    reviewTitle: 'O manual valeu cada página.',
    quote:
      'Eu nunca tinha tido contato com energia solar e temia tomar a decisão errada, mas o conteúdo claro e estruturado mudou tudo. As 4 fases da jornada de compra foram essenciais e o índice interativo, com mais de 160 tópicos, sanou todas as minhas dúvidas instantaneamente. No fim, escolhi a empresa certa e o sistema ideal pelo preço justo, conduzindo a negociação com total autoridade e segurança.',
    highlight:
      'Sem exagero: o Manual Solar Buy-Side valeu cada página.',
  },
  {
    name: 'Lucineide',
    role: 'Particular',
    location: 'Recife, PE',
    avatar: '/assets/Lucineide 1.png',
    objectPosition: '50% 100%',
    reviewTitle: 'Esse Manual foi realmente um passo a passo arretado!',
    quote:
      'Morando sozinha, a variedade de empresas e tecnologias me deixava insegura. O manual foi o guia fundamental: seguindo cada etapa, aprendi a avaliar propostas e descartar o que era bom demais para ser verdade. Com total convicção, instalei meu sistema de R$ 28 mil. O passo a passo foi arretado! No final, fui até elogiada pelos vendedores; eles nunca tinham encontrado uma mulher com tanto conhecimento técnico.',
    highlight:
      'O Solar Buy-Side me deu a segurança para decidir sem arrependimentos.',
  },
  {
    name: 'Edivaldo',
    role: 'Produtor Rural',
    location: 'Sinop, MT',
    avatar: '/assets/Edivaldo.png',
    objectPosition: '50% 100%',
    reviewTitle: 'O Manual me deu segurança para investir R$ 248 mil.',
    quote:
      'Sou produtor rural em Sinop/MT e decidi instalar energia solar devido ao alto consumo na irrigação e maquinários. Com a expansão da lavoura, a conta de luz pesava muito. O Manual Solar Buy-Side foi essencial nesse processo: me ensinou a comparar propostas tecnicamente e evitar erros caros que eu nem conhecia. O conteúdo me deu a segurança necessária para realizar um investimento de R$ 248 mil.',
    highlight:
      'Realmente é uma ferramenta indispensável para quem busca eficiência no campo e proteção do capital.',
  },
]

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const normalizeStringMap = (value: unknown): { [key: string]: string } => {
  if (!isRecord(value)) return {}

  const normalized: { [key: string]: string } = {}
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'string') {
      normalized[key] = raw
      continue
    }

    if (raw !== null && raw !== undefined) {
      normalized[key] = String(raw)
    }
  }
  return normalized
}

const normalizeSection = (value: unknown): SectionContent | null => {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.trim() === '') {
    return null
  }

  return {
    id: value.id,
    name: typeof value.name === 'string' && value.name.trim() !== '' ? value.name : value.id,
    texts: normalizeStringMap(value.texts),
    images: normalizeStringMap(value.images),
  }
}

/**
 * Aliases de chaves legadas e defaults de dado.
 *
 * Todo teste aqui é `=== undefined`, nunca `!texts.x`. A diferença importa: com
 * `!`, uma chave PRESENTE e vazia era tratada como ausente, e o valor legado (ou
 * o default) voltava por cima. Foi assim que o "De R$ 997,00 por apenas:" que o
 * Francis apagou no admin continuou no ar (slide 19 da revisão de 03/08): ele
 * estava vazio em `priceFrom`, mas a linha de alias o repunha a partir de
 * `priceOriginal`, que ninguém edita.
 *
 * A regra é a mesma do `criarTxt` da v4: chave ausente = "o banco não sabe,
 * usa o padrão"; chave presente e vazia = "o cliente mandou tirar do ar".
 */
const applySectionAliases = (section: SectionContent): SectionContent => {
  const texts = { ...section.texts }
  const images = { ...section.images }

  if (section.id === 'hero') {
    if (texts.titlePrefix === undefined && texts.title1) texts.titlePrefix = texts.title1
    if (texts.titleHighlight === undefined && texts.title2) texts.titleHighlight = texts.title2
    if (texts.subtitle === undefined && (texts.subtitle1 || texts.subtitle2)) {
      texts.subtitle = `${texts.subtitle1 || ''} ${texts.subtitle2 || ''}`.trim()
    }
    if (texts.titlePrefix === undefined) texts.titlePrefix = 'Saia da Disputa de Preço e Passe a'
    if (texts.titleHighlight === undefined) texts.titleHighlight = 'Vender Decisões'
    if (texts.titleSuffix === undefined) texts.titleSuffix = 'em Sistema Solar'
    if (texts.subtitle === undefined) texts.subtitle = 'O método Buy-Side ensina você a pensar como o cliente e conduzir decisões de compra, não disputas de preço.'
    if (texts.manualTitle === undefined) texts.manualTitle = 'Manual Solar Buy-Side'
    if (texts.manualSubtitle === undefined) texts.manualSubtitle = 'Construído a partir da observação real de como compradores decidem, na prática.'
    if (texts.bonusBadge === undefined) texts.bonusBadge = 'Bônus Exclusivo'
    if (texts.bonusTitle === undefined) texts.bonusTitle = 'O Código do Vendedor Consultivo'
    if (texts.bonusSubtitle === undefined) texts.bonusSubtitle = 'Para quem quer conduzir decisões, não concessões.'
    if (texts.ctaButton === undefined) texts.ctaButton = 'Quero vender decisões agora'
    if (texts.ctaSubtext === undefined) texts.ctaSubtext = 'Acesso imediato ao Manual Solar Buy-Side.'
    if (texts.scrollHint === undefined) texts.scrollHint = 'Entenda a lógica'
    if (images.heroImage === undefined) images.heroImage = '/assets/GED9CF_1_cleanup.PNG'
  }

  if (section.id === 'context') {
    if (texts.titleHighlight === undefined && texts.title && /2026/.test(texts.title)) {
      texts.title = texts.title.replace(/\s*2026\s*$/, '').trim() || 'Panorama'
      texts.titleHighlight = '2026'
    }
  }

  if (section.id === 'testimonials') {
    if (texts.title === undefined && texts.quote) texts.title = texts.quote
    if (texts.intro === undefined && texts.label) texts.intro = texts.label
    if (texts.quote1 === undefined && texts.text1) texts.quote1 = texts.text1
    if (texts.quote2 === undefined && texts.text2) texts.quote2 = texts.text2
    if (texts.ctaTitle === undefined && texts.calloutTitle) texts.ctaTitle = texts.calloutTitle
    if (texts.ctaText === undefined && texts.calloutText) texts.ctaText = texts.calloutText
    if (texts.authorName === undefined && texts.name) texts.authorName = texts.name
    if (texts.authorRole === undefined && texts.role) texts.authorRole = texts.role
    if (texts.statValue === undefined && texts.metric) texts.statValue = texts.metric
    if (texts.statSubtext === undefined && texts.metricLabel) texts.statSubtext = texts.metricLabel
    if (images.testimonialImage === undefined && images.avatar) images.testimonialImage = images.avatar
  }

  if (section.id === 'seller-code') {
    if (texts.badge === undefined && texts.bonusBadge) texts.badge = texts.bonusBadge
    if (texts.listTitle === undefined && texts.listHeader) texts.listTitle = texts.listHeader
    if (texts.bonusSubtitle === undefined && texts.ebookSubtitle) texts.bonusSubtitle = texts.ebookSubtitle
    if (images.bookImage === undefined && images.book) images.bookImage = images.book
  }

  if (section.id === 'pricing') {
    if (texts.featuresTitle === undefined && texts.sectionTitle) texts.featuresTitle = texts.sectionTitle
    if (texts.priceFrom === undefined && texts.priceOriginal) texts.priceFrom = texts.priceOriginal
    if (texts.priceUpfront === undefined && texts.priceCash) texts.priceUpfront = texts.priceCash

    if ((texts.priceValue === undefined || texts.priceCents === undefined) && texts.priceInstallments) {
      const match = texts.priceInstallments.match(/(\d+)\s*de\s*R\$\s*(\d+)(?:,(\d+))?/i)
      if (match) {
        if (texts.priceValue === undefined) texts.priceValue = match[2]
        if (texts.priceCents === undefined) texts.priceCents = `,${match[3] || '00'}`
      }
    }

    if (texts.finalCtaButton === undefined) texts.finalCtaButton = 'DESBLOQUEAR CONTEÚDO COMPLETO'
  }

  if (section.id === 'manual-strategic') {
    // The live HostGator page displays the 3D mockup, even when the CMS API
    // returns the older flat cover path for this field.
    if (images.manual === '/assets/manual.jpg.png') images.manual = '/assets/Capa-manual-buy-side-definitiva.png'
    if (images.manualImage === undefined && images.manual) images.manualImage = images.manual
    if (images.manualImage === '/assets/manual.jpg.png') images.manualImage = '/assets/Capa-manual-buy-side-definitiva.png'
  }

  if (section.id === 'story-bridge') {
    if (images.manualImage === undefined && images.manual) images.manualImage = images.manual
  }

  if (section.id === 'buyer-wave') {
    if (texts.ctaButton === undefined) texts.ctaButton = 'ACESSAR GUIA ESTRATÉGICO AGORA'

    DEFAULT_BUYER_TESTIMONIALS.forEach((defaultItem, index) => {
      const i = index + 1
      const nameKey = `testimonial${i}Name`
      const roleKey = `testimonial${i}Role`
      const locationKey = `testimonial${i}Location`
      const avatarKey = `testimonial${i}Avatar`
      const objectPositionKey = `testimonial${i}ObjectPosition`
      const reviewTitleKey = `testimonial${i}ReviewTitle`
      const quoteKey = `testimonial${i}Quote`
      const highlightKey = `testimonial${i}Highlight`

      if (!texts[nameKey]) texts[nameKey] = defaultItem.name
      if (!texts[roleKey]) texts[roleKey] = defaultItem.role
      if (!texts[locationKey]) texts[locationKey] = defaultItem.location
      if (!texts[objectPositionKey]) texts[objectPositionKey] = defaultItem.objectPosition
      if (!texts[reviewTitleKey]) texts[reviewTitleKey] = defaultItem.reviewTitle
      if (!texts[quoteKey]) texts[quoteKey] = defaultItem.quote
      if (!texts[highlightKey]) texts[highlightKey] = defaultItem.highlight
      if (!images[avatarKey]) images[avatarKey] = defaultItem.avatar
    })
  }

  return {
    ...section,
    texts,
    images,
  }
}

const applyAliases = (sections: SectionContent[]): SectionContent[] => {
  return sections.map(applySectionAliases)
}

const mergeSections = (
  baseSections: SectionContent[],
  incomingRaw: unknown,
  // override=true: o conteúdo recebido (Supabase) VENCE o ContentData.
  // override=false (legado): ContentData vence, recebido só preenche faltas.
  override = false,
): SectionContent[] => {
  if (!Array.isArray(incomingRaw)) {
    return baseSections
  }

  const incomingMap = new Map<string, SectionContent>()
  for (const item of incomingRaw) {
    const normalized = normalizeSection(item)
    if (normalized) {
      incomingMap.set(normalized.id, normalized)
    }
  }

  // Static ContentData is the source of truth. Backend (CMS) only fills in
  // keys that are missing from the static defaults — it can extend, never override.
  // This prevents stale CMS data from flashing over the deployed build.
  const merged = baseSections.map((baseSection) => {
    const incoming = incomingMap.get(baseSection.id)
    if (!incoming) return baseSection

    incomingMap.delete(baseSection.id)

    return {
      ...baseSection,
      name: override ? incoming.name || baseSection.name : baseSection.name || incoming.name,
      texts: override
        ? { ...baseSection.texts, ...incoming.texts }
        : { ...incoming.texts, ...baseSection.texts },
      images: override
        ? { ...baseSection.images, ...incoming.images }
        : { ...incoming.images, ...baseSection.images },
    }
  })

  // Keep unknown sections from backend (if any), appended at the end
  for (const extraSection of incomingMap.values()) {
    merged.push(extraSection)
  }

  return applyAliases(merged)
}

/**
 * Conteúdo embutido pelo prerender (window.__SBS_CONTENT__): o estado EXATO
 * com que o build renderizou o HTML servido. Usá-lo como estado inicial faz o
 * primeiro render do cliente bater com o DOM pré-renderizado — condição para
 * o hydrateRoot adotar o DOM em vez de descartar (ver main.tsx). O fetch do
 * Supabase continua rodando depois e vence se o banco mudou pós-build.
 */
type ConteudoEmbutido = {
  sections?: unknown
  assets?: unknown
  settings?: unknown
}
const conteudoEmbutido = (): ConteudoEmbutido | null => {
  const w = window as Window & { __SBS_CONTENT__?: ConteudoEmbutido }
  return w.__SBS_CONTENT__ && isRecord(w.__SBS_CONTENT__) ? w.__SBS_CONTENT__ : null
}

const getStoredSections = (): SectionContent[] => {
  const embutido = conteudoEmbutido()
  if (Array.isArray(embutido?.sections)) {
    const sections = embutido.sections
      .map(normalizeSection)
      .filter((s): s is SectionContent => s !== null)
    // Verbatim: é o array já mesclado/aliased que o build usou para renderizar.
    if (sections.length > 0) return sections
  }

  const storedVersion = localStorage.getItem('cms-content-version')
  if (storedVersion !== String(CONTENT_VERSION)) {
    // Content defaults changed — clear stale cache
    localStorage.removeItem('cms-content')
    localStorage.setItem('cms-content-version', String(CONTENT_VERSION))
    return applyAliases(initialContent)
  }

  const saved = localStorage.getItem('cms-content')
  if (!saved) return applyAliases(initialContent)

  try {
    const parsed = JSON.parse(saved)
    return mergeSections(initialContent, parsed)
  } catch {
    return applyAliases(initialContent)
  }
}

const getStoredGlobalAssets = (): GlobalAssets => {
  const embutido = conteudoEmbutido()
  if (isRecord(embutido?.assets)) {
    const a = embutido.assets
    return {
      favicon: typeof a.favicon === 'string' ? a.favicon : DEFAULT_GLOBAL_ASSETS.favicon,
      logo: typeof a.logo === 'string' ? a.logo : DEFAULT_GLOBAL_ASSETS.logo,
    }
  }

  const saved = localStorage.getItem('cms-global-assets')
  if (!saved) return DEFAULT_GLOBAL_ASSETS

  try {
    const parsed = JSON.parse(saved)
    if (!isRecord(parsed)) return DEFAULT_GLOBAL_ASSETS
    return {
      favicon: typeof parsed.favicon === 'string' ? parsed.favicon : DEFAULT_GLOBAL_ASSETS.favicon,
      logo: typeof parsed.logo === 'string' ? parsed.logo : DEFAULT_GLOBAL_ASSETS.logo,
    }
  } catch {
    return DEFAULT_GLOBAL_ASSETS
  }
}

const getStoredGlobalSettings = (): GlobalSettings => {
  const embutido = conteudoEmbutido()
  if (isRecord(embutido?.settings)) {
    const s = embutido.settings
    return {
      whatsappNumber:
        typeof s.whatsappNumber === 'string' ? s.whatsappNumber : DEFAULT_GLOBAL_SETTINGS.whatsappNumber,
      purchaseLink:
        typeof s.purchaseLink === 'string' ? s.purchaseLink : DEFAULT_GLOBAL_SETTINGS.purchaseLink,
    }
  }

  const saved = localStorage.getItem('cms-global-settings')
  if (!saved) return DEFAULT_GLOBAL_SETTINGS

  try {
    const parsed = JSON.parse(saved)
    if (!isRecord(parsed)) return DEFAULT_GLOBAL_SETTINGS
    return {
      whatsappNumber: typeof parsed.whatsappNumber === 'string' ? parsed.whatsappNumber : DEFAULT_GLOBAL_SETTINGS.whatsappNumber,
      purchaseLink: typeof parsed.purchaseLink === 'string' ? parsed.purchaseLink : DEFAULT_GLOBAL_SETTINGS.purchaseLink,
    }
  } catch {
    return DEFAULT_GLOBAL_SETTINGS
  }
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

// --- /1 CONGELADA ------------------------------------------------------------
// A /1 é a cópia-salvaguarda da LP completa. Ela lia as MESMAS linhas de
// `landing_sections` que a LP oficial, então estava congelada só no código:
// qualquer edição do admin na oficial mudava a /1 junto, sem aviso.
// Agora ela lê um retrato estático (content-snapshot.json, gerado por
// `apps/platform/scripts/snapshot-v4-full.mjs`) e não toca no Supabase nem no
// localStorage — que é compartilhado pelas duas rotas na mesma origem e
// vazaria o conteúdo da oficial para dentro da salvaguarda.
const frozenGlobals = contentSnapshot.globals as Record<string, string | undefined>

const frozenSections = (): SectionContent[] =>
  mergeSections(initialContent, contentSnapshot.sections, true)

const frozenGlobalAssets = (): GlobalAssets => ({
  favicon: frozenGlobals.favicon ?? DEFAULT_GLOBAL_ASSETS.favicon,
  logo: frozenGlobals.logo ?? DEFAULT_GLOBAL_ASSETS.logo,
})

const frozenGlobalSettings = (): GlobalSettings => ({
  whatsappNumber: frozenGlobals.whatsappNumber ?? DEFAULT_GLOBAL_SETTINGS.whatsappNumber,
  purchaseLink: frozenGlobals.purchaseLink ?? DEFAULT_GLOBAL_SETTINGS.purchaseLink,
})

export const ContentProvider: React.FC<{ children: ReactNode; frozen?: boolean }> = ({
  children,
  frozen = false,
}) => {
  const [content, setContent] = useState<SectionContent[]>(() =>
    frozen ? frozenSections() : getStoredSections(),
  )

  const [globalAssets, setGlobalAssets] = useState<GlobalAssets>(() =>
    frozen ? frozenGlobalAssets() : getStoredGlobalAssets(),
  )

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() =>
    frozen ? frozenGlobalSettings() : getStoredGlobalSettings(),
  )

  // Load content from backend on mount
  useEffect(() => {
    if (frozen) return // salvaguarda: nada de rede, nada de cache
    const loadContent = async () => {
      try {
        const [sectionsRes, assetsRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/content/sections`),
          fetch(`${API_URL}/api/content/assets`),
          fetch(`${API_URL}/api/content/settings`),
        ])

        if (sectionsRes.ok) {
          const sectionsData = await sectionsRes.json()
          if (sectionsData.success) {
            const mergedSections = mergeSections(initialContent, sectionsData.data)
            setContent(mergedSections)
            localStorage.setItem('cms-content', JSON.stringify(mergedSections))
            localStorage.setItem('cms-content-version', String(CONTENT_VERSION))
          }
        } else {
          console.warn(`Failed to load sections: ${sectionsRes.status}`)
        }

        if (assetsRes.ok) {
          const assetsData = await assetsRes.json()
          if (assetsData.success && isRecord(assetsData.data)) {
            const nextAssets: GlobalAssets = {
              favicon: typeof assetsData.data.favicon === 'string' ? assetsData.data.favicon : DEFAULT_GLOBAL_ASSETS.favicon,
              logo: typeof assetsData.data.logo === 'string' ? assetsData.data.logo : DEFAULT_GLOBAL_ASSETS.logo,
            }
            setGlobalAssets(nextAssets)
            localStorage.setItem('cms-global-assets', JSON.stringify(nextAssets))
          }
        } else {
          console.warn(`Failed to load global assets: ${assetsRes.status}`)
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          if (settingsData.success && isRecord(settingsData.data)) {
            const nextSettings: GlobalSettings = {
              whatsappNumber:
                typeof settingsData.data.whatsappNumber === 'string'
                  ? settingsData.data.whatsappNumber
                  : DEFAULT_GLOBAL_SETTINGS.whatsappNumber,
              purchaseLink:
                typeof settingsData.data.purchaseLink === 'string'
                  ? settingsData.data.purchaseLink
                  : DEFAULT_GLOBAL_SETTINGS.purchaseLink,
            }
            setGlobalSettings(nextSettings)
            localStorage.setItem('cms-global-settings', JSON.stringify(nextSettings))
          }
        } else {
          console.warn(`Failed to load global settings: ${settingsRes.status}`)
        }
      } catch (error) {
        console.debug('Using cached content:', error)
        // Keep using localStorage/initialContent on error
      }
    }

    // Fonte da verdade agora é o Supabase (tabelas landing_sections /
    // landing_globals). O conteúdo do Supabase SOBRESCREVE o ContentData
    // (que vira fallback). O CMS antigo (Render) foi aposentado.
    const loadFromSupabase = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
      if (!url || !anon) return // sem env → mantém ContentData
      const headers = { apikey: anon, Authorization: `Bearer ${anon}` }
      try {
        const [secRes, globRes] = await Promise.all([
          fetch(`${url}/rest/v1/landing_sections?select=section_id,name,texts,images`, { headers }),
          fetch(`${url}/rest/v1/landing_globals?select=key,value`, { headers }),
        ])
        if (secRes.ok) {
          const rows = (await secRes.json()) as Array<{
            section_id: string; name: string | null; texts: unknown; images: unknown
          }>
          if (Array.isArray(rows) && rows.length > 0) {
            const incoming = rows.map((r) => ({
              id: r.section_id,
              name: r.name ?? '',
              texts: isRecord(r.texts) ? (r.texts as Record<string, string>) : {},
              images: isRecord(r.images) ? (r.images as Record<string, string>) : {},
            }))
            const merged = mergeSections(initialContent, incoming, true)
            setContent(merged)
            localStorage.setItem('cms-content', JSON.stringify(merged))
            localStorage.setItem('cms-content-version', String(CONTENT_VERSION))
          }
        }
        if (globRes.ok) {
          const rows = (await globRes.json()) as Array<{ key: string; value: string | null }>
          if (Array.isArray(rows)) {
            const map: Record<string, string> = {}
            for (const r of rows) if (r.value != null) map[r.key] = r.value
            setGlobalAssets((prev) => ({
              favicon: map.favicon ?? prev.favicon,
              logo: map.logo ?? prev.logo,
            }))
            setGlobalSettings((prev) => ({
              whatsappNumber: map.whatsappNumber ?? prev.whatsappNumber,
              purchaseLink: map.purchaseLink ?? prev.purchaseLink,
            }))
          }
        }
      } catch (error) {
        console.debug('Supabase content load falhou, usando ContentData:', error)
      }
    }

    void loadContent // CMS Render aposentado (mantido só como referência)
    void loadFromSupabase()
  }, [frozen])

  const persistSection = async (section: SectionContent): Promise<boolean> => {
    const token = localStorage.getItem('admin-token')
    if (!token) {
      console.warn('Cannot persist section without admin token.')
      return false
    }

    try {
      const response = await fetch(`${API_URL}/api/content/sections/${section.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          section_name: section.name,
          texts: section.texts,
          images: section.images
        })
      })

      if (!response.ok) {
        const body = await response.text()
        console.error(`Failed to persist section ${section.id}: ${response.status} ${body}`)
        return false
      }

      return true
    } catch (error) {
      console.error(`Failed to persist section ${section.id}:`, error)
      return false
    }
  }

  const updateText = (sectionId: string, key: string, value: string) => {
    setContent((prev) => {
      const updated = prev.map((section) =>
        section.id === sectionId
          ? { ...section, texts: { ...section.texts, [key]: value } }
          : section
      )
      localStorage.setItem('cms-content', JSON.stringify(updated))
      return updated
    })
  }

  const updateImage = (sectionId: string, key: string, value: string) => {
    setContent((prev) => {
      const updated = prev.map((section) =>
        section.id === sectionId
          ? { ...section, images: { ...section.images, [key]: value } }
          : section
      )
      localStorage.setItem('cms-content', JSON.stringify(updated))
      return updated
    })
  }

  const updateGlobalAsset = (key: keyof GlobalAssets, value: string) => {
    setGlobalAssets((prev) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('cms-global-assets', JSON.stringify(updated))
      return updated
    })
  }

  const updateGlobalSetting = (key: keyof GlobalSettings, value: string) => {
    setGlobalSettings((prev) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('cms-global-settings', JSON.stringify(updated))
      return updated
    })
  }

  const saveSection = async (
    sectionId: string,
    overrides?: {
      texts?: { [key: string]: string }
      images?: { [key: string]: string }
    }
  ): Promise<boolean> => {
    const baseSection = content.find((section) => section.id === sectionId)
    if (!baseSection) {
      return false
    }

    const sectionToSave: SectionContent = {
      ...baseSection,
      texts: { ...baseSection.texts, ...(overrides?.texts || {}) },
      images: { ...baseSection.images, ...(overrides?.images || {}) },
    }

    setContent((prev) => {
      const updated = prev.map((section) =>
        section.id === sectionId ? sectionToSave : section
      )
      localStorage.setItem('cms-content', JSON.stringify(updated))
      return updated
    })

    return persistSection(sectionToSave)
  }

  const saveGlobalAsset = async (key: keyof GlobalAssets, value?: string): Promise<boolean> => {
    const nextValue = value !== undefined ? value : globalAssets[key]
    const token = localStorage.getItem('admin-token')
    if (!token) {
      console.warn('Cannot persist global asset without admin token.')
      return false
    }

    setGlobalAssets((prev) => {
      const updated = { ...prev, [key]: nextValue }
      localStorage.setItem('cms-global-assets', JSON.stringify(updated))
      return updated
    })

    try {
      const response = await fetch(`${API_URL}/api/content/assets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key, value: nextValue })
      })

      if (!response.ok) {
        const body = await response.text()
        console.error(`Failed to persist global asset ${key}: ${response.status} ${body}`)
        return false
      }

      return true
    } catch (error) {
      console.error(`Failed to persist global asset ${key}:`, error)
      return false
    }
  }

  const saveGlobalSetting = async (key: keyof GlobalSettings, value?: string): Promise<boolean> => {
    const nextValue = value !== undefined ? value : globalSettings[key]
    const token = localStorage.getItem('admin-token')
    if (!token) {
      console.warn('Cannot persist global setting without admin token.')
      return false
    }

    setGlobalSettings((prev) => {
      const updated = { ...prev, [key]: nextValue }
      localStorage.setItem('cms-global-settings', JSON.stringify(updated))
      return updated
    })

    try {
      const response = await fetch(`${API_URL}/api/content/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key, value: nextValue })
      })

      if (!response.ok) {
        const body = await response.text()
        console.error(`Failed to persist global setting ${key}: ${response.status} ${body}`)
        return false
      }

      return true
    } catch (error) {
      console.error(`Failed to persist global setting ${key}:`, error)
      return false
    }
  }

  const getSection = (sectionId: string) => {
    return content.find((section) => section.id === sectionId)
  }

  return (
    <ContentContext.Provider value={{ content, globalAssets, globalSettings, updateText, updateImage, updateGlobalAsset, updateGlobalSetting, saveSection, saveGlobalAsset, saveGlobalSetting, getSection }}>
      {children}
    </ContentContext.Provider>
  )
}

export const useContent = () => {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within ContentProvider')
  }
  return context
}
