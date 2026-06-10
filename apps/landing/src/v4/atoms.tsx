import React, { useEffect, useId, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

/* Átomos compartilhados da V4 "Solar Dawn" — reveal, tipografia expressiva,
   CTAs, marquee, selos. A copy nunca vive aqui: estes componentes só dão forma. */

/* ── Reveal por bloco ─────────────────────────────────────────────────── */
type RevealProps = React.HTMLAttributes<HTMLDivElement> & {
  delay?: number
  as?: 'div' | 'section' | 'header' | 'figure' | 'article' | 'li' | 'span' | 'p'
}

export const Reveal: React.FC<RevealProps> = ({
  delay = 0,
  as = 'div',
  className = '',
  style,
  children,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('in')
            io.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const Tag = as as React.ElementType
  return (
    <Tag
      ref={ref}
      className={`v4r ${className}`}
      style={{ ...style, ['--d' as string]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ── Reveal palavra-a-palavra (títulos hero/seções) ──────────────────── */
type WordRevealProps = {
  text: string
  className?: string
  wordClassName?: string
  baseDelay?: number
  step?: number
  as?: 'span' | 'div'
  /** 'load' anima na montagem (hero); 'scroll' espera entrar na viewport */
  trigger?: 'load' | 'scroll'
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  className = '',
  wordClassName = '',
  baseDelay = 0,
  step = 45,
  as = 'span',
  trigger = 'scroll',
}) => {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (trigger === 'load') {
      requestAnimationFrame(() => el.classList.add('go'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('go')
            io.disconnect()
          }
        })
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [trigger])

  const Tag = as as React.ElementType
  const words = text.split(/\s+/).filter(Boolean)

  return (
    <Tag ref={ref} className={`v4-words ${className}`}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className={`v4-word ${wordClassName}`} style={{ ['--wd' as string]: `${baseDelay + i * step}ms` }}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </Tag>
  )
}

/* ── Kicker (etiqueta mono de seção) ─────────────────────────────────── */
export const Kicker: React.FC<{ children: React.ReactNode; tone?: 'light' | 'dark' | 'paper'; className?: string }> = ({
  children,
  tone = 'dark',
  className = '',
}) => (
  <span
    className={`v4-kicker ${
      tone === 'dark' ? 'text-orange-400' : tone === 'paper' ? 'text-orange-700' : 'text-orange-600'
    } ${className}`}
  >
    {children}
  </span>
)

/* ── CTAs ────────────────────────────────────────────────────────────── */
type CtaProps = {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  target?: string
  rel?: string
  size?: 'md' | 'lg'
  variant?: 'solid' | 'ghost-dark' | 'ghost-paper'
  className?: string
}

export const Cta: React.FC<CtaProps> = ({
  children,
  onClick,
  href,
  target,
  rel,
  size = 'md',
  variant = 'solid',
  className = '',
}) => {
  const base =
    'group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-bold tracking-tight transition-all duration-300 active:scale-[0.97]'
  const sizes = size === 'lg' ? 'px-10 py-5 text-base md:text-lg' : 'px-7 py-4 text-sm md:text-base'
  const variants = {
    /* Shimmer (v4-cta-shine) é exclusivo do CTA do preço: efeito raro = efeito forte. */
    solid:
      'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0_14px_36px_-10px_rgba(249,115,22,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_20px_48px_-10px_rgba(249,115,22,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5',
    'ghost-dark':
      'border border-white/15 bg-white/[0.04] text-slate-200 backdrop-blur-sm hover:border-orange-400/50 hover:text-white hover:bg-white/[0.07]',
    'ghost-paper':
      'border border-[#181410]/25 bg-transparent text-[#181410] hover:border-orange-600/60 hover:text-orange-700',
  }
  const cls = `${base} ${sizes} ${variants[variant]} ${className}`

  if (href) {
    return (
      <a href={href} target={target} rel={rel} onClick={onClick} className={cls}>
        <span className="relative z-10 flex items-center gap-3">{children}</span>
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </button>
  )
}

export const CtaArrow: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <ArrowRight size={size} className="transition-transform duration-300 group-hover:translate-x-1" />
)

/* ── Marquee da marca (banda entre atos) ─────────────────────────────── */
type MarqueeProps = {
  children: React.ReactNode
  speed?: number
  reverse?: boolean
  className?: string
}

export const Marquee: React.FC<MarqueeProps> = ({ children, speed = 36, reverse = false, className = '' }) => (
  <div className={`v4-marquee ${reverse ? 'reverse' : ''} ${className}`} aria-hidden>
    {[0, 1].map((i) => (
      <div key={i} className="v4-marquee-track" style={{ ['--mq-speed' as string]: `${speed}s` }}>
        {children}
      </div>
    ))}
  </div>
)

/* ── Selo circular girando (texto em círculo via SVG) ────────────────── */
type StampProps = {
  text: string
  children?: React.ReactNode
  size?: number
  tone?: 'ink' | 'orange'
  className?: string
}

export const Stamp: React.FC<StampProps> = ({ text, children, size = 130, tone = 'ink', className = '' }) => {
  const id = useId().replace(/[:]/g, '')
  const ring = `${text.toUpperCase()} • `.repeat(4)
  const color = tone === 'ink' ? '#181410' : '#f97316'
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="v4-spin-slower absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id={`stamp-${id}`} d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 3" />
        <text fontSize="9.2" fontFamily="'JetBrains Mono', monospace" fontWeight="700" letterSpacing="1.5" fill={color}>
          <textPath href={`#stamp-${id}`}>{ring}</textPath>
        </text>
      </svg>
      <div className="relative z-10 text-center">{children}</div>
    </div>
  )
}

/* ── Grain overlay ───────────────────────────────────────────────────── */
export const GrainOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.028 }) => (
  <div className="v4-noise pointer-events-none absolute inset-0" style={{ opacity }} aria-hidden />
)

/* ── Células fotovoltaicas: grade sutil de "painel solar" no fundo ────── */
export const SolarCells: React.FC<{ className?: string; fade?: 'top' | 'center' | 'bottom' }> = ({
  className = '',
  fade = 'top',
}) => {
  const mask =
    fade === 'center'
      ? 'radial-gradient(70% 60% at 50% 50%, black, transparent 80%)'
      : fade === 'bottom'
        ? 'linear-gradient(0deg, black, transparent 75%)'
        : 'radial-gradient(120% 80% at 50% 0%, black, transparent 78%)'
  return (
    <div
      className={`v4-cells pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ WebkitMaskImage: mask, maskImage: mask }}
      aria-hidden
    />
  )
}

/* ── Fundo escuro técnico (compat + grain) ───────────────────────────── */
export const DarkBackdrop: React.FC<{ orbs?: 'orange' | 'blue' | 'dual' }> = ({ orbs = 'dual' }) => (
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    {(orbs === 'orange' || orbs === 'dual') && (
      <div className="absolute -top-[15%] right-[-8%] h-[480px] w-[480px] rounded-full bg-orange-500/[0.06] blur-[130px]" />
    )}
    {(orbs === 'blue' || orbs === 'dual') && (
      <div className="absolute bottom-[-12%] left-[-8%] h-[420px] w-[420px] rounded-full bg-blue-600/[0.06] blur-[130px]" />
    )}
    <GrainOverlay />
  </div>
)
