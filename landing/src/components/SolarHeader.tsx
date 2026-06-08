import React, { useEffect, useState } from 'react'
import { ArrowRight, Menu } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

export const SolarHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { globalAssets } = useContent()

  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-3 flex-nowrap">
          <img src={globalAssets.logo || '/assets/LOGOSOLARBUYSIDE3.png'} alt="Solar Buy-Side" className="h-14 sm:h-16 w-auto flex-shrink-0" onError={(e) => { e.currentTarget.src = '/assets/LOGOSOLARBUYSIDE3.png' }} />
          <div className="flex items-baseline gap-1 leading-tight whitespace-nowrap">
            <span className="text-white text-lg sm:text-xl font-bold tracking-tight typing-animation-solar" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Solar
            </span>
            <span className="text-[#F97316] text-lg sm:text-xl font-bold tracking-tight typing-animation-buyside" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Buy-Side
            </span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#contexto" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Panorama
          </a>
          <a href="#video-section" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Vídeo
          </a>
          <a href="#audiencia" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Para Quem
          </a>
          <a href="#autor" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Mentor
          </a>
          <a href="#faq" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            FAQ
          </a>
          <a
            href="#oferta"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-sm text-sm font-bold transition-all border border-white/20"
          >
            Garantir Acesso
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <button
          className="md:hidden text-white"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
      <div
        id="mobile-menu"
        className={`md:hidden fixed top-20 left-4 right-4 z-50 rounded-3xl border border-white/10 bg-[#020617]/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="p-6 flex flex-col gap-4">
          {[
            { href: '#contexto', label: 'Panorama' },
            { href: '#video-section', label: 'Vídeo' },
            { href: '#audiencia', label: 'Para Quem' },
            { href: '#autor', label: 'Mentor' },
            { href: '#faq', label: 'FAQ' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-base font-semibold text-slate-200 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#oferta"
            className="mt-2 inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all border border-white/20"
            onClick={() => setIsMenuOpen(false)}
          >
            Garantir Acesso
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
