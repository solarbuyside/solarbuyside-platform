#!/usr/bin/env node
/**
 * Cria no Supabase as seções/campos que a LP passou a renderizar, para que
 * apareçam no editor do admin.
 *
 * DIFERENÇA PARA O seed-landing-revisao-2607.mjs
 * Aquele SOBRESCREVE texto (é uma substituição pedida nos slides). Este NÃO:
 * ele só cria seção que não existe e só preenche chave que está faltando.
 * Qualquer valor já gravado fica intacto, inclusive o que o Francis editou.
 * É seguro rodar quantas vezes quiser.
 *
 * POR QUE PRECISA
 * O editor do admin lista o que existe no banco. Sem a linha da seção, o
 * Francis vê o bloco na página e não acha onde editar.
 *
 * OBSERVAÇÃO SOBRE OS TEXTOS ANTIGOS
 * Algumas chaves antigas (hero.subtitle, audience.bottomTitle, apoiadores.
 * bandTitle, manual-strategic.ctaButton, plataforma.ctaButton, pricing.
 * promoTitle/promoSubtitle) continuam no banco com o texto velho, e este
 * script não mexe nelas de propósito. Os componentes da LP ignoram esses
 * valores legados e mostram o texto novo, então a PÁGINA está certa; o campo
 * no admin é que ainda mostra o texto antigo até o Francis reescrever.
 *
 * COMO RODAR
 *   node apps/platform/scripts/criar-secoes-admin.mjs --dry   (só mostra)
 *   node apps/platform/scripts/criar-secoes-admin.mjs         (aplica)
 *
 * Credenciais: apps/platform/.env.local ou apps/platform/.env
 * (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
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
    if (out.NEXT_PUBLIC_SUPABASE_URL && out.SUPABASE_SERVICE_ROLE_KEY) {
      console.log(`credenciais: ${nome.replace('../', '')}`)
      return out
    }
  }
  throw new Error('nao achei NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY em .env.local nem .env')
}

const env = lerEnv()
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const H = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}

/* ── conteúdo das seções ─────────────────────────────────────────────── */

// Seção nova (slide 7). Textos = os padrões que o componente já usa.
const LUCAS = {
  nome: 'Depoimento do Lucas',
  texts: {
    kicker: 'Relato de caso: a história do integrador Lucas',
    title: '"Deixei de competir por preço e passei a ser vendedor consultivo"',
    authorName: 'Lucas de Freitas',
    authorRole: 'Integrador Solar, BH',
    quote1:
      'Com o Método Solar Buy-Side, aprendi a ancorar o valor do projeto na perspectiva de investimento do cliente e isso mudou o jogo.',
    quote2:
      'Hoje eu entro numa reunião muito mais tranquilo. Não preciso convencer ninguém. Meu papel é educar e ajudar o cliente a decidir.',
    quote3:
      'Quando o cliente compara três orçamentos, ele volta pra mim. Não vendo mais o sistema mais barato, vendo a decisão mais segura, e isso pesa muito mais na hora de fechar.',
    ctaTitle: 'Para quem é',
    ctaText:
      'Se tornar vendedor consultivo Buy-Side significa reduzir risco, insegurança e arrependimento do comprador, e não pressionar por fechamento.',
    ctaButton: 'Quero parar de perder venda por preço',
  },
  images: { testimonialImage: '/assets/Integrador_Lucas_BH.jpg' },
}

// Seção nova (slide 8).
const TRANSFORMACAO = {
  nome: 'Transformação',
  texts: {
    kicker: 'Transformação',
    title1: 'Com o Método Buy-Side,',
    title2: 'você deixa de disputar preço,',
    title3: 'você passa a conduzir decisões.',
    bullet1: 'O cliente não compra porque foi convencido.',
    bullet2: 'Ele compra porque sente segurança em seguir a sua recomendação.',
    bullet3: 'É exatamente essa transformação que o Método Solar Buy-Side desenvolve.',
    tableTitle: 'Veja sua transformação',
    hojeLabel: 'Hoje',
    depoisLabel: 'Depois',
    row1Hoje: 'Disputa preço',
    row1Depois: 'Defende valor',
    row2Hoje: 'Responde objeções',
    row2Depois: 'Evita objeções',
    row3Hoje: 'Espera a decisão',
    row3Depois: 'Conduz a decisão',
    row4Hoje: 'Vende equipamento',
    row4Depois: 'Vende confiança',
    row5Hoje: 'Fecha quando consegue',
    row5Depois: 'Fecha mais rápido',
    row6Hoje: 'É apenas vendedor',
    row6Depois: 'É consultor estratégico',
  },
  images: {},
}

