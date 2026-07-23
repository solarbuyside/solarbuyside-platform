import { useEffect } from 'react'
import './v4.css'
import { trackPageView, observeSection } from '../utils/analytics'
import { FloatingCTAV4, HeaderV4, MobileCtaBarV4 } from './HeaderV4'
import { HeroV4 } from './HeroV4'
import { ContextV4 } from './ContextV4'
import { VideoV4, VideoCtaV4 } from './VideoV4'
import { ApoiadoresBandV4, ApoiadoresV4 } from './ApoiadoresV4'
import { AudienceV4 } from './AudienceV4'
import { ManualStrategicV4 } from './ManualStrategicV4'
import { PlatformV4 } from './PlatformV4'
import { TestimonialsV4 } from './SocialProofV4'
import { PricingV4 } from './PricingV4'
import { AuthorityV4 } from './AuthorityV4'
import { ContactV4, FAQV4, FooterV4 } from './ClosingV4'

/* V4 "SOLAR DAWN" — mesma copy e mesma ordem narrativa da LP oficial (v1),
   experiência redesenhada em 4 atos. Em PREVIEW na rota /v4; a produção (/)
   continua na v1. (Foi oficial por uma janela em 2026-06-11; revertido.) */

const SECTION_IDS = [
  'hero',
  'contexto',
  'video-section',
  'apoiadores',
  'audiencia',
  'manual-strategic',
  'plataforma',
  'depoimentos',
  'authority',
  'oferta',
  'faq',
  'contact',
] as const

export default function AppV4() {
  useEffect(() => {
    trackPageView()

    const cleanupFunctions: (() => void)[] = []
    SECTION_IDS.forEach((sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        cleanupFunctions.push(observeSection(element, sectionId))
      }
    })

    // Preview do admin (plataforma) abre a LP num iframe e manda
    // scrollToSection para navegar até a seção selecionada no editor.
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'scrollToSection' && event.data.hash) {
        const element = document.getElementById(event.data.hash)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }
      }
    }
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    // overflow-x-clip (não -hidden): corta vazamento horizontal sem virar
    // scroll-container, preservando position:sticky (livro, manual)
    <div className="v4-root overflow-x-clip bg-[#07090d] text-slate-400 antialiased selection:bg-orange-500/80 selection:text-white">
      <HeaderV4 />
      <FloatingCTAV4 />
      <MobileCtaBarV4 />
      <div id="hero">
        <HeroV4 />
      </div>
      {/* Faixa de logos logo abaixo do Hero, como no slide 1 do Francis. Ela
          substitui a antiga faixa "Manual ✦ Código" (resposta dele em 23/07). */}
      <ApoiadoresBandV4 />
      <div id="contexto">
        <ContextV4 />
      </div>
      <div id="video-section">
        <VideoV4 />
      </div>
      {/* Seção completa dos apoiadores entra depois do vídeo e o CTA do vídeo
          desce para baixo dela (Francis, slide 2). */}
      <div id="apoiadores">
        <ApoiadoresV4 />
      </div>
      <VideoCtaV4 />
      <div id="audiencia">
        <AudienceV4 />
      </div>
      <div id="manual-strategic">
        <ManualStrategicV4 />
      </div>
      <div id="plataforma">
        <PlatformV4 />
      </div>
      <div id="depoimentos">
        <TestimonialsV4 />
      </div>
      <div id="authority">
        <AuthorityV4 />
      </div>
      <PricingV4 id="oferta" />
      <div id="faq">
        <FAQV4 />
      </div>
      <ContactV4 />
      <FooterV4 />
    </div>
  )
}
