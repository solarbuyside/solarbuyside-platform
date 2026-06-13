import { useEffect } from 'react'
import './v4.css'
import { trackPageView, observeSection } from '../utils/analytics'
import { Marquee } from './atoms'
import { FloatingCTAV4, HeaderV4, MobileCtaBarV4 } from './HeaderV4'
import { HeroV4 } from './HeroV4'
import { ContextV4 } from './ContextV4'
import { VideoV4 } from './VideoV4'
import { AudienceV4 } from './AudienceV4'
import { ManualStrategicV4 } from './ManualStrategicV4'
import { PlatformV4 } from './PlatformV4'
import { StoryBridgeV4, TestimonialsV4 } from './SocialProofV4'
import { SellerCodeV4 } from './SellerCodeV4'
import { PricingV4 } from './PricingV4'
import { BuyerWaveV4 } from './BuyerWaveV4'
import { AuthorityV4 } from './AuthorityV4'
import { ContactV4, FAQV4, FooterV4, LeadMagnetV4 } from './ClosingV4'

/* V4 "SOLAR DAWN" — mesma copy e mesma ordem narrativa da LP oficial (v1),
   experiência redesenhada em 4 atos. Em PREVIEW na rota /v4; a produção (/)
   continua na v1. (Foi oficial por uma janela em 2026-06-11; revertido.) */

const SECTION_IDS = [
  'hero',
  'contexto',
  'video-section',
  'audiencia',
  'manual-strategic',
  'plataforma',
  'depoimentos',
  'story-bridge',
  'seller-code',
  'oferta',
  'buyer-wave',
  'authority',
  'oferta-final',
  'lead-magnet',
  'faq',
  'newsletter',
  'contact',
] as const

/* Banda tipográfica da marca entre atos — só wordmark, nenhuma copy nova. */
const MarqueeBand: React.FC<{ tone?: 'cool' | 'warm' }> = ({ tone = 'cool' }) => (
  <div className="relative overflow-hidden border-y border-white/[0.06] bg-[#06080b] py-5" aria-hidden>
    <Marquee speed={42} reverse={tone === 'warm'}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex items-center gap-14 whitespace-nowrap">
          <span className="v4-stroke font-['Sora'] text-4xl font-extrabold tracking-tight md:text-6xl">
            Solar Buy-Side
          </span>
          <span className={tone === 'warm' ? 'text-orange-500/80' : 'text-orange-500/50'}>✦</span>
          <span className="v4-serif text-3xl text-slate-500/80 md:text-5xl">Manual de Compra</span>
          <span className={tone === 'warm' ? 'text-orange-500/80' : 'text-orange-500/50'}>✦</span>
        </span>
      ))}
    </Marquee>
  </div>
)

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
      <div id="contexto">
        <ContextV4 />
      </div>
      <div id="video-section">
        <VideoV4 />
      </div>
      <MarqueeBand />
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
      <div id="story-bridge">
        <StoryBridgeV4 />
      </div>
      <div id="seller-code">
        <SellerCodeV4 />
      </div>
      <PricingV4 id="oferta" />
      <div id="buyer-wave">
        <BuyerWaveV4 />
      </div>
      <MarqueeBand tone="warm" />
      <div id="authority">
        <AuthorityV4 />
      </div>
      <PricingV4 id="oferta-final" />
      <div id="lead-magnet">
        <LeadMagnetV4 />
      </div>
      <div id="faq">
        <FAQV4 />
      </div>
      <ContactV4 />
      <FooterV4 />
    </div>
  )
}
