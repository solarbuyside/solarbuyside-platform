import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { trackBuyClick } from '../utils/analytics'
import { Img } from './atoms'
import { criarTxt } from './cms'

/* Na MESMA ordem em que as seções aparecem na página (ver SECTION_IDS no
   AppV4). Um menu fora de ordem faz o visitante rolar para trás no meio da
   navegação, e o indicador de progresso do topo anda ao contrário.

   Reordenado em 06/08 junto com a página: Mentores subiu para antes do
   Panorama. E "Para Quem" deixou de apontar para `#audiencia`, que não existe
   mais (a seção foi eliminada, slide 11): a resposta agora vive no fim da
   Transformação, em três linhas (slide 15). Sem essa troca o item viraria um
   link morto no menu. */
const NAV_ITEMS = [
  { href: '#plataforma', label: 'Plataforma' },
  { href: '#autor', label: 'Mentor' },
  { href: '#contexto', label: 'Panorama' },
  { href: '#video-section', label: 'Vídeo' },
  { href: '#transformacao', label: 'Para Quem' },
  { href: '#faq', label: 'FAQ' },
]

export const HeaderV4: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const { globalAssets } = useContent()

  useEffect(() => {
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${ratio})`
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-[#07090d]/80 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <a href="#hero" className="flex items-center gap-3">
          <Img
            src={globalAssets.logo || '/assets/LOGOSOLARBUYSIDE3.png'}
            alt="Solar Buy-Side"
            className="h-11 w-auto sm:h-12"
            onError={(e) => {
              e.currentTarget.src = '/assets/LOGOSOLARBUYSIDE3.png'
            }}
          />
          <span className="flex items-baseline gap-1 whitespace-nowrap text-base font-bold tracking-tight sm:text-lg">
            <span className="text-white">Solar</span>
            <span className="text-orange-500">Buy-Side</span>
          </span>
        </a>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative rounded-full px-4 py-2 text-sm font-semibold text-slate-400 transition-colors duration-300 hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-orange-500 transition-transform duration-300 group-hover:scale-100" />
            </a>
          ))}
          <a
            href="#oferta"
            className="group ml-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(249,115,22,0.8)]"
          >
            Garantir Acesso
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </nav>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="v4-mobile-menu"
          aria-label="Abrir menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        ref={progressRef}
        className="v4-progress h-px w-full scale-x-0 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300"
      />

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div
        id="v4-mobile-menu"
        className={`fixed left-4 right-4 top-[4.5rem] z-50 rounded-3xl border border-white/10 bg-[#0a0c12]/95 shadow-2xl backdrop-blur-xl transition-all duration-300 md:hidden ${
          isMenuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-3 text-base font-semibold text-slate-200 transition-colors hover:bg-white/[0.06] hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#oferta"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg"
            onClick={() => setIsMenuOpen(false)}
          >
            Garantir Acesso
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}

const BLOCKING_SELECTORS = ['#oferta', '#faq', '#contact', 'footer']

/* Visibilidade compartilhada dos CTAs persistentes: aparece depois do hero,
   some quando uma seção de conversão/encerramento já está na viewport. */
const useCtaVisibility = (breakpoint: 'mobile' | 'desktop') => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let rafId = 0

    const shouldShow = () => {
      const isDesktop = window.innerWidth >= 768
      if (breakpoint === 'desktop' ? !isDesktop : isDesktop) return false
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
  }, [breakpoint])

  return isVisible
}

export const FloatingCTAV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('pricing')
  const txt = criarTxt(section)
  const isVisible = useCtaVisibility('desktop')

  return (
    <a
      href="#oferta"
      onClick={(e) => {
        trackBuyClick()
        const target = document.getElementById('oferta')
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }}
      /* Menor no desktop desde 06/08 (Francis, slide 1: "formato computador:
         reduzir o tamanho do CTA flutuante"). A pastilha ocupava 330px de
         largura e ~68px de altura no canto de toda a rolagem; agora vai a
         268px e ~54px. Encolheu a moldura e a tipografia, não o alvo de
         clique, que continua confortável. */
      className={`fixed bottom-5 right-5 z-40 hidden max-w-[268px] items-center gap-3 rounded-full border border-white/10 bg-[#0a0c12]/95 py-2 pl-2 pr-5 text-slate-50 shadow-[0_20px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-500 md:flex ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
      }`}
      aria-hidden={!isVisible}
      // Sem o tabIndex, o link continuava alcançável pelo Tab enquanto estava
      // escondido — foco indo para um elemento invisível. É o que o Lighthouse
      // reportava como "aria-hidden element must not be focusable".
      tabIndex={isVisible ? undefined : -1}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-orange-500 to-orange-600 shadow-[0_8px_20px_-6px_rgba(249,115,22,0.7)]">
        <ArrowRight size={16} />
      </span>
      <span className="min-w-0">
        <span className="v4-mono block text-[8px] font-bold uppercase tracking-[0.2em] text-orange-300">
          Manual Solar Buy-Side
        </span>
        <span className="block text-[13px] font-extrabold leading-tight text-slate-50">
          {txt('ctaButton', 'Garantir meu acesso agora')}
        </span>
      </span>
    </a>
  )
}

/* A barra de conversão fixa do mobile (preço parcelado + "Garantir acesso")
   foi REMOVIDA em 30/07 a pedido do Francis: "elimina o preço, no formato
   celular"; perguntado se era só o preço ou o botão também, respondeu "os 2".
   O componente saiu inteiro em vez de virar prop desligada — está no histórico
   do git se ele voltar atrás. O `useCtaVisibility` continua recebendo o
   breakpoint por isso: hoje só o CTA flutuante do desktop o usa. */
