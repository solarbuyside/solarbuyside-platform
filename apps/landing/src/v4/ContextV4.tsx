import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow, GrainOverlay, Kicker, Reveal, SolarCells } from './atoms'
import { scrollToId } from './scroll'

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
    <section className="relative bg-[#07090d] text-white antialiased">
      <SolarCells fade="top" />
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        {/* Cabeçalho — índice editorial com número fantasma */}
        <div className="relative">
          <span
            className="v4-stroke pointer-events-none absolute -top-10 right-0 hidden font-['Sora'] text-[7rem] font-extrabold opacity-60 md:block md:text-[10rem]"
            aria-hidden
          >
            01
          </span>
          <Reveal>
            <Kicker tone="dark">{section?.texts.badge || 'Vision 2026'}</Kicker>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-5 font-['Sora'] text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              {section?.texts.title || 'Panorama'}{' '}
              <span className="v4-serif v4-grad-text">{section?.texts.titleHighlight || '2026'}</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-400 md:text-2xl">
              {section?.texts.subtitle ||
                'Pode parecer exagero, mas em breve cada vez mais compradores de sistema fotovoltaico estarão informados.'}
            </p>
          </Reveal>
        </div>

        {/* As 3 previsões — lista-índice com hairlines */}
        <div className="mt-16">
          {cards.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 90}>
              <div
                className={`group grid items-center gap-6 border-t border-white/[0.08] py-9 transition-colors duration-500 hover:bg-white/[0.015] md:grid-cols-[90px_1fr_1.1fr] ${
                  idx === cards.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="v4-mono text-sm text-slate-500 transition-colors duration-500 group-hover:text-orange-400">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-['Sora'] text-2xl font-bold text-white transition-transform duration-500 group-hover:translate-x-2 md:text-3xl">
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed text-slate-400 md:text-lg">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Alerta — faixa entre hairlines */}
        <Reveal delay={120}>
          <div
            className="mt-20 border-y border-white/[0.08] py-12"
            style={{ background: 'radial-gradient(70% 140% at 50% 50%, rgba(220,80,40,0.06), transparent 75%)' }}
          >
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-start gap-5">
                <AlertCircle size={26} className="mt-1.5 shrink-0 text-orange-500" />
                <h3 className="max-w-3xl font-['Sora'] text-2xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
                  {section?.texts.alertTitle || 'Quem não entender essa nova jornada vai perder vendas.'}
                </h3>
              </div>
              <p className="v4-mono shrink-0 text-[10px] uppercase tracking-[0.3em] text-amber-500/80 md:text-right">
                {section?.texts.alertSubtitle || 'O cenário está evoluindo. Você está pronto?'}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Solução — painel "amanhecer" */}
        <Reveal delay={100}>
          <div className="relative mt-20 overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#0a0c12] p-10 md:p-14">
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
              style={{ background: 'radial-gradient(90% 100% at 50% 100%, rgba(251,191,36,0.10), transparent 70%)' }}
              aria-hidden
            />
            <GrainOverlay />
            <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <Kicker tone="dark">{section?.texts.solutionBadge || 'A Solução Definitiva'}</Kicker>
                <h3 className="mt-5 font-['Sora'] text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {section?.texts.solutionTitle || 'Ainda há tempo para reverter essa situação.'}
                </h3>
                <p className="mt-4 max-w-xl leading-relaxed text-slate-400">
                  {section?.texts.solutionDesc ||
                    'O Manual de Compra Solar Buy-Side mapeia os novos gatilhos de decisão do cliente moderno, garantindo que você esteja do lado certo da venda.'}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {checks.map((item) => (
                    <div key={item} className="rounded-full border border-white/10 px-4 py-2">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0 text-orange-500" />
                        <span className="text-sm font-semibold text-slate-200">{item}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 lg:col-span-2 lg:items-end">
                <Cta size="lg" onClick={() => scrollToId('oferta')}>
                  {section?.texts.ctaButton || 'Garantir meu acesso agora'}
                  <CtaArrow />
                </Cta>
                <p className="v4-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">
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
