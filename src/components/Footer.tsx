import React from 'react'
import { useContent } from '../contexts/ContentContext'

export const Footer: React.FC = () => {
  const { globalAssets } = useContent()

  return (
    <footer className="bg-[#001529] text-white py-6 px-8 border-t border-white/5 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={globalAssets.logo || '/assets/LOGOSOLARBUYSIDE3.png'} alt="Solar Buy-Side" className="h-12 w-auto" onError={(e) => { e.currentTarget.src = '/assets/LOGOSOLARBUYSIDE3.png' }} />
          <div className="flex items-baseline gap-1 leading-tight whitespace-nowrap">
            <span className="text-white text-base font-bold tracking-tight">
              Solar
            </span>
            <span className="text-[#F97316] text-base font-bold tracking-tight">
              Buy-Side
            </span>
          </div>
        </div>

        <nav className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm font-semibold text-white/70">
          <a href="/politica-de-privacidade" className="hover:text-orange-500 transition-colors">
            Política de Privacidade
          </a>
          <a href="/termos-de-uso" className="hover:text-orange-500 transition-colors">
            Termos de Uso
          </a>
          <a href="/medidas-antipiratarias" className="hover:text-orange-500 transition-colors">
            Medidas Antipiratarias
          </a>
        </nav>
      </div>
    </footer>
  )
}
