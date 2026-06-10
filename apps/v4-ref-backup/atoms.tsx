import React, { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

/* Átomos compartilhados da V4 — reveal on scroll, kickers, títulos e CTAs.
   A copy nunca vive aqui: estes componentes só dão forma. */

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
      { threshold: 0.15, rootMargin: '0px 0px -36px 0px' }
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

export const Kicker: React.FC<{ children: React.ReactNode; tone?: 'light' | 'dark'; className?: string }> = ({
  children,
  tone = 'dark',
  className = '',
}) => (
  <span
    className={`v4-kicker ${tone === 'dark' ? 'text-orange-400' : 'text-orange-600'} ${className}`}
  >
    {children}
  </span>
)

type CtaProps = {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  target?: string
  rel?: string
  size?: 'md' | 'lg'
  variant?: 'solid' | 'ghost-dark' | 'ghost-light'
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
    'group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl font-bold tracking-tight transition-all duration-300 active:scale-[0.97]'
  const sizes = size === 'lg' ? 'px-9 py-5 text-base md:text-lg' : 'px-7 py-4 text-sm md:text-base'
  const variants = {
    solid:
      'v4-cta-shine bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0_14px_36px_-10px_rgba(249,115,22,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_20px_48px_-10px_rgba(249,115,22,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5',
    'ghost-dark':
      'border border-white/15 bg-white/[0.04] text-slate-200 backdrop-blur-sm hover:border-orange-400/50 hover:text-white hover:bg-white/[0.07]',
    'ghost-light':
      'border border-slate-300 bg-white text-slate-800 hover:border-orange-500/60 hover:text-orange-600 shadow-sm',
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

/* Fundo técnico reutilizável das seções escuras: grade + orbes. */
export const DarkBackdrop: React.FC<{ orbs?: 'orange' | 'blue' | 'dual' }> = ({ orbs = 'dual' }) => (
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 25%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 40%, black 25%, transparent 100%)',
      }}
    />
    {(orbs === 'orange' || orbs === 'dual') && (
      <div className="absolute -top-[15%] right-[-8%] h-[480px] w-[480px] rounded-full bg-orange-500/[0.07] blur-[130px]" />
    )}
    {(orbs === 'blue' || orbs === 'dual') && (
      <div className="absolute bottom-[-12%] left-[-8%] h-[420px] w-[420px] rounded-full bg-blue-600/[0.08] blur-[130px]" />
    )}
    <div className="v4-noise absolute inset-0 opacity-[0.025]" />
  </div>
)
