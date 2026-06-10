import React from 'react'
import { useContent } from '../contexts/ContentContext'

export const AuthoritySection: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('authority')
  return (
    <section
      id="autor"
      className="relative overflow-hidden bg-gradient-to-b from-[#0b1224] via-[#0a1730] to-[#020617] py-12 px-6 text-white"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Título */}
        <div className="text-left mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#F97316] text-[10px] font-bold uppercase tracking-widest mb-4">
            {section?.texts.badge || 'Experiência Dual'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight max-w-4xl">
            {section?.texts.title || 'Este conteúdo foi concebido por quem domina, as duas perspectivas da'}{' '}
            <span className="text-[#F97316]">{section?.texts.titleHighlight || 'mesa de negociação — a do comprador e a do vendedor.'}</span>
          </h2>
        </div>

        {/* Grid com 2 pessoas - Layout Horizontal */}
        <div className="space-y-8">
          {/* Francis Poloni */}
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4">
              <div className="relative max-w-[280px] mx-auto">
                <div className="aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden relative transition-all duration-700 group shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <img src={section?.images.francis || '/assets/Francis Poloni LP PRO.jpg.jpeg'} alt="Francis Poloni" className="absolute inset-0 h-full w-full object-cover object-center" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50"></div>
                  {/* Badge de Experiência */}
                  <div className="absolute bottom-4 right-4 bg-[#F97316] px-6 py-3 rounded-2xl shadow-xl">
                    <p className="text-white text-2xl font-bold leading-none">{section?.texts.person1Experience || '+7 Anos'}</p>
                    <p className="text-white/90 text-[10px] font-semibold uppercase tracking-wider mt-1">{section?.texts.person1ExperienceLabel || 'de experiência'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-8 space-y-4">
              <div>
                <p className="text-[#F97316] font-bold tracking-widest text-xs uppercase mb-2">{section?.texts.person1Badge || 'Especialista'}</p>
                <h3 className="text-3xl font-bold">{section?.texts.person1Name || 'Francis Poloni'}</h3>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed">
                {section?.texts.person1Desc || 'Atua desde 2018 no setor de integração fotovoltaica e consultoria onde assessorou tanto no lado do comprador (Buy-Side) quanto no lado do vendedor (Sell-Side), ajudando na tomada de decisões inteligentes e seguras.'}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest">
                {section?.texts.person1Tag || 'Especialista Visão Buy-Side (Comprador)'}
              </div>
            </div>
          </div>

          {/* Ovídio Collesi */}
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4">
              <div className="relative max-w-[280px] mx-auto">
                <div className="aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden relative transition-all duration-700 group shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <img src={section?.images.ovidio || '/assets/Ovídio2.png'} alt="Ovídio Collesi" className="absolute inset-0 h-full w-full object-cover object-center" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50"></div>
                  {/* Badge de Experiência */}
                  <div className="absolute bottom-4 right-4 bg-[#F97316] px-6 py-3 rounded-2xl shadow-xl">
                    <p className="text-white text-2xl font-bold leading-none">{section?.texts.person2Experience || '+5 Anos'}</p>
                    <p className="text-white/90 text-[10px] font-semibold uppercase tracking-wider mt-1">{section?.texts.person2ExperienceLabel || 'de experiência'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-8 space-y-4">
              <div>
                <p className="text-[#F97316] font-bold tracking-widest text-xs uppercase mb-2">{section?.texts.person2Badge || 'Especialista'}</p>
                <h3 className="text-3xl font-bold">{section?.texts.person2Name || 'Ovídio Collesi'}</h3>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed">
                {section?.texts.person2Desc || 'Com vasta experiência em venda e pós venda no setor de energia solar fotovoltaica desde 2020, teve passagens por marketplaces, distribuidores, integração solar e certificadora, trazendo uma visão completa do lado do vendedor e do suporte técnico.'}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-900/30 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest">
                {section?.texts.person2Tag || 'Especialista Visão Sell-Side (Vendedor)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
