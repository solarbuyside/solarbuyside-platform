import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { trackBuyClick } from '../utils/analytics'
import { Img } from './atoms'
import { criarTxt } from './cms'
import { VARIANTES, useVarianteHero } from './heroVariante'

/* Na MESMA ordem em que as seções aparecem na página (ver SECTION_IDS no
   AppV4). Um menu fora de ordem faz o visitante rolar para trás no meio da
   navegação, e o indicador de progresso do topo anda ao contrário.

   Na V5 (15/08) a Plataforma desceu da 2ª para a 4ª dobra e os Mentores da 5ª
   para a 6ª. A ORDEM RELATIVA dos itens não mudou (4 < 6 < 7 < 8 < 9), então a
   lista fica como estava.

   O que muda é o ALVO do "Para Quem": `#para-quem` no lugar de
   `#transformacao`. Ele apontava para lá porque a resposta era o fecho daquela
   seção; agora o bloco vive abaixo do vídeo, com id só dele (slides 5 e 8).
   Mantido o link velho, o item levaria o visitante ao topo da comparação
   Hoje/Depois, vários parágrafos acima da resposta.

   Os RÓTULOS vêm do CMS desde 14/08 (`navPlatform`, `navMentor`…, na seção
   `hero`); rótulo vazio tira o item do menu. O href continua no código: é
   âncora de estrutura, não texto de cliente. */
export const HeaderV4: React.FC = () => {
  const { variante, modoAvaliacao, trocar } = useVarianteHero()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const { globalAssets, getSection } = useContent()
  const txt = criarTxt(getSection('hero'))
  const navItems = [
    { href: '#plataforma', label: txt('navPlatform', 'Plataforma') },
    { href: '#autor', label: txt('navMentor', 'Mentor') },
    { href: '#contexto', label: txt('navPanorama', 'Panorama') },
    { href: '#video-section', label: txt('navVideo', 'Vídeo') },
    { href: '#para-quem', label: txt('navAudience', 'Para Quem') },
    { href: '#faq', label: txt('navFaq', 'FAQ') },
  ].filter((item) => item.label)
  const headerCta = txt('headerCta', 'Garantir Acesso')

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
        <div className="flex items-center">
        <a href="#hero" className="flex items-center gap-3">
          <Img
            src={globalAssets.logo ?? '/assets/LOGOSOLARBUYSIDE3.png'}
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

        {/* Seletor de variante do Hero: tres letras, dentro da linha que o
            cabecalho ja ocupa. Antes era uma faixa propria acima dele, que
            comia ~56px de altura da primeira dobra so para existir. So
            aparece em modo de avaliacao (ver heroVariante.ts). */}
        {modoAvaliacao && (
          <div className="ml-3 flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-0.5">
            {VARIANTES.map((v) => {
              /* NO AUTOMÁTICO (sem `?hero=`) quem está no ar depende da
                 largura: A no celular, B no desktop. O aceso segue a mesma
                 media query do Hero, POR CSS — se a letra acesa fosse decidida
                 em JavaScript, ela discordaria do HTML congelado e o React
                 remendaria o cabeçalho na hidratação.

                 `aria-pressed` não tem como acompanhar media query, então no
                 automático ele fica `undefined`: melhor não afirmar nada para
                 o leitor de tela do que afirmar a letra errada em metade dos
                 aparelhos. Com `?hero=` na URL ele volta a ser exato. */
              const auto = variante === null
              const aceso = 'bg-orange-500 text-white'
              const apagado = 'text-slate-500 hover:bg-white/10 hover:text-white'
              const cor = auto
                ? v.id === 'a'
                  ? `${aceso} lg:bg-transparent lg:text-slate-500 lg:hover:bg-white/10 lg:hover:text-white`
                  : v.id === 'b'
                    ? `${apagado} lg:bg-orange-500 lg:text-white`
                    : apagado
                : variante === v.id
                  ? aceso
                  : apagado
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => trocar(v.id)}
                  title={`${v.nome}: ${v.resumo}`}
                  aria-pressed={auto ? undefined : variante === v.id}
                  className={`v4-mono flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold uppercase transition-colors ${cor}`}
                >
                  {v.id}
                </button>
              )
            })}
          </div>
        )}
        </div>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative rounded-full px-4 py-2 text-sm font-semibold text-slate-400 transition-colors duration-300 hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-orange-500 transition-transform duration-300 group-hover:scale-100" />
            </a>
          ))}
          {headerCta && <a
            href="#oferta"
            className="group ml-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(249,115,22,0.8)]"
          >
            {headerCta}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>}
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
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-3 text-base font-semibold text-slate-200 transition-colors hover:bg-white/[0.06] hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {headerCta && <a
            href="#oferta"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg"
            onClick={() => setIsMenuOpen(false)}
          >
            {headerCta}
            <ArrowRight className="h-4 w-4" />
          </a>}
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
      /* ENCOLHEU DE NOVO, e bastante (Francis, 09/08: "atrapalha um pouco a
         leitura em tela; reduzir muito seu tamanho ou eliminar").

         Em 06/08 ele já tinha pedido menor e foi de 330x68 para 268x54. Ainda
         era uma placa cobrindo o canto inferior direito da página inteira, e
         é justamente ali que a legenda dos painéis da jornada e o fim das
         tabelas aparecem. Agora é uma pastilha de ~190x40.

         O que saiu foi a linha de cima ("MANUAL SOLAR BUY-SIDE"), que repetia
         a marca que o cabeçalho mostra o tempo todo, e uma tipografia inteira
         de altura. Ficou o que faz o trabalho: a seta e a ação. Eliminar de
         vez era a outra opção dele, mas o botão é o único CTA presente
         durante a rolagem inteira — encolher entrega a leitura de volta sem
         abrir mão da conversão. */
      className={`fixed bottom-5 right-5 z-40 hidden max-w-[264px] items-center gap-2 rounded-full border border-white/10 bg-[#0a0c12]/95 py-1.5 pl-1.5 pr-4 text-slate-50 shadow-[0_16px_36px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 md:flex ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
      }`}
      aria-hidden={!isVisible}
      // Sem o tabIndex, o link continuava alcançável pelo Tab enquanto estava
      // escondido — foco indo para um elemento invisível. É o que o Lighthouse
      // reportava como "aria-hidden element must not be focusable".
      tabIndex={isVisible ? undefined : -1}
    >
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-orange-500 to-orange-600 shadow-[0_6px_16px_-6px_rgba(249,115,22,0.7)]">
        <ArrowRight size={14} />
      </span>
      <span className="truncate text-[12px] font-bold leading-tight text-slate-50">
        {txt('ctaButton', 'Garantir meu acesso agora')}
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
