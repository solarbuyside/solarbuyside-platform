import React, { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { trackBuyClick } from '../utils/analytics'

const BLOCKING_SELECTORS = ['#oferta', '#oferta-final', '#faq', '#contact', 'footer']

export const FloatingCTA: React.FC = () => {
  const { getSection, globalSettings } = useContent()
  const section = getSection('pricing')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let rafId = 0

    const shouldShow = () => {
      if (window.innerWidth < 768) return false

      const hero = document.getElementById('hero')
      if (hero) {
        const heroRect = hero.getBoundingClientRect()
        if (heroRect.bottom > window.innerHeight * 0.35) return false
      }

      return !BLOCKING_SELECTORS.some((selector) => {
        const element = document.querySelector(selector)
        if (!element) return false
        const rect = element.getBoundingClientRect()
        return rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.15
      })
    }

    const updateVisibility = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => setIsVisible(shouldShow()))
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [])

  return (
    <a
      href={globalSettings.purchaseLink || '#oferta'}
      target={globalSettings.purchaseLink ? '_blank' : undefined}
      rel={globalSettings.purchaseLink ? 'noopener noreferrer' : undefined}
      onClick={trackBuyClick}
      className={`fixed bottom-6 right-6 z-40 hidden max-w-[320px] items-center gap-4 rounded-2xl border border-slate-700/80 bg-slate-950/95 px-4 py-3 text-slate-50 shadow-2xl shadow-slate-950/35 backdrop-blur-xl transition-all duration-300 md:flex ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
      aria-hidden={!isVisible}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-600 shadow-lg shadow-orange-600/30">
        <ArrowRight size={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-black uppercase tracking-[0.18em] text-orange-300">
          Manual Solar Buy-Side
        </span>
        <span className="block text-sm font-black leading-tight text-slate-50">
          {section?.texts.ctaButton || 'ACESSAR O MANUAL AGORA'}
        </span>
      </span>
    </a>
  )
}
