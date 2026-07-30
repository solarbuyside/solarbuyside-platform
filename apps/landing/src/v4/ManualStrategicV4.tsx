import React from 'react'
import { BarChart3, Layout, MinusCircle, Target, TrendingUp, Users } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, Cta, CtaArrow, GrainOverlay, Kicker, Reveal } from './atoms'
import { scrollToId } from './scroll'

type ItemProps = {
  Icon: React.ComponentType<{ size?: number }>
  title: string
  desc: React.ReactNode
  delay?: number
}

/* Lista numerada do ato escuro: rótulo mono laranja + itens 01..N com fio.
   Nasceu no bloco do Código e virou compartilhada quando o Francis pediu a
   mesma coisa no Manual (29/07) — os dois blocos usam a mesma anatomia, então
   duplicar o markup só criaria duas versões para divergirem depois. */
const NumberedList: React.FC<{ title?: string; items: string[] }> = ({ title, items }) => (
  <>
    {/* h3, não h4: o título anterior do bloco é um h2, e pular de h2 para h4
        quebra a ordem da árvore de headings (o Lighthouse acusava "ordem
        sequencial descendente"). */}
    {title?.trim() && (
      <h3 className="border-b border-white/[0.08] pb-3">
        <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">{title}</span>
      </h3>
    )}
    <ul>
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[48px_1fr] gap-5 border-b border-white/[0.08] py-5">
          <span className="v4-mono text-xl font-bold leading-none text-white/25" aria-hidden>
            {`0${i + 1}`}
          </span>
          <p className="leading-relaxed text-slate-300">
            <CMSText value={item} />
          </p>
        </li>
      ))}
    </ul>
  </>
)

/* Item editorial sem caixa: anel hairline + hairline inferior, inversão laranja no hover */
const FeatureItem: React.FC<ItemProps> = ({ Icon, title, desc, delay = 0 }) => (
  <Reveal
    as="li"
    delay={delay}
    className="group grid grid-cols-[48px_1fr] gap-5 border-b border-white/[0.08] py-6 transition-transform duration-500 hover:translate-x-1"
  >
    <span
      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-orange-500 transition-all duration-500 group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white"
      aria-hidden
    >
      <Icon size={20} />
    </span>
    <div className="min-w-0 space-y-1.5">
      <h4 className="text-lg font-bold text-white">{title}</h4>
      <p className="leading-relaxed text-slate-400">{desc}</p>
    </div>
  </Reveal>
)

