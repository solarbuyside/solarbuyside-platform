import React from 'react'
import { HeroSectionPotato } from '../HeroSectionPotato'
import { ContextSection } from '../ContextSection'
import { VideoSection } from '../VideoSection'
import { AudienceSection } from '../AudienceSection'
import { PricingSection } from '../PricingSection'
import { TestimonialsSection } from '../TestimonialsSection'
import { StoryBridgeSection } from '../StoryBridgeSection'
import { SellerCodeSection } from '../SellerCodeSection'
import { ManualStrategicSection } from '../ManualStrategicSection'
import { BuyerWaveSection } from '../BuyerWaveSection'
import { AuthoritySection } from '../AuthoritySection'
import { LeadMagnetSection } from '../LeadMagnetSection'
import { FAQSection } from '../FAQSection'
import { ContactSection } from '../ContactSection'
import { NewsletterSection } from '../NewsletterSection'
import { LEGAL_PREVIEW_CONFIG } from './legalPreviewConfig'

interface AdminPreviewProps {
  sectionId: string
  texts: { [key: string]: string }
  images: { [key: string]: string }
}

export const AdminPreview: React.FC<AdminPreviewProps> = ({ sectionId }) => {
  if (sectionId === 'hero') return <HeroSectionPotato />
  if (sectionId === 'context') return <ContextSection />
  if (sectionId === 'video') return <VideoSection />
  if (sectionId === 'audience') return <AudienceSection />
  if (sectionId === 'pricing') return <PricingSection />
  if (sectionId === 'testimonials') return <TestimonialsSection />
  if (sectionId === 'story-bridge') return <StoryBridgeSection />
  if (sectionId === 'seller-code') return <SellerCodeSection />
  if (sectionId === 'manual-strategic') return <ManualStrategicSection />
  if (sectionId === 'buyer-wave') return <BuyerWaveSection />
  if (sectionId === 'authority') return <AuthoritySection />
  if (sectionId === 'lead-magnet') return <LeadMagnetSection />
  if (sectionId === 'faq') return <FAQSection />
  if (sectionId === 'contact') return <ContactSection />
  if (sectionId === 'newsletter') return <NewsletterSection />

  const legalPreview = LEGAL_PREVIEW_CONFIG[sectionId]
  if (legalPreview) {
    return (
      <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <p className="text-sm font-medium text-slate-700">Preview real: {legalPreview.label}</p>
        </div>
        <iframe
          key={`legal-preview-${sectionId}`}
          src={legalPreview.route}
          className="w-full border-0"
          style={{ height: '900px' }}
          title={`Preview ${legalPreview.label}`}
        />
      </div>
    )
  }

  return (
    <div className="p-12 text-center">
      <p className="text-slate-600">Preview nao disponivel para esta secao</p>
    </div>
  )
}
