import React from 'react'
import { AlertCircle, CheckCircle2, Search, ShieldCheck, Zap } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow, Kicker, Reveal } from './atoms'
import { scrollToId } from './scroll'

const CARD_ICONS = [Search, Zap, ShieldCheck]

export const ContextV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('context')

  const cards = [
    {
      title: section?.texts.card1Title || 'Saberão analisar',
      desc: section?.texts.card1Desc || 'Compararão propostas com precisão técnica superior à média do mercado.',
    },
    {
      title: section?.texts.card2Title || 'Analisarão fundo',
      desc: section?.texts.card2Desc || 'Fornecedores e tecnologias passarão por um crivo muito mais rigoroso.',
    },
    {
      title: section?.texts.card3Title || 'Avaliarão risco',
      desc: section?.texts.card3Desc || 'A confiabilidade da sua empresa será o fator decisivo antes de qualquer preço.',
    },
  ]

  const checks = [
    section?.texts.check1 || 'Visão do Cliente',
    section?.texts.check2 || 'Gatilhos de Compra',
    section?.texts.check3 || 'Confiabilidade',
  ]

  return (
    <section className="relative bg-[#fafaf8] text-slate-900 antialiased">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        {/* Cabeçalho */}
        <div className="mb-12 max-w-3xl">
          <Reveal>
            <Kicker tone="light">{section?.texts.badge || 'Vision 2026'}</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.7rem] md:leading-[1.1]">
              {section?.texts.title || 'Panorama'}{' '}
              <span className="text-slate-300">{section?.texts.titleHighlight || '2026'}</span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-lg font-medium leading-relaxed text-slate-500 md:text-xl">
              {section?.texts.subtitle ||
                'Pode parecer exagero, mas em breve cada vez mais compradores de sistema fotovoltaico estarão informados.'}
            </p>
          </Reveal>
        </div>

        {/* Cards do novo comprador */}
        <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map((item, idx) => {
            const Icon = CARD_ICONS[idx]
            return (
              <Reveal key={item.title} delay={idx * 110}>
                <div className="v4-lift group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:border-orange-200 hover:shadow-[0_24px_50px_-20px_rgba(15,23,42,0.18)]">
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-orange-50 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                  <span className="mb-5 block text-xs font-extrabold tracking-[0.25em] text-slate-300">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-all duration-500 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-[0_12px_24px_-8px_rgba(249,115,22,0.6)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h4>
                  <p className="text-base leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Alerta */}
        <Reveal delay={120}>
          <div className="relative mb-10 overflow-hidden rounded-3xl bg-[#060b1a] px-7 py-6 md:px-9">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600" aria-hidden />
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl"
              aria-hidden
            />
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold leading-snug text-white md:text-xl">
                  {section?.texts.alertTitle || 'Quem não entender essa nova jornada vai perder vendas.'}
                </h3>
              </div>
              <div className="hidden h-10 w-px bg-white/10 md:block" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                {section?.texts.alertSubtitle || 'O cenário está evoluindo. Você está pronto?'}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Solução */}
        <Reveal delay={100}>
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.25)] md:p-12">
            <div
              className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl"
              aria-hidden
            />
            <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <Kicker tone="light">{section?.texts.solutionBadge || 'A Solução Definitiva'}</Kicker>
                <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                  {section?.texts.solutionTitle || 'Ainda há tempo para reverter essa situação.'}
                </h3>
                <p className="mt-4 max-w-xl leading-relaxed text-slate-600">
                  {section?.texts.solutionDesc ||
                    'O Manual de Compra Solar Buy-Side mapeia os novos gatilhos de decisão do cliente moderno, garantindo que você esteja do lado certo da venda.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
                  {checks.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-base font-bold text-slate-700">
                      <CheckCircle2 className="h-[18px] w-[18px] text-orange-500" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 lg:col-span-2 lg:items-end">
                <Cta size="lg" onClick={() => scrollToId('oferta')}>
                  {section?.texts.ctaButton || 'Garantir meu acesso agora'}
                  <CtaArrow />
                </Cta>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  {section?.texts.ctaSubtext || 'Download Imediato • PDF Interativo'}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
