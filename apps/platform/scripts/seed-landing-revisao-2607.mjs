#!/usr/bin/env node
/**
 * Seed do conteúdo da revisão do Francis (22-23/07/2026) no Supabase.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * A landing lê o Supabase, e o Supabase SOBRESCREVE o ContentData. Então o
 * código sozinho não basta: enquanto o banco tiver o conteúdo antigo, é ele
 * que aparece — inclusive no localhost. Este script alinha o banco com o que
 * foi combinado nos slides.
 *
 * O QUE ELE CORRIGE
 *  1. manual-strategic: bloco "Código do Vendedor" com o texto definitivo do
 *     slide 5. Hoje o banco tem codeDesc1 == codeDesc2 (parágrafo duplicado) e
 *     codeDesc3 com a lista em texto corrido — o cliente colou ali porque não
 *     existia campo de lista. Agora existe, então o parágrafo é liberado.
 *  2. audience.bottomTitle: frase de fechamento nova (slide 4 da revisão 23/07).
 *  3. apoiadores: cria a seção com os 4 textos + os 16 logos, para o editor do
 *     admin conseguir listá-los (o editor só mostra chave que existe no banco).
 *
 * DETALHE QUE JÁ NOS PEGOU UMA VEZ
 * O CMS tem rascunho/publicar (migration 0019): o editor lê texts_draft e
 * "Publicar" copia rascunho -> publicado. Gravar só em `texts` faz o conteúdo
 * sumir no primeiro Publicar do cliente. Por isso tudo aqui vai nas DUAS
 * colunas.
 *
 * COMO RODAR
 *   node apps/platform/scripts/seed-landing-revisao-2607.mjs --dry    (só mostra)
 *   node apps/platform/scripts/seed-landing-revisao-2607.mjs          (aplica)
 *
 * Lê as credenciais de apps/platform/.env.local
 * (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 *
 * ⚠️ ISTO MUDA A LP NO AR na hora. Rodar só com o aval do Gabriel.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const AQUI = dirname(fileURLToPath(import.meta.url))
const ENV = resolve(AQUI, '../.env.local')
const DRY = process.argv.includes('--dry')

function lerEnv(caminho) {
  const out = {}
  for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
    const m = linha.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return out
}

const env = lerEnv(ENV)
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_BASE || !KEY) throw new Error('faltou NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local')
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

/* ── conteúdo ────────────────────────────────────────────────────────── */

// Slide 5: substituição do texto do Código. A lista fica ENTRE o 2º e o 3º
// parágrafo — por isso desc1/desc2 são "antes da lista" e desc3/desc4 "depois".
const CODIGO = {
  codeSubtitle:
    'O método de imersão no universo Solar Buy-Side para quem não aceita mais perder vendas por preço.',
  codeDesc1:
    'Como extensão prática do Manual de Compra Solar Buy-Side, o <span class="cms-bold">Código do Vendedor Consultivo</span> ensina você a pensar como um comprador para conduzir negociações com mais estratégia, segurança e autoridade.',
  codeDesc2:
    'Ao aplicar o método, você compreende como o cliente avalia riscos, compara propostas e toma decisões de investimento. Em vez de disputar vendas pelo menor preço, passa a construir valor, conduzir a decisão de compra e posicionar sua proposta como a escolha mais segura.',
  codeDesc3:
    'Se o Manual Solar Buy-Side mostra como o comprador decide, o Código do Vendedor Consultivo ensina a transformar esse conhecimento em negociações mais estratégicas, vendas mais lucrativas e clientes mais confiantes.',
  codeDesc4: 'Resultado: você deixa de competir por preço e passa a vender por valor.',
  codeListTitle: 'O que você leva com o Código:',
  codeItem1: 'Índice de Confiabilidade para fortalecer suas propostas.',
  codeItem2: 'Checklist de Precisão baseado no que compradores realmente avaliam.',
  codeItem3: 'Estratégia Anti-Leilão para proteger sua margem de lucro.',
  codeItem4: 'Postura Consultiva de Elite para conquistar clientes técnicos e criteriosos.',
  codeItem5: 'E muito mais.',
  codeItem6: '',
}