// Seção nova (Francis, 27/07): "O verdadeiro retorno do Método Solar Buy-Side",
// entre o Manual estratégico e o depoimento do Rodrigo. Textos = os padrões
// que o componente RetornoV4 já usa.
const RETORNO = {
  nome: 'Retorno do método (projeção)',
  texts: {
    kicker: 'Projeção de resultados',
    title: 'O <span class="cms-orange">verdadeiro retorno</span> do Método Solar Buy-Side',
    intro:
      'Com base em cinco anos de pesquisa de campo, estimamos que vendedores que apliquem o Método Solar Buy-Side possam elevar sua taxa média atual de fechamento de <span class="cms-bold">20% para 25% a 30%</span>, conforme sua capacidade de execução e isso sem aumentar o número de propostas apresentadas.',
    statLabel: 'Taxa média de fechamento',
    statFrom: '20%',
    statFromTag: 'Hoje',
    statTo: '25 a 30%',
    statToTag: 'Com o método',
    tableTitle: 'Veja o impacto real considerando uma base de 20 propostas por mês:',
    colScenario: 'Cenário',
    colTrad: 'Método Tradicional',
    colBuy: 'Método Buy-Side',
    colBuyTag: 'estimativa',
    row1Label: 'Propostas apresentadas por mês',
    row1Trad: '20',
    row1Buy: '20',
    row2Label: 'Taxa média de fechamento',
    row2Trad: '20%',
    row2Buy: '25% a 30%',
    row3Label: 'Vendas por mês',
    row3Trad: '4',
    row3Buy: '5 a 6',
    row4Label: 'Vendas adicionais por ano',
    row4Trad: '—',
    row4Buy: '12 a 24 sistemas adicionais',
    outro:
      '<span class="cms-orange">E tem mais:</span> ao aplicar o Método Buy-Side em vendas consultivas B2B, você amplia sua capacidade de conquistar projetos de maior porte, aumentando seu potencial de faturamento e lucro.',
  },
  images: {},
}

// Logos dos apoiadores. Só entram se a chave ainda não existir.
const LOGOS = [
  ['belenergy', 'BelEnergy', 'Distribuidora Âncora Solar Buy-Side', 'Distribuidora de equipamentos fotovoltaicos e parceira âncora do movimento Solar Buy-Side.'],
  ['solis', 'Solis', 'Fabricantes', 'Fabricante global de inversores solares.'],
  ['hoymiles', 'Hoymiles', 'Fabricantes', 'Fabricante de microinversores e otimizadores para geração distribuída.'],
  ['huawei', 'Huawei', 'Fabricantes', 'Fabricante global de inversores e soluções de energia inteligente.'],
  ['longi', 'LONGi Solar', 'Fabricantes', 'Um dos maiores fabricantes mundiais de módulos fotovoltaicos.'],
  ['unipower', 'Unipower', 'Fabricantes', 'Marca UCB Power, fabricante de baterias e soluções de energia.'],
  ['clamper', 'Clamper', 'Fabricantes', 'Fabricante brasileira de dispositivos de proteção contra surtos elétricos.'],
  ['sil', 'Sil', 'Fabricantes', 'Fabricante brasileira de fios e cabos elétricos.'],
  ['proauto', 'Proauto Electric Solar', 'Fabricantes', 'Fabricante de componentes elétricos para sistemas solares.'],
  ['fluke', 'Fluke', 'Fabricantes', 'Fabricante global de instrumentos de medição e diagnóstico elétrico.'],
  ['staubli', 'Stäubli', 'Fabricantes', 'Fabricante suíça de conectores fotovoltaicos e soluções de conexão elétrica.'],
  ['pvclean', 'pvClean', 'Tecnologia, Serviços e Seguros', 'Tecnologia e serviços de limpeza e manutenção de usinas fotovoltaicas.'],
  ['solarview', 'SolarView', 'Tecnologia, Serviços e Seguros', 'Plataforma de monitoramento de sistemas fotovoltaicos.'],
  ['solergo', 'SOLergo', 'Tecnologia, Serviços e Seguros', 'Software de projeto e dimensionamento de sistemas fotovoltaicos.'],
  ['eletron-seguro-solar', 'Elétron Seguro Solar', 'Tecnologia, Serviços e Seguros', 'Seguros especializados para sistemas de energia solar.'],
  ['santander', 'Santander', 'Financiamento Solar', 'Financiamento para projetos de energia solar.'],
  ['energy-channel', 'Energy Channel', 'Mídia Solar', 'Canal de mídia e conteúdo especializado no setor de energia solar.'],
]

