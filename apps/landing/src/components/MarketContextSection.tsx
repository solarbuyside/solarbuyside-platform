import React from 'react'
import { MarketTicker } from './ManualAtoms'

export const MarketContextSection: React.FC = () => {
  return (
    <section className="py-16 px-6 bg-[#020617] border-t border-slate-800">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-white font-bold mb-8 text-center">📊 Market Context 2025</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <MarketTicker label="Custo Equip" value="+35%" trend="up" />
          <MarketTicker label="Juros Finc" value="+22%" trend="up" />
          <MarketTicker label="Concorrência" value="+58%" trend="up" />
        </div>
        <p className="text-center text-slate-500 text-sm">Margem pressionada = Vender VALOR é a única saída.</p>
      </div>
    </section>
  )
}
