import React from 'react'
import { Hourglass, XCircle } from 'lucide-react'
import { SectionHeading } from './ManualAtoms'

const modules = [
  'Módulo 1: A Mente do Comprador',
  'Módulo 2: Finanças Solares Avançadas',
  'Módulo 3: Técnica Anti-Objeção',
]

const manualImage = '/assets/manual.jpg.png'

export const ModulesSection: React.FC = () => {
  return (
    <>
      <section className="bg-orange-50 border-y border-orange-100 py-12 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-orange-600 font-bold uppercase tracking-widest text-xs mb-4">
            <Hourglass className="w-4 h-4" /> Tempo Limitado
          </div>
          <h3 className="text-2xl font-bold text-[#0F172A] mb-4">
            O Mercado não espera. <span className="text-[#F97316]">Sua vantagem é agora.</span>
          </h3>
          <p className="text-slate-600 mb-6 text-sm">
            Não espere até que seus clientes saibam mais que você. Manual Completo + Bônus = Vantagem Imediata.
          </p>
          <div className="flex justify-center gap-4 text-xs font-bold text-[#0F172A]">
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" /> Clientes Acessando
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" /> Bônus Esgotando
            </span>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <SectionHeading
              title="Não é Teoria. É Campo de Batalha."
              subtitle="Estruturado para consulta rápida durante a negociação."
              align="left"
              theme="light"
            />
            <div className="space-y-4">
              {modules.map((moduleTitle, index) => (
                <div key={moduleTitle} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center font-bold text-slate-500">
                    {index + 1}
                  </div>
                  <span className="font-bold text-[#0F172A]">{moduleTitle}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative h-[420px] w-full flex items-center justify-center">
            <div className="absolute w-72 h-96 bg-[#F97316] rounded-2xl shadow-xl transform -rotate-6 opacity-70"></div>
            <div className="relative w-72 h-96 rounded-2xl shadow-2xl transform rotate-6 overflow-hidden border border-slate-200">
              <img src={manualImage} alt="Manual Solar" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
