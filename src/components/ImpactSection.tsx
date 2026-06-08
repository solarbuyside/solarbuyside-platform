import React from 'react'
import {
  BarChart3,
  Layout,
  MinusCircle,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

type CardProps = {
  Icon: React.ComponentType<{ size?: number }>
  title: string
  desc: string
}

const Card: React.FC<CardProps> = ({ Icon, title, desc }) => {
  return (
    <div className="group relative flex gap-6 p-6 rounded-2xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
      <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/[0.03] rounded-2xl transition-colors"></div>

      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
        <Icon size={24} />
      </div>

      <div className="space-y-2 relative">
        <h4 className="text-lg font-bold text-white group-hover:text-[#F97316] transition-colors">{title}</h4>
        <p className="text-base text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export const ImpactSection: React.FC = () => {
  return (
    <section className="relative bg-[#020617] text-slate-100 font-sans antialiased overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-orange-500/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <div className="max-w-4xl mb-24">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter mb-8">
            Mas o que essa imersão representa na prática para o seu dia a dia como vendedor?
          </h2>
          <p className="text-xl text-slate-400 font-medium">
            Veja os resultados concretos que você pode alcançar ao aplicar o Manual Solar Buy-Side no seu processo de venda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <header className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#F97316] rounded-full"></div>
              <h3 className="text-sm font-black tracking-[0.3em] text-[#F97316] uppercase">O que o vendedor vai dominar</h3>
            </header>

            <div className="space-y-8">
              <Card
                Icon={Target}
                title="Dores reais do cliente"
                desc="Compreenda o que realmente pesa na decisão, não apenas o que ele diz na reunião."
              />
              <Card
                Icon={Users}
                title="Postura consultiva"
                desc="Pare de empurrar produto. Vire parceiro e ganhe confiança instantânea."
              />
              <Card
                Icon={TrendingUp}
                title="Valor técnico e econômico"
                desc="Explique payback, LCOE e TIR com clareza e faça o cliente enxergar valor."
              />
            </div>
          </div>

          <div className="space-y-12">
            <header className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#F97316] rounded-full"></div>
              <h3 className="text-sm font-black tracking-[0.3em] text-[#F97316] uppercase">Principais focos e habilidades</h3>
            </header>

            <div className="space-y-8">
              <Card
                Icon={Layout}
                title="Apresentações persuasivas"
                desc="Use dados do próprio cliente para construir propostas que convencem."
              />
              <Card
                Icon={BarChart3}
                title="Cenário financeiro sólido"
                desc="Estruture a decisão com números para reduzir insegurança e indecisão."
              />
              <Card
                Icon={MinusCircle}
                title="Menos desconto, mais margem"
                desc="Argumente com precisão e preserve sua comissão sem perder vendas."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
