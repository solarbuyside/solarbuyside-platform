import React from 'react'
import {
  ArrowRight,
  Search,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Layout,
} from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

export const ContextSection: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('context')

  const cards = [
    {
      icon: <Search className="w-5 h-5" />,
      title: section?.texts.card1Title || 'Saberão analisar',
      desc: section?.texts.card1Desc || 'Compararão propostas com precisão técnica superior à média do mercado.',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: section?.texts.card2Title || 'Analisarão fundo',
      desc: section?.texts.card2Desc || 'Fornecedores e tecnologias passarão por um crivo muito mais rigoroso.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: section?.texts.card3Title || 'Avaliarão risco',
      desc: section?.texts.card3Desc || 'A confiabilidade da sua empresa será o fator decisivo antes de qualquer preço.',
    },
  ]

  const checks = [
    section?.texts.check1 || 'Visão do Cliente',
    section?.texts.check2 || 'Gatilhos de Compra',
    section?.texts.check3 || 'Confiabilidade',
  ]

  return (
    <section id="contexto" className="bg-white text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 antialiased">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[#F97316] text-[10px] font-bold uppercase tracking-widest mb-4">
            <Layout className="w-3 h-3" /> {section?.texts.badge || 'Vision 2026'}
          </div>
          <h2 className="text-3xl md:text-[40px] font-black tracking-tight text-slate-900 mb-3">
            {section?.texts.title || 'Panorama'} <span className="text-[#cbd5e1]">{section?.texts.titleHighlight || '2026'}</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-tight italic">
            {section?.texts.subtitle || 'Pode parecer exagero, mas em breve cada vez mais compradores de sistema fotovoltaico estarão informados.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {cards.map((item, idx) => (
            <div key={idx} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#F97316] shadow-sm">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-base text-slate-500 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mb-6 overflow-hidden rounded-3xl bg-slate-950 px-7 py-4 flex flex-col md:flex-row items-center justify-between gap-5 border-l-4 border-[#F97316]">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-[#F97316]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
              {section?.texts.alertTitle || 'Quem não entender essa nova jornada vai perder vendas.'}
            </h3>
          </div>
          <div className="h-px md:h-8 w-full md:w-px bg-white/10"></div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest text-center md:text-left">
            {section?.texts.alertSubtitle || 'O cenário está evoluindo. Você está pronto?'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">
                {section?.texts.solutionBadge || 'A Solução Definitiva'}
              </span>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-3">
                {section?.texts.solutionTitle || 'Ainda há tempo para reverter essa situação.'}
              </h3>
              <p className="text-slate-600 mb-4 leading-relaxed max-w-xl">
                {section?.texts.solutionDesc || 'O Manual de Compra Solar Buy-Side mapeia os novos gatilhos de decisão do cliente moderno, garantindo que você esteja do lado certo da venda.'}
              </p>

              <div className="flex flex-wrap gap-y-3 gap-x-6">
                {checks.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-base font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#F97316]" /> {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col items-center lg:items-end">
              <button
                className="group relative bg-slate-900 hover:bg-[#F97316] text-white px-8 py-5 rounded-full font-bold text-base transition-all duration-300 flex items-center gap-3 shadow-lg shadow-slate-200 hover:shadow-[#F97316]/20 min-h-[44px]"
                onClick={() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })}
                type="button"
              >
                {section?.texts.ctaButton || 'Garantir meu acesso agora'}
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
              <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {section?.texts.ctaSubtext || 'Download Imediato • PDF Interativo'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
