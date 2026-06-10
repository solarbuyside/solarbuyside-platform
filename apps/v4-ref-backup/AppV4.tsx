import { useEffect } from 'react'
import './v4.css'
import { trackPageView, observeSection } from '../utils/analytics'
import { FloatingCTAV4, HeaderV4 } from './HeaderV4'
import { HeroV4 } from './HeroV4'
import { ContextV4 } from './ContextV4'
import { VideoV4 } from './VideoV4'
import { AudienceV4 } from './AudienceV4'
import { ManualStrategicV4 } from './ManualStrategicV4'
import { StoryBridgeV4, TestimonialsV4 } from './SocialProofV4'
import { SellerCodeV4 } from './SellerCodeV4'
import { PricingV4 } from './PricingV4'
import { BuyerWaveV4 } from './BuyerWaveV4'
import { AuthorityV4 } from './AuthorityV4'
import { ContactV4, FAQV4, FooterV4, LeadMagnetV4, NewsletterV4 } from './ClosingV4'

/* V4 — mesma copy e mesma ordem narrativa da LP atual, UI redesenhada.
   Preview em /v4; a LP de produção (App.tsx) permanece intocada. */

const SECTION_IDS = [
  'hero',
  'contexto',
  'video-section',
  'audiencia',
  'manual-strategic',
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

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    <div className="v4-root overflow-x-hidden bg-[#030712] text-slate-400 antialiased selection:bg-orange-500/80 selection:text-white">
      <HeaderV4 />
      <FloatingCTAV4 />
      <div id="hero">
        <HeroV4 />
      </div>
      <div id="contexto">
        <ContextV4 />
      </div>
      <div id="video-section">
        <VideoV4 />
      </div>
      <div id="audiencia">
        <AudienceV4 />
      </div>
      <div id="manual-strategic">
        <ManualStrategicV4 />
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
      <div id="newsletter">
        <NewsletterV4 />
      </div>
      <ContactV4 />
      <FooterV4 />
    </div>
  )
}