export const ManualStrategicV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('manual-strategic')

  const manualImage = section?.images.manualImage || '/assets/Capa-manual-buy-side-definitiva.png'
  const codeImage = section?.images.codeImage || '/assets/codigo-oficial-norm.png'

  /* Bloco "Código do Vendedor" (dentro do Manual, na LP oficial): era texto
     fixo no código e por isso não aparecia no editor do admin — reportado pelo
     Francis em 2026-07-23. Agora vem do CMS, com 4 parágrafos; os vazios não
     renderizam. Destaque em negrito usa <span class="cms-bold"> (o CMSText
     remove <strong>). */
  /* Ordem pedida no slide 4 (Francis 2026-07-22): parágrafos 1-2, depois a
     lista "O que você leva", depois os parágrafos 3-4 de fechamento. Por isso
     os parágrafos vêm em dois grupos, não numa lista só. */
  const notEmpty = (value: string) => value.trim().length > 0

  /* Os parágrafos deixaram de ser 2 fixos de cada lado (Francis, 27/07: "é
     preciso criar um outro parágrafo para separar em 2 o primeiro"). Agora são
     listas: codeTop1..N antes da lista e codeBottom1..N depois, editáveis no
     admin com adicionar/remover.

     As chaves antigas (codeDesc1-4) continuam valendo como fallback nas duas
     primeiras posições de cada grupo — o banco ainda guarda o texto ali, e
     migrar sem isso apagaria o conteúdo publicado até o primeiro salvamento. */
  const MAX_PARAGRAFOS = 8
  const lerParagrafos = (prefixo: string, legado: (string | undefined)[]) => {
    const out: string[] = []
    for (let i = 1; i <= MAX_PARAGRAFOS; i++) {
      const novo = section?.texts[`${prefixo}${i}`]
      const valor = novo ?? legado[i - 1]
      if (valor === undefined) continue
      out.push(valor)
    }
    return out.filter(notEmpty)
  }

  const codeParagraphsTop = lerParagrafos('codeTop', [
    section?.texts.codeDesc1 ??
      'Como extensão prática do Manual de Compra Solar Buy-Side, o <span class="cms-bold">Código do Vendedor Consultivo</span> ensina você a pensar como um comprador para conduzir negociações com mais estratégia, segurança e autoridade.',
    section?.texts.codeDesc2 ??
      'Ao aplicar o método, você compreende como o cliente avalia riscos, compara propostas e toma decisões de investimento. Em vez de disputar vendas pelo menor preço, passa a construir valor, conduzir a decisão de compra e posicionar sua proposta como a escolha mais segura.',
  ])
  const codeParagraphsBottom = lerParagrafos('codeBottom', [
    section?.texts.codeDesc3 ??
      'Se o Manual Solar Buy-Side mostra como o comprador decide, o Código do Vendedor Consultivo ensina a transformar esse conhecimento em negociações mais estratégicas, vendas mais lucrativas e clientes mais confiantes.',
    section?.texts.codeDesc4 ?? 'Resultado: você deixa de competir por preço e passa a vender por valor.',
  ])

  /* Listas numeradas dos dois blocos. A do Código veio primeiro (Francis
     2026-07-23); a do Manual foi pedida em 29/07 ("do mesmo jeito do que para
     o código"), com um subtítulo próprio. Itens vazios não renderizam, então o
     cliente controla quantos aparecem sem passar por aqui.
     O teto espelha os slots oferecidos no editor (field-schema.ts). */
  const MAX_ITENS = 6
  const lerItens = (prefixo: string) => {
    const out: string[] = []
    for (let i = 1; i <= MAX_ITENS; i++) {
      const valor = section?.texts[`${prefixo}${i}`]
      if (valor === undefined) continue
      out.push(valor)
    }
    return out.filter(notEmpty)
  }

  const manualItems = lerItens('manualItem')
  const codeItems = lerItens('codeItem')

  /* Cards do bloco 2. O default do código só vale quando a chave NÃO existe no
     banco: chave presente e vazia é o cliente dizendo "tira este card".

     Era `texts.x || 'default'`, e `||` trata "" como ausente. O Francis apagou
     os cards 3 das duas colunas no admin em 30/07 e os textos antigos
     continuaram na LP, porque o componente caía de volta no hardcoded. O trim
     cobre o `"\n"` que o editor grava quando o campo é esvaziado. */
  const card = (
    Icon: React.ComponentType<{ size?: number }>,
    titleKey: string,
    descKey: string,
    defTitle: string,
    defDesc: string,
  ) => ({
    Icon,
    title: (section?.texts[titleKey] ?? defTitle).trim(),
    desc: (section?.texts[descKey] ?? defDesc).trim(),
  })
  const comConteudo = (c: { title: string; desc: string }) => Boolean(c.title || c.desc)

  const sellCards = [
    card(Target, 'sellCard1Title', 'sellCard1Desc', 'Dores reais do cliente',
      'Compreende o que realmente pesa na decisão, não apenas o que ele diz na reunião.'),
    card(Users, 'sellCard2Title', 'sellCard2Desc', 'Postura consultiva',
      'Conduz a conversa como conselheiro técnico, não como tirador de pedido. O cliente percebe a diferença logo na primeira reunião.'),
    card(TrendingUp, 'sellCard3Title', 'sellCard3Desc', 'Valor técnico e econômico',
      'Demonstra, de forma fundamentada, como o valor técnico da solução se converte em benefício econômico.'),
  ].filter(comConteudo)

  const focusCards = [
    card(Layout, 'focusCard1Title', 'focusCard1Desc', 'Apresentações persuasivas',
      'Estruture propostas objetivas e transparentes que facilitam a decisão do cliente.'),
    card(BarChart3, 'focusCard2Title', 'focusCard2Desc', 'Autoridade na mesa',
      'Constrói autoridade e conexões reais, que fecham negócio sem desconto.'),
    card(MinusCircle, 'focusCard3Title', 'focusCard3Desc', 'Menos desconto, mais margem',
      'Argumente com precisão e preserve sua comissão sem perder vendas.'),
  ].filter(comConteudo)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#07090d] to-[#0b0907] text-slate-100 antialiased">
      <GrainOverlay />

      {/* O pb-44 do arco "paper" mudou de dono: quem fecha o ato escuro agora
          é a seção Retorno (RetornoV4), logo abaixo. */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        {/* ── Título da seção (Francis, slide 11: "criar este título da seção
            MANUAL ESTRATÉGICO"). Cobre o bloco inteiro: Manual, Código e os
            resultados, que são as duas ferramentas do "kit". ───────────── */}
        <Reveal>
          <h2 className="font-['Sora'] text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-white">
            {section?.texts.kitTitle || 'Kit Completo Solar Buy-Side'}
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            {section?.texts.kitSubtitle || 'Para conduzir decisões, você precisa dominar dois lados da conversa.'}
          </p>
        </Reveal>
        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" aria-hidden />

        {/* ── Parte 1: spotlight do produto ─────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Texto */}
          <div className="relative z-10 flex flex-col lg:col-span-7">
            <Reveal>
              <Kicker tone="dark">{section?.texts.badge || 'A ferramenta estratégica'}</Kicker>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 text-[clamp(2.6rem,5vw,4.2rem)] font-extrabold leading-[1.05] tracking-tight text-white">
                {section?.texts.title || 'Manual Solar Buy-Side'}
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="v4-serif mt-5 max-w-md border-l-2 border-orange-500 pl-5 text-2xl leading-snug text-amber-200/90">
                {section?.texts.subtitle || 'A ferramenta estratégica que todo vendedor do setor solar precisa ter.'}
              </p>
            </Reveal>

            <Reveal delay={270} className="mt-8 max-w-2xl space-y-5 text-justify text-lg leading-relaxed text-slate-400">
              <p>
                {section?.texts.description1 ||
                  'O Manual de Compra Solar Buy-Side é uma leitura essencial para profissionais do setor de vendas (Sell-Side) que desejam se destacar em um mercado ultracompetitivo.'}
              </p>
              <p>
                {section?.texts.description2 ||
                  'Ao proporcionar uma imersão na jornada de compra sob a ótica do comprador, este manual oferece uma compreensão estratégica dos critérios, motivações e desafios enfrentados pelo lado comprador (Buy-Side).'}
              </p>
              {/* Parágrafo 3: existe no CMS/admin desde sempre, mas nunca era
                  renderizado (bug reportado pelo Francis em 2026-07-23). */}
              {section?.texts.description3?.trim() && <p>{section.texts.description3}</p>}
            </Reveal>

            {/* Lista numerada do Manual (Francis, 29/07): mesma lista que o
                Código já tinha, aqui logo abaixo dos parágrafos. */}
            {manualItems.length > 0 && (
              <Reveal delay={360} className="mt-10 max-w-2xl">
                <NumberedList title={section?.texts.manualListTitle} items={manualItems} />
              </Reveal>
            )}
          </div>

          {/* Pedestal de luz: glow + capa flutuando + elipse no chão + reflexo */}
          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <Reveal delay={180}>
              <div className="relative flex justify-center">
                <div className="absolute -inset-12 rounded-full bg-orange-500/25 blur-[120px]" aria-hidden />

                <div className="relative w-[390px] max-w-full">
                  <div className="relative">
                    <Img
                      src={manualImage}
                      alt="Manual Solar Buy-Side"
                      className="v4-float relative h-auto w-full"
                      loading="lazy"
                    />
                    {/* Elipse de luz no chão */}
                    <div
                      className="absolute -bottom-10 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[100%] bg-orange-500/20 blur-2xl"
                      aria-hidden
                    />
                  </div>

                  {/* Reflexo espelhado */}
                  <Img
                    src={manualImage}
                    alt=""
                    aria-hidden
                    className="h-40 w-full scale-y-[-1] object-cover object-bottom opacity-[0.07]"
                    style={{
                      WebkitMaskImage: 'linear-gradient(180deg, black, transparent 70%)',
                      maskImage: 'linear-gradient(180deg, black, transparent 70%)',
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── Código do Vendedor: vem logo após o Manual (ordem do Francis) ─
            items-start (era items-center): a capa ficava centralizada na
            vertical enquanto a do Manual alinha pelo topo, com o título. */}
        <div className="mt-24 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="relative z-10 flex flex-col lg:col-span-7">
            <Reveal>
              <Kicker tone="dark">{section?.texts.codeBadge || 'Diferencial estratégico'}</Kicker>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 text-[clamp(2.2rem,4.4vw,3.6rem)] font-extrabold leading-[1.06] tracking-tight text-white">
                <CMSText value={section?.texts.codeTitle || 'Código do Vendedor Consultivo'} />
              </h2>
            </Reveal>
            {section?.texts.codeSubtitle?.trim() && (
              <Reveal delay={130}>
                <p className="v4-serif mt-5 max-w-xl border-l-2 border-orange-500 pl-5 text-2xl leading-snug text-amber-200/90">
                  <CMSText value={section.texts.codeSubtitle} />
                </p>
              </Reveal>
            )}
            <Reveal delay={180} className="mt-8 max-w-2xl space-y-5 text-justify text-lg leading-relaxed text-slate-400">
              {codeParagraphsTop.map((paragraph, i) => (
                <p key={i}>
                  <CMSText value={paragraph} />
                </p>
              ))}
            </Reveal>
            {codeItems.length > 0 && (
              <Reveal delay={240} className="mt-10 max-w-2xl">
                <NumberedList title={section?.texts.codeListTitle} items={codeItems} />
              </Reveal>
            )}
            {codeParagraphsBottom.length > 0 && (
              <Reveal delay={300} className="mt-8 max-w-2xl space-y-5 text-justify text-lg leading-relaxed text-slate-400">
                {codeParagraphsBottom.map((paragraph, i) => (
                  <p key={i}>
                    <CMSText value={paragraph} />
                  </p>
                ))}
              </Reveal>
            )}
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={180}>
              <div className="relative flex justify-center">
                <div className="absolute -inset-10 rounded-full bg-orange-500/20 blur-[110px]" aria-hidden />
                <div className="relative w-[300px] max-w-full">
                  <Img
                    src={codeImage}
                    alt="O Código do Vendedor Consultivo"
                    className="v4-float relative h-auto w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]"
                    loading="lazy"
                  />
                  <div
                    className="absolute -bottom-8 left-1/2 h-14 w-[70%] -translate-x-1/2 rounded-[100%] bg-orange-500/20 blur-2xl"
                    aria-hidden
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* CTA 3 — depois do Código, antes dos resultados (ordem do Francis).
            Texto novo na revisão de 25/07, slide 12. O valor antigo ("Quero
            vender com estratégia") é tratado como legado para a LP não
            depender do seed. */}
        <Reveal delay={120} className="mt-12">
          <Cta size="lg" onClick={() => scrollToId('oferta')}>
            {!section?.texts.ctaButton || section.texts.ctaButton === 'Quero vender com estratégia'
              ? 'Quero vender mais e com estratégia'
              : section.texts.ctaButton}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>

        <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" aria-hidden />

        {/* ── Parte 2: resultados ───────────────────────────────────────── */}
        <Reveal className="max-w-4xl">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-white">
            <CMSText
              value={
                section?.texts.section2Title?.trim()
                  ? section.texts.section2Title
                  : 'Veja os resultados <span class="cms-orange">concretos</span> que você pode alcançar ao aplicar o <span class="cms-orange">Método Solar Buy-Side</span> no seu processo de venda.'
              }
            />
          </h2>
          {section?.texts.section2Subtitle && (
            <p className="mt-4 text-xl font-medium text-slate-400 md:text-2xl">{section.texts.section2Subtitle}</p>
          )}
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
          {sellCards.length > 0 && (
          <div>
            <Reveal as="header" className="flex items-center gap-4">
              <span className="h-8 w-1 rounded-full bg-orange-500" aria-hidden />
              <h3 className="text-xs uppercase tracking-[0.3em] text-orange-500">
                <span className="v4-mono font-bold">{section?.texts.sellSideHeader || 'O que o vendedor desenvolve'}</span>
              </h3>
            </Reveal>
            <ul className="mt-2">
              {sellCards.map((c, i) => (
                <FeatureItem key={i} Icon={c.Icon} delay={(i + 1) * 80} title={c.title} desc={c.desc} />
              ))}
            </ul>
          </div>
          )}

          {focusCards.length > 0 && (
          <div>
            <Reveal as="header" className="flex items-center gap-4">
              <span className="h-8 w-1 rounded-full bg-orange-500" aria-hidden />
              <h3 className="text-xs uppercase tracking-[0.3em] text-orange-500">
                <span className="v4-mono font-bold">{section?.texts.focusHeader || 'Principais focos e habilidades'}</span>
              </h3>
            </Reveal>
            <ul className="mt-2">
              {focusCards.map((c, i) => (
                <FeatureItem key={i} Icon={c.Icon} delay={(i + 1) * 80} title={c.title} desc={c.desc} />
              ))}
            </ul>
          </div>
          )}
        </div>
      </div>
    </section>
  )
}
