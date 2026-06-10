import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { DarkBackdrop, Reveal } from './atoms'

type PersonProps = {
  image: string
  name: string
  badge: string
  experience: string
  experienceLabel: string
  description: string
  tag: string
  tagTone: 'blue' | 'orange'
  flip?: boolean
}

const PersonCard: React.FC<PersonProps> = ({
  image,
  name,
  badge,
  experience,
  experienceLabel,
  description,
  tag,
  tagTone,
  flip = false,
}) => (
  <div className={`grid items-center gap-10 md:grid-cols-12 ${flip ? '' : ''}`}>
    <div className={`md:col-span-4 ${flip ? 'md:order-2' : ''}`}>
      <Reveal delay={80}>
        <div className="group relative mx-auto max-w-[300px]">
          <div
            className={`absolute -inset-3 rounded-[2rem] opacity-50 blur-2xl transition-opacity duration-700 group-hover:opacity-90 ${
              tagTone === 'blue' ? 'bg-blue-600/20' : 'bg-orange-500/20'
            }`}
            aria-hidden
          />
          <figure className="relative aspect-[3/4] overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-800 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
            <img
              src={image}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/40" aria-hidden />
            <div className="absolute bottom-4 right-4 rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-3 shadow-[0_16px_32px_-10px_rgba(249,115,22,0.8)]">
              <p className="text-2xl font-extrabold leading-none text-white">{experience}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/90">{experienceLabel}</p>
            </div>
          </figure>
        </div>
      </Reveal>
    </div>

    <div className={`space-y-4 md:col-span-8 ${flip ? 'md:order-1' : ''}`}>
      <Reveal>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.25em] text-orange-500">{badge}</p>
        <h3 className="text-3xl font-extrabold tracking-tight text-white">{name}</h3>
      </Reveal>
      <Reveal delay={100}>
        <p className="text-lg leading-relaxed text-slate-400">{description}</p>
      </Reveal>
      <Reveal delay={180}>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
            tagTone === 'blue'
              ? 'border-blue-500/30 bg-blue-900/25 text-blue-400'
              : 'border-orange-500/30 bg-orange-900/25 text-orange-400'
          }`}
        >
          {tag}
        </span>
      </Reveal>
    </div>
  </div>
)

export const AuthorityV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('authority')

  return (
    <section id="autor" className="relative overflow-hidden bg-gradient-to-b from-[#070d1d] via-[#060b1a] to-[#030712] text-white">
      <DarkBackdrop orbs="blue" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-orange-400">
              {section?.texts.badge || 'Experiência Dual'}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
              {section?.texts.title || 'Este conteúdo foi concebido por quem domina, as duas perspectivas da'}{' '}
              <span className="v4-grad-text">
                {section?.texts.titleHighlight || 'mesa de negociação — a do comprador e a do vendedor.'}
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="space-y-16">
          <PersonCard
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
            tagTone="blue"
          />

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />

          <PersonCard
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
            tagTone="orange"
            flip
          />
        </div>
      </div>
    </section>
  )
}
