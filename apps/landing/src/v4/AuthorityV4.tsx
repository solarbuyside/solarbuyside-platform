import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, Reveal, SolarCells } from './atoms'
import { criarTxt } from './cms'

/* "O DUELO" — Francis (azul, buy-side) à esquerda vs. Ovídio (laranja,
   sell-side) à direita, divididos por uma linha vertical que funde as
   duas cores. Fotos sempre em cor real (o duotone saiu em 26/07). */

type DuelSideProps = {
  image: string
  name: string
  badge: string
  experience: string
  experienceLabel: string
  description: string
  tag: string
  tone: 'blue' | 'orange'
  baseDelay?: number
}

const TONES = {
  blue: {
    accent: 'text-blue-400',
    tag: 'border-blue-500/30 bg-blue-900/25 text-blue-400',
    wash: 'radial-gradient(70% 55% at 50% 0%, rgba(59,130,246,0.06), transparent 72%)',
  },
  orange: {
    accent: 'text-orange-400',
    tag: 'border-orange-500/30 bg-orange-900/25 text-orange-400',
    wash: 'radial-gradient(70% 55% at 50% 0%, rgba(249,115,22,0.06), transparent 72%)',
  },
} as const

const DuelSide: React.FC<DuelSideProps> = ({
  image,
  name,
  badge,
  experience,
  experienceLabel,
  description,
  tag,
  tone,
  baseDelay = 0,
}) => {
  const t = TONES[tone]

  return (
    <div className="relative flex flex-col gap-7 p-2 lg:p-12">
      {/* Wash de cor no topo do lado */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: t.wash }}
        aria-hidden
      />

      {/* Experiência editorial: número gigante + label mono */}
      <Reveal delay={baseDelay} className="relative flex items-end gap-4">
        {/* 60/72 -> 56/68 (26/07) -> 45/54 (27/07) -> 28/34 (28/07). O Francis
            pediu para reduzir MUITO: nesta revisão a mensagem da seção é a
            história, e o número disputava a atenção com ela. */}
        <span className={`font-['Sora'] text-[28px] font-extrabold leading-none tracking-tight md:text-[34px] ${t.accent}`}>
          {experience}
        </span>
        <span className="v4-mono mb-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
          {experienceLabel}
        </span>
      </Reveal>

      {/* Foto sempre em cor real. O tratamento duotone (preto e branco +
          camada azul/laranja em mix-blend-overlay, que abria no hover) saiu a
          pedido do Gabriel (26/07). */}
      <Reveal
        delay={baseDelay + 90}
        as="figure"
        // 288 -> 224px: segunda redução pedida pelo Francis (slide 3,
        // "reduzir o tamanho das fotos"). A seção subiu para o topo da página
        // e o peso agora tem que estar no texto, não no retrato.
        // 224 -> 184px: as fotos cedem espaço para o texto inicial (Francis, 28/07).
        className="group relative aspect-[3/4] w-full max-w-[184px] overflow-hidden rounded-[2rem] bg-white/[0.03]"
      >
        <Img
          src={image}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#07090d]/85 to-transparent"
          aria-hidden
        />
      </Reveal>

      <Reveal delay={baseDelay + 180} className="relative">
        <p className={`v4-mono text-[10px] uppercase tracking-[0.3em] ${t.accent}`}>{badge}</p>
        <h3 className="mt-2 font-['Sora'] text-3xl font-extrabold tracking-tight text-white md:text-4xl">{name}</h3>
      </Reveal>

      <Reveal delay={baseDelay + 260} className="relative">
        <p className="text-lg leading-relaxed text-slate-400">{description}</p>
      </Reveal>

      <Reveal delay={baseDelay + 340} className="relative">
        <span
          className={`v4-mono inline-flex w-fit items-center rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.18em] ${t.tag}`}
        >
          {tag}
        </span>
      </Reveal>
    </div>
  )
}

