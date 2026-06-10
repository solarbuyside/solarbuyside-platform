import React from 'react'
import { ArrowRight, BrainCircuit, Eye, LayoutDashboard, Target } from 'lucide-react'
import { BentoItem } from './ManualAtoms'

export const SystemSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-slate-50 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
            O Sistema Operacional do <br /> Vendedor de Alta Performance.
          </h2>
          <p className="text-lg text-slate-600">
            O Manual Buy-Side não é um livro de dicas. É uma arquitetura de decisão.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <BentoItem className="md:row-span-2 bg-[#0F172A] !border-slate-800 text-white flex flex-col justify-between group">
            <div className="absolute top-0 right-0 p-32 bg-[#F97316] opacity-5 blur-[80px] rounded-full"></div>
            <div>
              <div className="p-3 bg-white/10 w-fit rounded-lg mb-6">
                <Eye className="w-6 h-6 text-[#F97316]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Visão 360° da Transação</h3>
              <p className="text-slate-400 leading-relaxed">
                Imersão na jornada de compra SOB A ÓTICA DO COMPRADOR. Compreensão estratégica dos critérios de decisão e objeções.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-[#F97316] font-bold uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4" /> Inteligência Pura
              </div>
            </div>
          </BentoItem>
          <BentoItem colSpan="md:col-span-2" className="bg-white">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-orange-100 rounded-lg text-orange-600 flex-shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">O Resultado Prático</h3>
                <p className="text-slate-600 text-sm">
                  Ao dominar o conceito Buy-Side, você estará apto a lapidar sua abordagem, entregar valor real e elevar sua credibilidade.
                </p>
              </div>
            </div>
          </BentoItem>
          <BentoItem className="bg-slate-100">
            <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-slate-500" /> O Tabuleiro
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              "Se vender é xadrez, este manual ensina a pensar como <strong>SEU OPONENTE</strong>."
            </p>
          </BentoItem>
          <BentoItem className="bg-gradient-to-br from-[#F97316] to-orange-600 !border-none text-white flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] transition-transform">
            <p className="font-bold text-lg mb-2">Acessar Arquitetura</p>
            <ArrowRight className="w-6 h-6" />
          </BentoItem>
        </div>
      </div>
    </section>
  )
}