// Slide 4 da revisão 23/07.
const AUDIENCIA = {
  bottomTitle:
    'Mais do que dois guias, o Manual Solar Buy-Side e o Código do Vendedor Consultivo representam uma nova forma de compreender o processo de compra: uma imersão na perspectiva do cliente que muda a maneira de vender sistemas fotovoltaicos.',
}

// Ordem da lista = ordem das categorias na página.
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
  bandTitle: 'Empresas líderes que apoiam o Movimento Solar Buy-Side',
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

/* ── aplicação ───────────────────────────────────────────────────────── */

async function pegarSecao(id) {
  const r = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.${id}&select=*`, { headers: H })
  if (!r.ok) throw new Error(`GET ${id}: ${r.status}`)
  return (await r.json())[0] ?? null
}

/** Grava nas DUAS colunas (publicado + rascunho). `substituir` sobrescreve
 *  valor existente; senão só preenche o que falta. */
async function gravar(id, textos, imagens = {}, substituir = false) {
  const atual = await pegarSecao(id)
  const texts = { ...(atual?.texts ?? {}) }
  const draft = { ...(atual?.texts_draft ?? atual?.texts ?? {}) }
  const images = { ...(atual?.images ?? {}) }
  const imagesDraft = { ...(atual?.images_draft ?? atual?.images ?? {}) }

  const mudou = []
  for (const [k, v] of Object.entries(textos)) {
    if (substituir || texts[k] === undefined) {
      if (texts[k] !== v) mudou.push(k)
      texts[k] = v
      draft[k] = v
    }
  }
  for (const [k, v] of Object.entries(imagens)) {
    if (substituir || images[k] === undefined) {
      images[k] = v
      imagesDraft[k] = v
    }
  }

  console.log(`\n[${id}] ${atual ? 'existe' : 'NÃO EXISTE (será criada)'} — chaves alteradas: ${mudou.length ? mudou.join(', ') : '(nenhuma)'}`)
  if (DRY) return

  const corpo = JSON.stringify({ texts, texts_draft: draft, images, images_draft: imagesDraft })
  const url = atual
    ? `${URL_BASE}/rest/v1/landing_sections?section_id=eq.${id}`
    : `${URL_BASE}/rest/v1/landing_sections`
  const r = await fetch(url, {
    method: atual ? 'PATCH' : 'POST',
    headers: { ...H, Prefer: 'return=representation' },
    body: atual ? corpo : JSON.stringify({ section_id: id, name: id, texts, texts_draft: draft, images, images_draft: imagesDraft }),
  })
  if (!r.ok) throw new Error(`${atual ? 'PATCH' : 'POST'} ${id}: ${r.status} ${await r.text()}`)
  const row = (await r.json())[0]
  console.log(`   OK — publicado=${Object.keys(row.texts).length} rascunho=${Object.keys(row.texts_draft ?? {}).length}`)
}

/* ── revisão de 25/07/2026 (arquivos "E/F Nova ordem das seções") ─────────
 *
 * Nada aqui é opcional para a LP renderizar: os componentes já trazem estes
 * textos como padrão. O que o seed resolve é (a) apagar valores velhos que o
 * banco ainda sobrescreve e (b) criar as linhas das seções novas, porque o
 * editor do admin só lista chave que existe no banco.
 *
 * REGRA DE COPY: a LP não usa travessão em lugar nenhum (remete a texto de
 * IA). Os textos do Francis que vinham com travessão foram reescritos com
 * vírgula ou ponto. */

// Slide 2: o Hero fica só com o título e esta frase.
const HERO = {
  subtitle: 'O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do comprador',
}

// Slide 6: subtítulo que fecha o ato do vídeo, no lugar do antigo CTA.
const VIDEO = {
  outroLine1: 'A maioria dos vendedores solares continua tentando convencer o cliente.',
  outroLine2: 'Os vendedores Buy-Side aprendem primeiro como o comprador decide.',
}

// Slide 3: CTA 1, o primeiro botão da página.
const AUTORES = {
  ctaButton: 'Quero vender pela perspectiva do comprador',
}

// Slide 7: depoimento novo. A foto saiu do próprio PPTX do Francis.
const LUCAS = {
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
}
const LUCAS_IMG = { testimonialImage: '/assets/Integrador_Lucas_BH.jpg' }

// Slide 8: seção nova. Textos do Francis, visual redesenhado.
const TRANSFORMACAO = {
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
}

// Slide 10: substitui a frase de fechamento do Público (inclusive a que o
// seed de 22-23/07 grava logo acima: esta é a versão mais nova).
const AUDIENCIA_2507 = {
  bottomTitle: 'O futuro das vendas solares não pertence aos melhores argumentadores.',
  bottomHighlight: 'Pertence aos profissionais que sabem conduzir a decisão de compra.',
  bottomText:
    'Os melhores vendedores solares do futuro serão aqueles que entendem como o comprador pensa, reduzem sua insegurança e conduzem a decisão com confiança.',
  bottomEmphasis: 'O Método Solar Buy-Side foi criado para formar exatamente esse profissional.',
  bottomOutro: 'A seguir, conheça as ferramentas que tornam essa transformação possível.',
}

// Slides 11 e 12: título da seção + texto novo do CTA 3.
const MANUAL_2507 = {
  kitTitle: 'Kit Completo Solar Buy-Side',
  kitSubtitle: 'Para conduzir decisões, você precisa dominar dois lados da conversa.',
  ctaButton: 'Quero vender mais e com estratégia',
}

// Slide 15: CTA 5.
const PLATAFORMA = {
  ctaButton: 'Quero o Manual + o Código + acesso à Plataforma',
}

// Slides 17 e 18: frase de payback + as três linhas da promo Belenergy.
const PRECO = {
  // Slide 17: "acrescentar a frase e a destacar". O travessão do original
  // virou ponto final (a LP não usa travessão).
  paybackNote:
    'Apenas uma venda fechada usando o Método Buy-Side já paga 100% do seu investimento. <span class="cms-orange">Todo o resto é lucro.</span>',
  promoTitle: '15% OFF para Integradores cadastrados na',
  promoSubtitle: 'Você está sem cupom Belenergy?',
  promoNote:
    'Compra agora e reembolsamos a diferença de <span class="cms-orange">R$ 119,55</span> sob apresentação do cupom!',
}

// Slide 2: título da faixa de logos.
const APOIADORES_2507 = {
  bandTitle: 'Empresas referência no mercado solar apoiam o Movimento Solar Buy-Side',
}

// Stäubli entrou na revisão de 25/07 (fabricantes). O logo foi extraído do
// próprio PPTX. Vai como logo17 para não renumerar os 16 que já existem.
const STAUBLI_N = LOGOS.length + 1
const STAUBLI_TEXTS = {
  [`logo${STAUBLI_N}Name`]: 'Stäubli',
  [`logo${STAUBLI_N}Cat`]: 'Fabricantes',
  [`logo${STAUBLI_N}Desc`]: 'Fabricante suíça de conectores fotovoltaicos e soluções de conexão elétrica.',
}
const STAUBLI_IMGS = { [`logo${STAUBLI_N}Src`]: '/assets/apoiadores/staubli.png' }

/* ── aplicação ───────────────────────────────────────────────────────── */

console.log(DRY ? '=== DRY RUN (não grava) ===' : '=== APLICANDO no Supabase ===')

console.log('\n--- revisão 22-23/07 ---')
// substituir=true: o texto do Código e a frase do Público são substituição
// explícita pedida nos slides, não preenchimento de lacuna.
await gravar('manual-strategic', CODIGO, {}, true)
await gravar('audience', AUDIENCIA, {}, true)
await gravar('apoiadores', apoiadoresTexts, apoiadoresImages, false)

console.log('\n--- revisão 25/07 ---')
await gravar('hero', HERO, {}, true)
await gravar('authority', AUTORES, {}, true)
await gravar('video', VIDEO, {}, true)
await gravar('testimonial-lucas', LUCAS, LUCAS_IMG, true)
await gravar('transformacao', TRANSFORMACAO, {}, true)
await gravar('audience', AUDIENCIA_2507, {}, true)
await gravar('manual-strategic', MANUAL_2507, {}, true)
await gravar('plataforma', PLATAFORMA, {}, true)
await gravar('pricing', PRECO, {}, true)
await gravar('apoiadores', APOIADORES_2507, {}, true)
await gravar('apoiadores', STAUBLI_TEXTS, STAUBLI_IMGS, false)

console.log('\nPronto.', DRY ? '(nada foi gravado)' : 'Confira em /admin/landing e publique se precisar.')
