import React, { useEffect, useRef } from 'react'
import { BookOpen, CheckCircle2, Sparkles } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow, WordReveal } from './atoms'
import { scrollToId } from './scroll'

/* HERO "SOLAR DAWN" — sem foto stock, sem card 3D. Um horizonte solar
   gráfico: disco gigante com aresta incandescente, raios cônicos lentos,
   campo azul à esquerda (comprador) e âmbar à direita (vendedor).
   Headline massiva com reveal palavra-a-palavra; destaque em serif itálica.
   O manual + bônus viram um "ticket de acesso" com picote central. */

export const HeroV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('hero')
  const glowRef = useRef<HTMLDivElement | null>(null)

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

  const isDefaultSubtitle = !subtitle || subtitle.startsWith('O método Buy-Side')
  const isDefaultManualTitle = !manualTitle || manualTitle === 'Manual Solar Buy-Side'

  /* Parallax sutil do brilho solar seguindo o mouse (desligado p/ reduced motion) */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let rafId = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 26
        const y = (e.clientY / window.innerHeight - 0.5) * 14
        if (glowRef.current) glowRef.current.style.transform = `translate(${x}px, ${y}px)`
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      {/* ── Céu ───────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* gradiente vertical da noite */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #0c1422 0%, #090d16 45%, #07090d 100%)' }}
        />
        {/* dualidade: campo azul (comprador) à esquerda, âmbar (vendedor) à direita */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 60% at 8% 75%, rgba(59,130,246,0.13), transparent 70%), radial-gradient(55% 60% at 92% 75%, rgba(249,115,22,0.13), transparent 70%)',
          }}
        />
        {/* brilho central do amanhecer (com parallax) */}
        <div ref={glowRef} className="absolute inset-0 will-change-transform">
          <div
            className="absolute left-1/2 top-[74%] h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                'radial-gradient(circle at 50% 62%, rgba(253,186,116,0.32) 0%, rgba(249,115,22,0.16) 22%, transparent 52%)',
            }}
          />
        </div>
        {/* raios cônicos girando muito devagar */}
        <div className="v4-rays absolute left-1/2 top-[80%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.10]" />
        {/* o disco solar: silhueta gigante com aresta incandescente */}
        <div
          className="absolute left-1/2 top-[80%] h-[260vmax] w-[260vmax] -translate-x-1/2 rounded-full bg-[#07090d]"
          style={{
            boxShadow:
              '0 -1px 0 0 rgba(255,221,180,0.95), 0 -3px 18px 0 rgba(253,186,116,0.65), 0 -14px 70px 4px rgba(249,115,22,0.4), 0 -40px 180px 20px rgba(249,115,22,0.18)',
          }}
        />
        {/* grade técnica só no "chão", abaixo do horizonte */}
        <div
          className="absolute inset-x-0 bottom-0 h-[28%] opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'linear-gradient(180deg, transparent, black 40%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent, black 40%)',
          }}
        />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-[16vh] pt-28 text-center md:pb-[18vh]">
        {/* chip do produto */}
        <div className="v4-rise mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-3 pr-5 backdrop-blur-sm" style={{ ['--d' as string]: '60ms' }}>
          <span className="relative flex h-2 w-2 items-center justify-center rounded-full bg-orange-500 text-orange-500">
            <span className="v4-dot absolute inset-0 rounded-full" />
          </span>
          <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">{manualTitle}</span>
        </div>

        {/* headline massiva */}
        <h1 className="max-w-5xl text-[clamp(2.5rem,6.6vw,5.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
          <WordReveal trigger="load" text={titlePrefix} baseDelay={150} step={50} />{' '}
          <WordReveal
            trigger="load"
            text={titleHighlight}
            baseDelay={520}
            step={70}
            wordClassName="v4-serif v4-grad-text pr-[0.06em]"
          />{' '}
          <WordReveal trigger="load" text={titleSuffix} baseDelay={700} step={50} wordClassName="text-slate-400/90" />
        </h1>

        {/* subtítulo */}
        <p className="v4-rise mt-7 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg md:text-xl" style={{ ['--d' as string]: '900ms' }}>
          {!isDefaultSubtitle ? (
            subtitle
          ) : (
            <>
              O método <strong className="font-semibold text-slate-100">Buy-Side</strong> ensina você a pensar como o
              cliente e conduzir decisões de compra, não disputas de preço.
            </>
          )}
        </p>

        {/* CTA */}
        <div className="v4-rise mt-10" style={{ ['--d' as string]: '1050ms' }}>
          <Cta size="lg" onClick={() => scrollToId('oferta')}>
            {ctaButton}
            <CtaArrow />
          </Cta>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <CheckCircle2 size={14} className="text-emerald-500" />
            {ctaSubtext}
          </p>
        </div>

        {/* ticket de acesso: manual + bônus com picote central */}
        <div className="v4-rise mt-12 w-full max-w-3xl" style={{ ['--d' as string]: '1200ms' }}>
          <div className="relative grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-md md:grid-cols-[1.15fr_1fr]">
            {/* lado A — o manual */}
            <div className="flex items-center gap-4 p-6 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-[0_10px_24px_-8px_rgba(249,115,22,0.8)]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold tracking-tight text-white">
                  {!isDefaultManualTitle ? (
                    manualTitle
                  ) : (
                    <>
                      Manual Solar <span className="text-orange-400">Buy-Side</span>
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs leading-snug text-slate-400">{manualSubtitle}</p>
              </div>
            </div>

            {/* picote do ticket */}
            <div className="pointer-events-none absolute inset-x-6 top-1/2 border-t border-dashed border-white/15 md:inset-x-auto md:inset-y-6 md:left-[53.5%] md:border-l md:border-t-0" aria-hidden />
            <span className="pointer-events-none absolute -left-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-[#07090d] md:left-[53.5%] md:-top-2 md:block md:-translate-x-1/2 md:translate-y-0" aria-hidden />
            <span className="pointer-events-none absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-[#07090d] md:-bottom-2 md:left-[53.5%] md:right-auto md:top-auto md:block md:-translate-x-1/2" aria-hidden />

            {/* lado B — o bônus */}
            <div className="flex flex-col justify-center gap-1 border-t border-dashed border-white/15 p-6 text-left md:border-t-0">
              <span className="v4-mono inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.28em] text-orange-400">
                <Sparkles className="h-3 w-3 fill-orange-400" />
                {bonusBadge}
              </span>
              <p className="text-sm font-bold leading-tight text-white">{bonusTitle}</p>
              <p className="text-xs leading-snug text-slate-500">{bonusSubtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* scroll hint sobre o horizonte */}
      <button
        onClick={() => scrollToId('contexto')}
        type="button"
        aria-label={scrollHint}
        className="group absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="v4-mono text-[9px] font-bold uppercase tracking-[0.4em] text-slate-500 transition-colors group-hover:text-orange-400">
          {scrollHint}
        </span>
        <span className="block h-10 w-px overflow-hidden bg-white/10">
          <span className="v4-drip block h-full w-full bg-gradient-to-b from-orange-400 to-transparent" />
        </span>
      </button>
    </section>
  )
}
