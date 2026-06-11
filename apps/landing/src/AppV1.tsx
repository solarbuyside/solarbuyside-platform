import { useEffect } from 'react'
import {
  SolarHeader,
  FloatingCTA,
  HeroSectionPotato,
  ContextSection,
  VideoSection,
  AudienceSection,
  ManualStrategicSection,
  TestimonialsSection,
  StoryBridgeSection,
  SellerCodeSection,
  PricingSection,
  BuyerWaveSection,
  AuthoritySection,
  LeadMagnetSection,
  NewsletterSection,
  FAQSection,
  ContactSection,
  Footer,
} from './components'
import { trackPageView, observeSection } from './utils/analytics'

/* LP "v1" — foi a oficial na raiz até 2026-06-11, quando a V4 "Solar Dawn"
   assumiu o "/". Preservada aqui em /v1 para consulta e comparação, com o
   mesmo comportamento de sempre (reveal por scroll, analytics por seção e o
   listener do preview do admin). */
export default function AppV1() {
  useEffect(() => {
    trackPageView()

    const targets = document.querySelectorAll('section > *:not(.no-reveal)')
    targets.forEach((target) => target.classList.add('reveal'))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    targets.forEach((target) => observer.observe(target))

    // Track section views
    const cleanupFunctions: (() => void)[] = []
    const sections = [
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
    ]

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        cleanupFunctions.push(observeSection(element, sectionId))
      }
    })

    // Listener para mensagens do iframe do admin
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'scrollToSection' && event.data.hash) {
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
      observer.disconnect()
      window.removeEventListener('message', handleMessage)
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    <div className="bg-[#020617] text-slate-400 font-sans overflow-x-hidden selection:bg-[#F97316] selection:text-white">
      <SolarHeader />
      <FloatingCTA />
      <div id="hero"><HeroSectionPotato /></div>
      <div id="contexto"><ContextSection /></div>
      <div id="video-section"><VideoSection /></div>
      <div id="audiencia"><AudienceSection /></div>
      <div id="manual-strategic"><ManualStrategicSection /></div>
      <div id="depoimentos"><TestimonialsSection /></div>
      <div id="story-bridge"><StoryBridgeSection /></div>
      <div id="seller-code"><SellerCodeSection /></div>
      <PricingSection id="oferta" />
      <div id="buyer-wave"><BuyerWaveSection /></div>
      <div id="authority"><AuthoritySection /></div>
      <PricingSection id="oferta-final" />
      <div id="lead-magnet"><LeadMagnetSection /></div>
      <div id="faq"><FAQSection /></div>
      <div id="newsletter"><NewsletterSection /></div>
      <ContactSection />
      <Footer />
    </div>
  )
}
