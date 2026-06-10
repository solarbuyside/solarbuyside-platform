import React from 'react'
import { CheckCircle2 } from 'lucide-react'

const manualImage = '/assets/manual.jpg.png'

const specs = [
  'Mais de 130 páginas com conteúdo técnico e estratégico',
  '160 tópicos organizados para consulta rápida',
  'Uma metodologia em 4 fases que orienta toda a jornada de compra',
  'Anexos técnicos que auxiliam na tomada de decisão',
]

export const DeliverablesSection: React.FC = () => {
  return (
    <section id="conteudo" className="py-24 px-6 bg-[#020617] text-white border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Uma imersão inovadora que revela a perspectiva do cliente para vender mais, melhor e com autoridade.
            </h2>
            <ul className="space-y-4 text-slate-300">
              {specs.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F97316] mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute -inset-6 bg-gradient-to-tr from-[#F97316]/30 via-transparent to-blue-500/20 blur-3xl rounded-full"></div>
            <div className="relative w-64 md:w-72 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={manualImage} alt="Manual Solar Buy-Side" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>

        <div className="mt-16 bg-slate-900/60 border border-[#F97316]/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Atenção: O tempo está correndo e quem agir primeiro, vende mais.
          </h3>
          <p className="text-slate-300 mb-3">
            Em um mercado competitivo, sua vantagem é o conhecimento.
          </p>
          <p className="text-slate-400">
            Não espere até que seus clientes e concorrentes tenham acesso ao manual, saibam mais que você e passem na sua frente.
          </p>
        </div>
      </div>
    </section>
  )
}
