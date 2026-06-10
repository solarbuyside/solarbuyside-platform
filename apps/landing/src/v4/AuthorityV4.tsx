import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { GrainOverlay, Reveal, SolarCells } from './atoms'

/* "O DUELO" — Francis (azul, buy-side) à esquerda vs. Ovídio (laranja,
   sell-side) à direita, divididos por uma linha vertical que funde as
   duas cores. Fotos em duotone que revelam a cor real no hover. */

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
    duotone: 'bg-blue-600/25',
    tag: 'border-blue-500/30 bg-blue-900/25 text-blue-400',
    wash: 'radial-gradient(70% 55% at 50% 0%, rgba(59,130,246,0.06), transparent 72%)',
  },
  orange: {
    accent: 'text-orange-400',
    duotone: 'bg-orange-600/25',
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
        <span className={`font-['Sora'] text-6xl font-extrabold leading-none tracking-tight md:text-7xl ${t.accent}`}>
          {experience}
        </span>
        <span className="v4-mono mb-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
          {experienceLabel}
        </span>
      </Reveal>

      {/* Foto duotone → cor no hover */}
      <Reveal
        delay={baseDelay + 90}
        as="figure"
        className="group relative aspect-[3/4] w-full max-w-[360px] overflow-hidden rounded-[2rem] bg-white/[0.03]"
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center grayscale transition duration-[900ms] group-hover:grayscale-0"
        />
        <div
          className={`absolute inset-0 mix-blend-overlay transition duration-[900ms] group-hover:opacity-0 ${t.duotone}`}
          aria-hidden
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

  return (
    <section id="autor" className="relative overflow-hidden bg-[#07090d] py-24 pb-32 text-white md:py-32">
      <GrainOverlay />
      <SolarCells fade="center" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <div>
          <Reveal>
            <span className="v4-mono inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
              {section?.texts.badge || 'Experiência Dual'}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 max-w-4xl font-['Sora'] text-[clamp(1.9rem,3.8vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-white">
              {section?.texts.title || 'Este conteúdo foi concebido por quem domina, as duas perspectivas da'}{' '}
              <span className="v4-serif v4-grad-text">
                {section?.texts.titleHighlight || 'mesa de negociação — a do comprador e a do vendedor.'}
              </span>
            </h2>
          </Reveal>
        </div>

        {/* O duelo */}
        <div className="relative mt-16">
          {/* Linha central: azul (buy-side) funde no laranja (sell-side) */}
          <div
            className="absolute bottom-0 left-1/2 top-0 hidden w-px bg-gradient-to-b from-blue-500/40 via-white/10 to-orange-500/40 lg:block"
            aria-hidden
          />

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
            <DuelSide
              image={section?.images.francis || '/assets/Francis Poloni LP PRO.jpg.jpeg'}
              name={section?.texts.person1Name || 'Francis Poloni'}
              badge={section?.texts.person1Badge || 'Especialista'}
              experience={section?.texts.person1Experience || '+7 Anos'}
              experienceLabel={section?.texts.person1ExperienceLabel || 'de experiência'}
              description={
                section?.texts.person1Desc ||
                'Atua desde 2018 no setor de integração fotovoltaica e consultoria onde assessorou tanto no lado do comprador (Buy-Side) quanto no lado do vendedor (Sell-Side), ajudando na tomada de decisões inteligentes e seguras.'
              }
              tag={section?.texts.person1Tag || 'Especialista Visão Buy-Side (Comprador)'}
              tone="blue"
              baseDelay={0}
            />

            {/* Divider horizontal no empilhamento mobile */}
            <div className="h-px w-full bg-white/[0.08] lg:hidden" aria-hidden />

            <DuelSide
              image={section?.images.ovidio || '/assets/Ovídio2.png'}
              name={section?.texts.person2Name || 'Ovídio Collesi'}
              badge={section?.texts.person2Badge || 'Especialista'}
              experience={section?.texts.person2Experience || '+5 Anos'}
              experienceLabel={section?.texts.person2ExperienceLabel || 'de experiência'}
              description={
                section?.texts.person2Desc ||
                'Com vasta experiência em venda e pós venda no setor de energia solar fotovoltaica desde 2020, teve passagens por marketplaces, distribuidores, integração solar e certificadora, trazendo uma visão completa do lado do vendedor e do suporte técnico.'
              }
              tag={section?.texts.person2Tag || 'Especialista Visão Sell-Side (Vendedor)'}
              tone="orange"
              baseDelay={150}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
