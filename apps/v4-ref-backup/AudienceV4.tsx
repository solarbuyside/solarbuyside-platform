import React from 'react'
import { Building2, CheckCircle2, Rocket, Users } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Reveal } from './atoms'

const PROFILE_META = [
  { Icon: Building2, accent: 'text-blue-600', soft: 'bg-blue-50', ring: 'group-hover:shadow-[0_22px_44px_-18px_rgba(37,99,235,0.35)]' },
  { Icon: Rocket, accent: 'text-orange-600', soft: 'bg-orange-50', ring: 'group-hover:shadow-[0_22px_44px_-18px_rgba(249,115,22,0.35)]' },
  { Icon: Users, accent: 'text-emerald-600', soft: 'bg-emerald-50', ring: 'group-hover:shadow-[0_22px_44px_-18px_rgba(16,185,129,0.35)]' },
]

export const AudienceV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('audience')

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

  return (
    <section className="relative bg-white text-slate-900 antialiased">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-12 max-w-3xl">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.7rem] md:leading-[1.1]">
              {section?.texts.title || 'Quem REALMENTE precisa desse conhecimento?'}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-4 text-lg font-medium leading-relaxed text-slate-500 md:text-xl">
              {section?.texts.subtitle || 'Veja para quem o Manual Solar Buy-Side é essencial:'}
            </p>
          </Reveal>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {profiles.map((profile, idx) => {
            const meta = PROFILE_META[idx]
            return (
              <Reveal key={profile.title} delay={idx * 110}>
                <div
                  className={`v4-lift group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-7 shadow-[0_2px_12px_rgba(15,23,42,0.05)] hover:border-slate-300 ${meta.ring}`}
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl ${meta.soft} ${meta.accent} transition-transform duration-500 group-hover:scale-110`}>
                      <meta.Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      {profile.tag}
                    </span>
                  </div>

                  <h3 className="mb-2.5 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-orange-600 md:text-2xl">
                    {profile.title}
                  </h3>
                  <p className="mb-6 font-medium leading-relaxed text-slate-500">{profile.description}</p>

                  <div className="mt-auto space-y-2.5 border-t border-slate-100 pt-5">
                    {profile.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />
                        <span className="text-base font-semibold text-slate-800">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={120}>
          <div className="relative overflow-hidden rounded-3xl bg-[#060b1a] px-8 py-8 md:px-10">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600" aria-hidden />
            <div
              className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl"
              aria-hidden
            />
            <div className="flex items-start gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="max-w-4xl text-lg font-bold leading-relaxed text-white md:text-2xl md:leading-snug">
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