const apoiadoresTexts = {
  title: 'Apoiadores Institucionais Solar Buy-Side',
  subtitle:
    'Empresas nacionais e internacionais que apoiam a missão de tornar a compra e a venda de sistemas fotovoltaicos mais profissionais, transparentes e seguras.',
  // A seção apoiadores é nova no banco, então não há texto antigo do Francis
  // para preservar aqui: o título da faixa entra já com a redação do slide 2.
  bandTitle: 'Empresas referência no mercado solar apoiam o Movimento Solar Buy-Side',
  bandSubtitle:
    '+15 empresas apoiadoras em 5 segmentos da cadeia fotovoltaica: Distribuição • Fabricante • Tecnologia • Serviços • Financiamento',
}
const apoiadoresImages = {}
LOGOS.forEach(([slug, nome, cat, desc], i) => {
  const n = i + 1
  apoiadoresTexts[`logo${n}Name`] = nome
  apoiadoresTexts[`logo${n}Cat`] = cat
  apoiadoresTexts[`logo${n}Desc`] = desc
  apoiadoresImages[`logo${n}Src`] = `/assets/apoiadores/${slug}.png`
})

/* Campos NOVOS em seções que já existem. Nenhum deles existia antes desta
   revisão, então preencher não sobrescreve nada do Francis. */
const CAMPOS_NOVOS = {
  video: {
    nome: 'Vídeo',
    texts: {
      outroLine1: 'A maioria dos vendedores solares continua tentando convencer o cliente.',
      outroLine2: 'Os vendedores Buy-Side aprendem primeiro como o comprador decide.',
    },
  },
  'manual-strategic': {
    nome: 'Manual estratégico',
    texts: {
      kitTitle: 'Kit Completo Solar Buy-Side',
      kitSubtitle: 'Para conduzir decisões, você precisa dominar dois lados da conversa.',
    },
  },
  audience: {
    nome: 'Público',
    texts: {
      bottomHighlight: 'Pertence aos profissionais que sabem conduzir a decisão de compra.',
      bottomText:
        'Os melhores vendedores solares do futuro serão aqueles que entendem como o comprador pensa, reduzem sua insegurança e conduzem a decisão com confiança.',
      bottomEmphasis: 'O Método Solar Buy-Side foi criado para formar exatamente esse profissional.',
      bottomOutro: 'A seguir, conheça as ferramentas que tornam essa transformação possível.',
    },
  },
  pricing: {
    nome: 'Oferta',
    texts: {
      paybackNote:
        'Apenas uma venda fechada usando o Método Buy-Side já paga 100% do seu investimento. <span class="cms-orange">Todo o resto é lucro.</span>',
      promoNote:
        'Compra agora e reembolsamos a diferença de <span class="cms-orange">R$ 119,55</span> sob apresentação do cupom!',
    },
  },
  authority: {
    nome: 'Autoridade',
    texts: { ctaButton: 'Quero vender pela perspectiva do comprador' },
  },
}

/* Seção NOVA da revisão de 06/08 (slide 19). Precisa de linha própria em
   landing_sections: o /admin lista só o que existe no banco, e o Salvar é
   UPDATE (não upsert), então sem a linha o editor nem mostra a seção e um
   eventual save falharia em silêncio.

   Os textos são os mesmos defaults do componente (CompraSimplesV4.tsx) — a LP
   não depende deste seed para ficar certa; o seed é o que dá ao Francis a
   caixa de edição já preenchida em vez de vazia. */
