import React, { useRef } from 'react'
import { BookOpen, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow } from './atoms'
import { scrollToId } from './scroll'

export const HeroV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('hero')
  const tiltRef = useRef<HTMLDivElement | null>(null)

  const titlePrefix = section?.texts.titlePrefix || section?.texts.title1 || 'Saia da Disputa de Preço e Passe a'
  const titleHighlight = section?.texts.titleHighlight || section?.texts.title2 || 'Vender Decisões'
  const titleSuffix = section?.texts.titleSuffix || 'em Sistema Solar'
  const subtitle =
    section?.texts.subtitle ||
    `${section?.texts.subtitle1 || 'O método Buy-Side ensina você a pensar como o cliente e conduzir decisões de compra, não disputas de preço.'} ${section?.texts.subtitle2 || ''}`.trim()
  const manualTitle = section?.texts.manualTitle || 'Manual Solar Buy-Side'
  const manualSubtitle =
    section?.texts.manualSubtitle || 'Construído a partir da observação real de como compradores decidem, na prática.'
  const bonusBadge = section?.texts.bonusBadge || 'Bônus Exclusivo'
  const bonusTitle = section?.texts.bonusTitle || 'O Código do Vendedor Consultivo'
  const bonusSubtitle = section?.texts.bonusSubtitle || 'Para quem quer conduzir decisões, não concessões.'
  const ctaButton = section?.texts.ctaButton || 'Quero vender decisões agora'
  const ctaSubtext = section?.texts.ctaSubtext || 'Acesso imediato ao Manual Solar Buy-Side.'
  const scrollHint = section?.texts.scrollHint || 'Entenda a lógica'
  const heroImage = section?.images.heroImage || '/assets/img-hero-solar.png'

  const isDefaultSubtitle = !subtitle || subtitle.startsWith('O método Buy-Side')
  const isDefaultManualTitle = !manualTitle || manualTitle === 'Manual Solar Buy-Side'

  const handleTilt = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(1100px) rotateY(${x * 5}deg) rotateX(${y * -5}deg)`
  }

  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)'
  }

  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#030712]">
      {/* Camadas de atmosfera */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #081226 0%, #060e1f 38%, #040a18 68%, #030712 100%)',
          }}
        />
        <div
          className="v4-aurora absolute left-[8%] top-[-22%] h-[58vw] w-[58vw] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.16), transparent 65%)' }}
        />
        <div
          className="v4-aurora-slow absolute right-[-14%] top-[28%] h-[44vw] w-[44vw] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 65%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 72% 60% at 50% 42%, black 25%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 72% 60% at 50% 42%, black 25%, transparent 100%)',
          }}
        />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#030712]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-32 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-36">
        {/* Coluna de texto */}
        <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
          <h1
            className="v4-rise text-[2.35rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]"
            style={{ ['--d' as string]: '80ms' }}
          >
            {titlePrefix} <span className="v4-grad-text whitespace-pre-wrap">{titleHighlight}</span>{' '}
            <span className="text-slate-300">{titleSuffix}</span>
          </h1>

          <p
            className="v4-rise mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
            style={{ ['--d' as string]: '200ms' }}
          >
            {!isDefaultSubtitle ? (
              subtitle
            ) : (
              <>
                O método <strong className="font-semibold text-slate-100">Buy-Side</strong> ensina você a pensar como o
                cliente e conduzir decisões de compra, não disputas de preço.
              </>
            )}
          </p>

          {/* Cartão do manual */}
          <div className="v4-rise mt-8 w-full max-w-xl" style={{ ['--d' as string]: '320ms' }}>
            <div className="group relative flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4 backdrop-blur-md transition-all duration-500 hover:border-orange-400/40 hover:bg-white/[0.06]">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/[0.08] to-orange-500/0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-[0_10px_24px_-8px_rgba(249,115,22,0.8)]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="relative min-w-0 text-left">
                <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                  {!isDefaultManualTitle ? (
                    manualTitle
                  ) : (
                    <>
                      Manual Solar <span className="text-orange-400">Buy-Side</span>
                    </>
                  )}
                </h2>
                <p className="mt-0.5 text-xs leading-snug text-slate-400 sm:text-sm">{manualSubtitle}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            className="v4-rise mt-9 flex w-full max-w-xl flex-col items-center gap-4 sm:flex-row lg:items-center"
            style={{ ['--d' as string]: '440ms' }}
          >
            <Cta size="lg" onClick={() => scrollToId('oferta')} className="w-full sm:w-auto">
              {ctaButton}
              <CtaArrow />
            </Cta>
          </div>

          <p
            className="v4-rise mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500"
            style={{ ['--d' as string]: '540ms' }}
          >
            <CheckCircle2 size={14} className="text-emerald-500" />
            {ctaSubtext}
          </p>

          {/* Scroll hint no mobile (no desktop ele vive no rodapé do hero) */}
          <button
            onClick={() => scrollToId('contexto')}
            type="button"
            className="v4-rise group mt-8 flex flex-col items-center gap-2 self-center text-slate-500 transition-colors hover:text-orange-400 lg:hidden"
            style={{ ['--d' as string]: '620ms' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{scrollHint}</span>
            <ChevronDown size={16} className="animate-bounce" />
          </button>
        </div>

        {/* Coluna visual */}
        <div className="relative lg:col-span-6">
          <div
            className="v4-rise relative mx-auto max-w-[560px]"
            style={{ ['--d' as string]: '300ms' }}
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            <div
              className="absolute left-1/2 top-1/2 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
              style={{
                background:
                  'radial-gradient(circle at 35% 35%, rgba(37,99,235,0.22), transparent 60%), radial-gradient(circle at 70% 70%, rgba(249,115,22,0.2), transparent 60%)',
              }}
              aria-hidden
            />

            <div ref={tiltRef} className="v4-tilt relative">
              <div className="absolute -inset-[1.5px] rounded-[26px] bg-gradient-to-br from-orange-500/60 via-white/10 to-blue-600/50 opacity-70" aria-hidden />
              <figure className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#030712] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
                <img
                  src={heroImage}
                  alt="Consultoria Solar Executiva"
                  className="h-auto w-full object-cover"
                  style={{ aspectRatio: '1/1', objectPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/70 via-transparent to-[#030712]/20" aria-hidden />
                <div
                  className="absolute inset-0 opacity-40"
                  style={{ background: 'linear-gradient(120deg, transparent 55%, rgba(255,255,255,0.06) 70%, transparent 85%)' }}
                  aria-hidden
                />
              </figure>

              {/* Card de bônus flutuante */}
              <div className="v4-float absolute -bottom-7 -left-4 z-20 w-[290px] max-w-[82vw] rounded-2xl border border-orange-500/30 bg-[#0a1122]/95 p-5 text-left shadow-[0_28px_70px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:-left-8">
                <div className="mb-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2 items-center justify-center rounded-full bg-orange-500 text-orange-500">
                    <span className="v4-dot absolute inset-0 rounded-full" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-orange-400">
                    <Sparkles className="h-3.5 w-3.5 fill-orange-400" />
                    {bonusBadge}
                  </span>
                </div>
                <h3 className="text-base font-bold leading-tight text-white">{bonusTitle}</h3>
                <p className="mt-1.5 text-xs leading-snug text-slate-400">{bonusSubtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <button
        onClick={() => scrollToId('contexto')}
        type="button"
        aria-label={scrollHint}
        className="group absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2.5 lg:flex"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 transition-colors group-hover:text-orange-400">
          {scrollHint}
        </span>
        <span className="block h-9 w-px overflow-hidden bg-white/10">
          <span className="v4-drip block h-full w-full bg-gradient-to-b from-orange-500 to-transparent" />
        </span>
      </button>
    </section>
  )
}