export const AuthorityV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('authority')
  const txt = criarTxt(section)

  /* Título: UM campo só, com o destaque pintável (Gabriel, 28/07). Antes eram
     duas chaves (title + titleHighlight) montadas numa caixa composta, e isso
     produziu dois bugs: quando o cliente destacava a frase inteira, `title`
     ficava vazio e o texto padrão do código voltava por cima; e a caixa era
     reaproveitada entre seções no admin.

     Agora `title` guarda o HTML inteiro e a landing renderiza via <CMSText>.
     `titleHighlight` vira LEGADO: se o título ainda não tem marcação e a chave
     antiga existe, as duas são costuradas aqui — assim nada se perde até ele
     salvar pela primeira vez no formato novo. */
  const tituloCms = section?.texts.title
  const destaqueLegado = (section?.texts.titleHighlight ?? '').trim()
  const tituloHtml = (() => {
    if (tituloCms === undefined && !destaqueLegado) {
      return 'Este conteúdo foi concebido por quem viveu <span class="cms-orange">os dois lados da mesa: o do comprador e o do vendedor.</span>'
    }
    const base = (tituloCms ?? '').trim()
    if (base.includes('<span')) return base
    if (!destaqueLegado) return base
    return [base, `<span class="cms-orange">${destaqueLegado}</span>`].filter(Boolean).join(' ')
  })()

  /* Parágrafos da história: story1..N, vazios ignorados. Lista aberta para ele
     decidir quantos são sem pedir dev (começou pedindo 1, depois 2). */
  const MAX_HISTORIA = 8
  const historia = Array.from({ length: MAX_HISTORIA }, (_, i) => section?.texts[`story${i + 1}`] ?? '')
    .filter((v) => v.trim().length > 0)

  return (
    /* Reabertura do ato escuro: esta seção sobe por cima dos Apoiadores
       (claros) com o arco arredondado, espelhando o movimento que a oferta faz
       lá embaixo. Antes de 06/08 ela vinha depois do vídeo, escuro sobre
       escuro, e não precisava de emenda nenhuma.

       rounded-t + overflow-hidden já estavam aqui; o que entra é o -mt-20 e o
       z-10 para ela realmente montar sobre a seção anterior. */
    <section
      id="autor"
      className="relative z-10 -mt-20 overflow-hidden rounded-t-[3rem] bg-[#07090d] pb-32 pt-28 text-white md:rounded-t-[4.5rem] md:pt-36"
    >
      {/* fade "top": a grade entra cheia no topo da seção e vai apagando até
          sumir no meio. É a retomada do crepúsculo, não uma textura isolada. */}
      <SolarCells fade="top" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <div>
          <Reveal>
            <span className="v4-mono inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
              {txt('badge', 'Experiência Dual')}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 max-w-4xl font-['Sora'] text-[clamp(1.9rem,3.8vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-white">
              <CMSText value={tituloHtml} />
            </h2>
          </Reveal>

          {/* História da seção (Francis, 28/07: "a mensagem principal é a
              história, não seus autores"). Parágrafos livres entre o título e
              os autores, editáveis em "Autoridade > História". */}
          {historia.length > 0 && (
            <Reveal delay={160}>
              <div className="mt-7 max-w-3xl space-y-4">
                {historia.map((paragrafo, i) => (
                  <p key={i} className="text-[15px] leading-relaxed text-slate-300 md:text-[17px]">
                    <CMSText value={paragrafo} />
                  </p>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* O duelo */}
        <div className="relative mt-16">
          {/* Linha central: azul (buy-side) funde no laranja (sell-side).
              bottom-16: termina na altura das duas etiquetas ("Especialista
              Visão Buy-Side / Sell-Side") em vez de descer até encostar no
              CTA (Gabriel, 26/07). */}
          <div
            className="absolute bottom-16 left-1/2 top-0 hidden w-px bg-gradient-to-b from-blue-500/40 via-white/10 to-orange-500/40 lg:block"
            aria-hidden
          />

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
            <DuelSide
              image={section?.images.francis || '/assets/Francis Poloni LP PRO 368.jpeg'}
              name={txt('person1Name', 'Francis Poloni')}
              badge={txt('person1Badge', 'Especialista')}
              experience={txt('person1Experience', '+7 Anos')}
              experienceLabel={txt('person1ExperienceLabel', 'de experiência')}
              description={
                txt('person1Desc', 'Atua desde 2018 no setor de integração fotovoltaica e consultoria onde assessorou tanto no lado do comprador (Buy-Side) quanto no lado do vendedor (Sell-Side), ajudando na tomada de decisões inteligentes e seguras.')
              }
              tag={txt('person1Tag', 'Especialista Visão Buy-Side (Comprador)')}
              tone="blue"
              baseDelay={0}
            />

            {/* Divider horizontal no empilhamento mobile */}
            <div className="h-px w-full bg-white/[0.08] lg:hidden" aria-hidden />

            <DuelSide
              image={section?.images.ovidio || '/assets/Ovídio2.png'}
              name={txt('person2Name', 'Ovídio Collesi')}
              badge={txt('person2Badge', 'Especialista')}
              experience={txt('person2Experience', '+6 Anos')}
              experienceLabel={txt('person2ExperienceLabel', 'de experiência')}
              description={
                txt('person2Desc', 'Com vasta experiência em venda e pós venda no setor de energia solar fotovoltaica desde 2020, teve passagens por marketplaces, distribuidores, integração solar e certificadora, trazendo uma visão completa do lado do vendedor e do suporte técnico.')
              }
              tag={txt('person2Tag', 'Especialista Visão Sell-Side (Vendedor)')}
              tone="orange"
              baseDelay={150}
            />
          </div>
        </div>

        {/* O CTA que fechava esta seção saiu na revisão de 06/08 (slide 8:
            "eliminar este CTA"). O Hero voltou a ter botão em 03/08, então o
            primeiro botão da página não é mais este, e a seção termina no
            duelo, que é o argumento dela. A chave `ctaButton` segue no banco. */}
      </div>
    </section>
  )
}
