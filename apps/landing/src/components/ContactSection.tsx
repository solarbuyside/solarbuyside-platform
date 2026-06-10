import React from 'react'
import { Mail, MapPin, Building2 } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

export const ContactSection: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('contact')

  const email = section?.texts.emailAddress || 'contato@buyside.com.br'

  return (
    <section id="contact" className="relative overflow-hidden bg-white py-14 px-6">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="lp-title font-bold text-[#1D1D1F] mb-3">
            {section?.texts.title || (
              <>
                DADOS E <span className="text-[#F97316]">CONTATOS</span>
              </>
            )}
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-3xl mx-auto">
            {section?.texts.subtitle || 'Transparência e clareza para você entrar em contato com total confiança.'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-3xl p-7 md:p-10 shadow-xl">
          <div className="space-y-6">
            <div className="border-b border-orange-200 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-[#F97316]" />
                <h3 className="text-2xl font-bold text-[#1D1D1F]">
                  {section?.texts.companyName || (<><span className="text-[#F97316]">Buy-Side</span> Soluções</>)}
                </h3>
              </div>
              <p className="text-slate-600 text-sm">
                {section?.texts.cnpjLabel || 'CNPJ:'}{' '}
                <span className="font-semibold text-[#F97316]">{section?.texts.cnpjValue || '55.463.06/0001-80'}</span>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F97316] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[#1D1D1F] font-semibold">{section?.texts.addressLine1 || 'Torre Norte - Av. Bento Munhoz da Rocha Neto, 632'}</p>
                  <p className="text-slate-600">{section?.texts.addressLine2 || '19º Andar, Salas 1905 a 1908 - Zona 7,'}</p>
                  <p className="text-slate-600">{section?.texts.addressLine3 || 'Maringá - PR, 87030-010'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Mail className="w-5 h-5 text-[#F97316] flex-shrink-0" />
              <div>
                <p className="text-slate-600 text-sm mb-1">{section?.texts.emailLabel || 'E-mail:'}</p>
                <a
                  href={`mailto:${email}`}
                  className="text-[#F97316] hover:text-[#FF8C3A] text-lg font-semibold transition-colors underline decoration-[#F97316]/30 hover:decoration-[#FF8C3A]"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