const COMPRA_SIMPLES = {
  nome: 'Compra simples',
  texts: {
    title: 'Compra simples. Acesso imediato. Suporte garantido.',
    subtitle: 'Tudo o que você precisa saber antes de comprar:',
    item1Title: 'Acesso aos materiais',
    item1Text:
      'Após a confirmação do pagamento, você recebe por e-mail, em poucos minutos, o <span class="cms-bold">Manual Solar Buy-Side</span> e o <span class="cms-bold">Código do Vendedor Consultivo</span>, ambos em PDF. A compra também libera <span class="cms-bold">acesso vitalício à Plataforma de Avaliação de Propostas</span>.',
    item2Title: 'Prazo de entrega',
    item2Text:
      '<span class="cms-bold">É digital e imediato.</span> Confirmado o pagamento, os materiais e as instruções de acesso são enviados automaticamente para o seu e-mail.',
    item3Title: 'Suporte',
    item3Text:
      'Teve alguma dúvida ou problema com a compra, recebimento ou acesso? <span class="cms-bold">Nossa equipe está disponível pelo WhatsApp para ajudar.</span>',
  },
}

/* ── aplicação ───────────────────────────────────────────────────────── */

async function pegarSecao(id) {
  const r = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.${id}&select=*`, { headers: H })
  if (!r.ok) throw new Error(`GET ${id}: ${r.status} ${await r.text()}`)
  return (await r.json())[0] ?? null
}

/** Preenche SÓ o que falta. Nunca substitui valor existente.
 *  Grava nas duas colunas (publicado + rascunho): o editor lê texts_draft e
 *  "Publicar" copia rascunho -> publicado; gravar só no publicado some no
 *  primeiro Publicar do cliente. */
async function criar(id, nome, textos, imagens = {}) {
  const atual = await pegarSecao(id)

  const texts = { ...(atual?.texts ?? {}) }
  const draft = { ...(atual?.texts_draft ?? atual?.texts ?? {}) }
  const images = { ...(atual?.images ?? {}) }
  const imagesDraft = { ...(atual?.images_draft ?? atual?.images ?? {}) }

  const criadas = []
  const mantidas = []
  for (const [k, v] of Object.entries(textos)) {
    if (texts[k] === undefined) { texts[k] = v; criadas.push(k) } else { mantidas.push(k) }
    if (draft[k] === undefined) draft[k] = v
  }
  for (const [k, v] of Object.entries(imagens)) {
    if (images[k] === undefined) { images[k] = v; criadas.push(k) } else { mantidas.push(k) }
    if (imagesDraft[k] === undefined) imagesDraft[k] = v
  }

  const situacao = atual ? 'já existe' : 'NÃO EXISTE, vai ser criada'
  console.log(`\n[${id}] ${situacao}`)
  console.log(`   criar: ${criadas.length ? criadas.join(', ') : '(nada, tudo já está lá)'}`)
  if (mantidas.length) console.log(`   preservar (nao vou tocar): ${mantidas.length} chave(s)`)

  if (DRY || (atual && criadas.length === 0)) return

  const corpo = { texts, texts_draft: draft, images, images_draft: imagesDraft }
  const r = await fetch(
    atual ? `${URL_BASE}/rest/v1/landing_sections?section_id=eq.${id}` : `${URL_BASE}/rest/v1/landing_sections`,
    {
      method: atual ? 'PATCH' : 'POST',
      headers: { ...H, Prefer: 'return=representation' },
      body: JSON.stringify(atual ? corpo : { section_id: id, name: nome, ...corpo }),
    },
  )
  if (!r.ok) throw new Error(`${atual ? 'PATCH' : 'POST'} ${id}: ${r.status} ${await r.text()}`)
  const row = (await r.json())[0]
  console.log(`   OK: publicado=${Object.keys(row.texts ?? {}).length} rascunho=${Object.keys(row.texts_draft ?? {}).length}`)
}

console.log(DRY ? '=== DRY RUN (nao grava nada) ===' : '=== APLICANDO no Supabase ===')
console.log('Regra: cria seção que falta e chave que falta. Nunca sobrescreve texto existente.')

await criar('testimonial-lucas', LUCAS.nome, LUCAS.texts, LUCAS.images)
await criar('transformacao', TRANSFORMACAO.nome, TRANSFORMACAO.texts, TRANSFORMACAO.images)
await criar('retorno', RETORNO.nome, RETORNO.texts, RETORNO.images)
await criar('apoiadores', 'Apoiadores Institucionais', apoiadoresTexts, apoiadoresImages)
await criar('compra-simples', COMPRA_SIMPLES.nome, COMPRA_SIMPLES.texts)
for (const [id, s] of Object.entries(CAMPOS_NOVOS)) await criar(id, s.nome, s.texts, s.images ?? {})

console.log('\nPronto.', DRY ? '(nada foi gravado)' : 'Confira em /admin/landing.')
