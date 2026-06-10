import React from 'react'
import { Check, CheckCircle2, Minus, XCircle } from 'lucide-react'

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-[#020617] border-y border-slate-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-white mb-16">Por que eles ganham e você perde?</h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-0 relative">
          <div className="bg-[#0F172A]/50 p-8 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none border border-slate-800 opacity-70 blur-[0.5px] hover:blur-0 hover:opacity-100 transition-all">
            <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Vendedor Comum
            </h3>
            <ul className="space-y-6 text-slate-400 text-sm">
              <li className="flex gap-4">
                <Minus className="w-5 h-5 text-slate-600" />Foca em preço/Wp e desconto.
              </li>
              <li className="flex gap-4">
                <Minus className="w-5 h-5 text-slate-600" />"Garantia de 25 anos" (genérico).
              </li>
              <li className="flex gap-4">
                <Minus className="w-5 h-5 text-slate-600" />Envia proposta padrão em PDF.
              </li>
              <li className="flex gap-4">
                <Minus className="w-5 h-5 text-slate-600" />Reclama da concorrência "prostituída".
              </li>
            </ul>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-[#020617] z-10 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            VS
          </div>

          <div className="bg-[#0F172A] p-8 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none border-2 border-[#F97316] relative shadow-[0_0_50px_rgba(249,115,22,0.1)] transform scale-[1.02]">
            <div className="absolute top-0 right-0 bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              VOCÊ HOJE
            </div>
            <h3 className="text-[#F97316] font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Especialista Buy-Side
            </h3>
            <ul className="space-y-6 text-white text-sm font-medium">
              <li className="flex gap-4">
                <Check className="w-5 h-5 text-[#F97316]" />Vende LCOE, TIR e Payback Ajustado.
              </li>
              <li className="flex gap-4">
                <Check className="w-5 h-5 text-[#F97316]" />Explica riscos ocultos de garantia.
              </li>
              <li className="flex gap-4">
                <Check className="w-5 h-5 text-[#F97316]" />Constrói o cenário financeiro com o cliente.
              </li>
              <li className="flex gap-4">
                <Check className="w-5 h-5 text-[#F97316]" />Usa a concorrência fraca como escada.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
