import React, { useState } from 'react'
import { Building2, CheckCircle2, Rocket, Users } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { GrainOverlay, Reveal, WordReveal } from './atoms'

/* Cores semânticas dos perfis: azul = comprador estruturado (buy-side),
   laranja = marca, esmeralda = conversão/vendas. */
const PROFILE_META = [
  {
    Icon: Building2,
    accent: 'text-blue-400',
    borderActive: 'border-blue-500/40',
    glow: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08), transparent 72%)',
  },
  {
    Icon: Rocket,
    accent: 'text-orange-400',
    borderActive: 'border-orange-500/40',
    glow: 'radial-gradient(circle at 50% 0%, rgba(249,115,22,0.08), transparent 72%)',
  },
  {
    Icon: Users,
    accent: 'text-emerald-400',
    borderActive: 'border-emerald-500/40',
    glow: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.08), transparent 72%)',
  },
]

export const AudienceV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('audience')
  const [activeIndex, setActiveIndex] = useState(0)

  const profiles = [
    {
      title: section?.texts.profile1Title || 'Empresas de Integração Solar',
      description: section?.texts.profile1Desc || 'Para vender valor, fugir da guerra dos preços e fechar mais projetos.',
      bullets: [section?.texts.profile1Bullet1 || 'Vender valor', section?.texts.profile1Bullet2 || 'Fechar mais projetos'],
      tag: section?.texts.profile1Tag || 'ESTRUTURADOS',
    },
    {
      title: section?.texts.profile2Title || 'Empreendedores Iniciantes',
      description: section?.texts.profile2Desc || 'Para construir um negócio sólido desde o primeiro passo na integração solar.',
      bullets: [section?.texts.profile2Bullet1 || 'Base sólida', section?.texts.profile2Bullet2 || 'Autoridade desde o dia 1'],
      tag: section?.texts.profile2Tag || 'STARTUPS',
    },
    {
      title: section?.texts.profile3Title || 'Representantes Comerciais',
      description: section?.texts.profile3Desc || 'Para aumentar sua taxa de conversão reduzindo sua taxa de desconto.',
      bullets: [section?.texts.profile3Bullet1 || 'Menos desconto', section?.texts.profile3Bullet2 || 'Mais conversão'],
      tag: section?.texts.profile3Tag || 'VENDAS',
    },
  ]

  const title = section?.texts.title || 'Quem REALMENTE precisa desse conhecimento?'

  return (
    <section className="relative overflow-hidden bg-[#07090d] text-white antialiased">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        {/* ── Header: número fantasma + título palavra-a-palavra ───────── */}
        <div className="max-w-4xl">
          <Reveal>
            <span className="v4-stroke block font-['Sora'] text-7xl font-extrabold leading-none md:text-8xl" aria-hidden>
              03
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-4 text-[clamp(2.2rem,4.5vw,3.8rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              <WordReveal text={title} trigger="scroll" step={45} />
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-5 text-xl leading-relaxed text-slate-400">
              {section?.texts.subtitle || 'Veja para quem o Manual Solar Buy-Side é essencial:'}
            </p>
          </Reveal>
        </div>

        {/* ── Desktop: painéis expansivos horizontais ──────────────────── */}
        <Reveal delay={120}>
          <div className="mt-16 hidden h-[560px] gap-4 lg:flex">
            {profiles.map((profile, idx) => {
              const meta = PROFILE_META[idx]
              const active = activeIndex === idx
              return (
                <article
                  key={profile.title}
                  tabIndex={0}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                  className={`v4-panel relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem] border p-8 ${
                    active ? meta.borderActive : 'border-white/[0.08]'
                  }`}
                  style={{ flexGrow: active ? 3 : 1, flexBasis: 0 }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-700"
                    style={{ background: meta.glow, opacity: active ? 1 : 0 }}
                    aria-hidden
                  />
                  <GrainOverlay />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-3">
                      <span className="v4-mono text-xs font-bold text-slate-500">{`0${idx + 1}`}</span>
                      <span className="v4-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">{profile.tag}</span>
                    </div>
                    <meta.Icon className={`h-6 w-6 shrink-0 ${meta.accent}`} />
                  </div>

                  <div className="relative">
                    <h3 className="min-w-[220px] text-2xl font-bold tracking-tight text-white">{profile.title}</h3>
                    <div
                      className={`mt-5 min-w-[340px] max-w-[28rem] transition-all duration-500 ${
                        active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
                      }`}
                    >
                      <p className="text-lg leading-relaxed text-slate-300">{profile.description}</p>
                      <div className="mt-6 space-y-3">
                        {profile.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-center gap-3">
                            <CheckCircle2 className={`h-5 w-5 shrink-0 ${meta.accent}`} />
                            <span className="font-semibold text-white">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </Reveal>

        {/* ── Mobile: stack vertical, painéis sempre expandidos ────────── */}
        <div className="mt-14 flex flex-col gap-5 lg:hidden">
          {profiles.map((profile, idx) => {
            const meta = PROFILE_META[idx]
            return (
              <Reveal key={profile.title} delay={idx * 100}>
                <article className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] p-7">
                  <div className="pointer-events-none absolute inset-0" style={{ background: meta.glow }} aria-hidden />
                  <GrainOverlay />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2.5">
                        <span className="v4-mono text-xs font-bold text-slate-500">{`0${idx + 1}`}</span>
                        <span className="v4-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">{profile.tag}</span>
                      </div>
                      <meta.Icon className={`h-6 w-6 shrink-0 ${meta.accent}`} />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">{profile.title}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-slate-300">{profile.description}</p>
                    <div className="mt-6 space-y-3">
                      {profile.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-center gap-3">
                          <CheckCircle2 className={`h-5 w-5 shrink-0 ${meta.accent}`} />
                          <span className="font-semibold text-white">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        {/* ── Painel de fechamento (bottomTitle) ───────────────────────── */}
        <Reveal delay={120}>
          <div className="relative mt-16 overflow-hidden rounded-[2.5rem] border border-white/[0.08] p-10 md:p-14">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 115%, rgba(251,191,36,0.14), transparent 70%)' }}
              aria-hidden
            />
            <GrainOverlay />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-orange-500/30 text-orange-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="max-w-4xl text-2xl font-bold leading-snug text-white md:text-3xl">
                {section?.texts.bottomTitle ||
                  'Não importa em qual ponto da cadeia você está, o Manual Solar Buy-Side não é apenas um guia, mas uma imersão completa na perspectiva do comprador.'}
              </h3>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
