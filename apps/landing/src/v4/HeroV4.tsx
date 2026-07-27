import React, { useEffect, useRef } from 'react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { WordReveal } from './atoms'
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
  // Subfrase única do Hero (Francis, slide 2). O texto antigo ("O método
  // Buy-Side ensina você a pensar como o cliente...") é tratado como legado:
  // se o banco ainda tiver ele, cai no novo. Assim a LP não depende do seed
  // para mostrar a frase certa.
  const subtitleCms = section?.texts.subtitle || section?.texts.subtitle1 || ''
  const subtitle = !subtitleCms || subtitleCms.startsWith('O método Buy-Side')
    ? 'O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do <span class="cms-semibold">comprador</span>'
    : subtitleCms

  // Quebra no dois-pontos: a chamada em cima e "pela perspectiva do comprador"
  // inteiro na linha de baixo. Sem isso o "pela" ficava órfão na 1ª linha.
  const [subLead, subVirada] = (() => {
    const i = subtitle.indexOf(':')
    if (i === -1) return [subtitle, '']
    return [subtitle.slice(0, i + 1).trim(), subtitle.slice(i + 1).trim()]
  })()
  const manualTitle = section?.texts.manualTitle || 'Manual Solar Buy-Side'
  const scrollHint = section?.texts.scrollHint || 'Veja o panorama 2026'

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
        {/* grade de células no "chão": mesma textura (cor/escala) da seção
            seguinte e visível até a borda inferior — o panorama continua dela */}
        <div
          className="v4-cells absolute inset-x-0 bottom-0 h-[30%]"
          style={{
            maskImage: 'linear-gradient(180deg, transparent, black 55%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent, black 55%)',
          }}
        />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-28 pt-28 text-center md:pb-[22vh]">
        {/* chip do produto */}
        <div className="v4-rise mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-3 pr-5 backdrop-blur-sm" style={{ ['--d' as string]: '0ms' }}>
          <span className="h-2 w-2 rotate-45 rounded-[1px] bg-gradient-to-br from-orange-400 to-orange-600" aria-hidden />
          <span className="v4-mono text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">{manualTitle}</span>
        </div>

        {/* headline massiva */}
        {/* clamp: mobile 44px (era 40) e desktop 81.6px (era 89.6) — ajuste do
            Gabriel 27/07: headline menor no desktop, maior no celular. */}
        <h1 className="max-w-5xl text-[clamp(2.75rem,6.6vw,5.1rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
          <WordReveal trigger="load" text={titlePrefix} baseDelay={80} step={40} />{' '}
          <WordReveal
            trigger="load"
            text={titleHighlight}
            baseDelay={340}
            step={55}
            wordClassName="v4-serif v4-grad-text pr-[0.06em]"
          />{' '}
          <WordReveal trigger="load" text={titleSuffix} baseDelay={470} step={40} wordClassName="text-white" />
        </h1>

        {/* Subfrase. Respiro grande entre ela e a headline: o Francis pediu a
            seção "limpa e com espaço entre cada frase" (slide 2). */}
        <p
          className="v4-rise mt-12 max-w-3xl text-lg leading-relaxed text-slate-200 sm:text-xl md:mt-[60px] md:text-2xl"
          style={{ ['--d' as string]: '560ms' }}
        >
          <CMSText value={subLead} />
          {subVirada && (
            <span className="mt-1.5 block">
              <CMSText value={subVirada} />
            </span>
          )}
        </p>

        {/* CTA principal e o "ticket" com as capas do Manual e do Código foram
            removidos (Francis, slide 2 + confirmacao do Gabriel 2026-07-26): o
            Hero fica so com a headline e a subfrase. O primeiro botao da pagina
            passa a ser o CTA 1, no fim da secao de Autores. */}
      </div>

      {/* scroll hint sobre o horizonte */}
      <button
        onClick={() => scrollToId('contexto')}
        type="button"
        aria-label={scrollHint}
        className="group absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        {/* Texto "Veja o panorama 2026" removido (Francis, slide 1). O botão
            segue existindo só como indicador de rolagem; scrollHint continua
            no aria-label para leitor de tela. */}
        <span className="block h-10 w-px overflow-hidden bg-white/10">
          <span className="v4-drip block h-full w-full bg-gradient-to-b from-orange-400 to-transparent" />
        </span>
      </button>
    </section>
  )
}
