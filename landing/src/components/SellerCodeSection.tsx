import React, { useEffect, useRef, useState } from 'react'
import { ShieldCheck, Target, UserCheck, Settings2, Sparkles, ArrowRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

export const SellerCodeSection: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const stickyContainerRef = useRef<HTMLDivElement | null>(null)
  const { getSection } = useContent()
  const section = getSection('seller-code')

  const contentItems = [
    {
      title: section?.texts.item1Title || 'Índice de Confiabilidade',
      desc: section?.texts.item1Desc || 'Aprenda a medir e provar a segurança da sua proposta de forma estruturada e profissional.',
      icon: <ShieldCheck size={20} />,
    },
    {
      title: section?.texts.item2Title || 'Ajuste de Precisão com Checklist',
      desc: section?.texts.item2Desc || 'Refine seus materiais de vendas com base no que compradores realmente avaliam (e o que eles descartam).',
      icon: <Settings2 size={20} />,
    },
    {
      title: section?.texts.item3Title || 'Estratégia Anti-Leilão',
      desc: section?.texts.item3Desc || 'Saiba exatamente como agir com clientes focados apenas em preço e recupere sua margem de lucro.',
      icon: <Target size={20} />,
    },
    {
      title: section?.texts.item4Title || 'Postura Consultiva de Elite',
      desc: section?.texts.item4Desc || 'Não dispute por preço, dispute por valor. Ajude o cliente a decidir com segurança e fortaleça uma relação de longo prazo.',
      icon: <UserCheck size={20} />,
    },
  ]

  useEffect(() => {
    const stickyEl = stickyRef.current
    const containerEl = stickyContainerRef.current
    if (!stickyEl || !containerEl) return

    const topOffset = 140
    let rafId = 0

    const update = () => {
      const isDesktop = window.innerWidth >= 1024
      if (!isDesktop) {
        stickyEl.style.position = 'relative'
        stickyEl.style.top = '0'
        stickyEl.style.left = '0'
        stickyEl.style.right = 'auto'
        stickyEl.style.width = 'auto'
        return
      }
      if (!stickyEl || !containerEl) return
      const containerRect = containerEl.getBoundingClientRect()
      const containerTop = window.scrollY + containerRect.top
      const containerHeight = containerEl.offsetHeight
      const stickyHeight = stickyEl.offsetHeight
      const start = containerTop - topOffset
      const end = containerTop + containerHeight - stickyHeight - topOffset
      const scrollY = window.scrollY

      if (scrollY < start) {
        stickyEl.style.position = 'absolute'
        stickyEl.style.top = '0'
        stickyEl.style.left = '0'
        stickyEl.style.right = 'auto'
        stickyEl.style.width = '100%'
      } else if (scrollY > end) {
        stickyEl.style.position = 'absolute'
        stickyEl.style.top = `${containerHeight - stickyHeight}px`
        stickyEl.style.left = '0'
        stickyEl.style.right = 'auto'
        stickyEl.style.width = '100%'
      } else {
        stickyEl.style.position = 'fixed'
        stickyEl.style.top = `${topOffset}px`
        stickyEl.style.left = `${containerRect.left}px`
        stickyEl.style.right = 'auto'
        stickyEl.style.width = `${containerRect.width}px`
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section className="bg-white text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12 no-reveal">
        {/* CONTAINER GERAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* COLUNA ESQUERDA: NARRATIVA E LISTA */}
          <div className="lg:col-span-7 space-y-10">
            {/* Header Narrativo */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-[40px] font-medium tracking-tight leading-[1.05] text-slate-900">
                {section?.texts.title || 'O Segredo por trás dos resultados:'}{' '}
                <span className="text-[#F97316] tracking-wide">{section?.texts.titleHighlight || 'O Código do Vendedor Consultivo'}</span>
              </h2>

              <div className="pl-6 border-l-2 border-slate-100">
                <p className="text-lg md:text-xl text-slate-500 font-normal leading-relaxed">
                  {section?.texts.subtitle || 'O sucesso do Rodrigo não foi por acaso. Além de aplicar o Manual Solar Buy-Side, ele dominou a estratégia que inverte o jogo: aprender a pensar como um comprador para dominar a venda.'}
                </p>
              </div>
            </div>

            {/* O BÔNUS (Header) */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-[#F97316]">
                  <Sparkles size={14} />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {section?.texts.badge || 'Oferta Especial'}
                  </span>
                  <span className="block text-base font-bold text-slate-900 uppercase tracking-tight">
                    {section?.texts.badgeHighlight || ''}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{section?.texts.bonusTitle || 'BÔNUS EXCLUSIVO'}</h3>
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-tight italic">
                {section?.texts.bonusSubtitle || 'O método de imersão no Manual Solar Buy-Side para quem não aceita mais perder vendas por preço.'}
              </p>
            </div>

            {/* O LIVRO NO MOBILE - aparece aqui após o bônus */}
            <div className="lg:hidden flex justify-center py-4">
              <div className="relative group w-full max-w-[350px]" style={{ perspective: '2000px' }}>
                {/* Efeito de Sombra Colorida (Aura) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-200/30 blur-[120px] rounded-full pointer-events-none opacity-60"></div>

                {/* O Livro */}
                <img
                  src={section?.images.bookImage || section?.images.book || '/assets/foto-o-codigo-do-vendedor.png'}
                  alt="O Código Oficial"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* LISTA INTERATIVA (Apple Style Specs) */}
            <div>
              <div className="space-y-0" onMouseLeave={() => setHoveredIndex(null)}>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">
                  {section?.texts.listTitle || section?.texts.listHeader || 'O que você vai dominar:'}
                </h4>

                {contentItems.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className={`group py-4 border-b border-slate-100 transition-all duration-500 cursor-default ${
                      hoveredIndex !== null && hoveredIndex !== idx ? 'opacity-30 blur-[1px]' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-6">
                      <div
                        className={`mt-1 transition-colors duration-300 ${
                          hoveredIndex === idx ? 'text-[#F97316]' : 'text-slate-300'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                          {item.title}
                          <ArrowRight
                            size={16}
                            className={`transition-all duration-300 ${
                              hoveredIndex === idx
                                ? 'opacity-100 translate-x-2 text-[#F97316]'
                                : 'opacity-0 -translate-x-2'
                            }`}
                          />
                        </h5>
                        <p className="text-lg text-slate-500 leading-relaxed max-w-lg">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: O LIVRO NO DESKTOP (Clean & Floating) */}
          <div
            className="hidden lg:flex lg:col-span-5 mt-12 lg:mt-0 justify-center lg:justify-end relative"
            ref={stickyContainerRef}
          >
            <div className="relative group w-full flex justify-end" style={{ perspective: '2000px' }} ref={stickyRef}>
              {/* Efeito de Sombra Colorida (Aura) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-200/30 blur-[120px] rounded-full pointer-events-none opacity-60"></div>

              {/* O Livro */}
              <img
                src={section?.images.bookImage || section?.images.book || '/assets/foto-o-codigo-do-vendedor.png'}
                alt="O Código Oficial"
                className="w-[440px] max-w-full h-auto"
              />


              </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `,
        }}
      />
    </section>
  )
}

