import React from 'react'
import {
  ArrowRight,
  BarChart3,
  Layout,
  MinusCircle,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { ButtonPrimary } from './ManualAtoms'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from './CMSText'

type CardProps = {
  Icon: React.ComponentType<{ size?: number }>
  title: string
  desc: React.ReactNode
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

export const ManualStrategicSection: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('manual-strategic')

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0b1224] via-[#0a1730] to-[#020617] text-slate-100 font-sans antialiased selection:bg-orange-100 selection:text-orange-900">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6 flex flex-col relative z-10">
            <div className="space-y-4 fade-in">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[10px] font-bold uppercase tracking-widest">
                {section?.texts.badge || 'A ferramenta estratégica'}
              </span>
              <div className="space-y-3">
                <h2 className="text-4xl md:text-[42px] font-black tracking-tight text-white">
                  {section?.texts.title || 'Manual Solar Buy-Side'}
                </h2>
                <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-md border-l-2 border-orange-500 pl-4">
                  {section?.texts.subtitle || 'A ferramenta estratégica que todo vendedor do setor solar precisa ter.'}
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-2xl fade-in-delay-1">
              <div className="space-y-4 text-lg text-slate-300 leading-relaxed font-medium" style={{ textAlign: 'justify' }}>
                <p>
                  {section?.texts.description1 || 'O Manual de Compra Solar Buy-Side é uma leitura essencial para profissionais do setor de vendas (Sell-Side) que desejam se destacar em um mercado ultracompetitivo.'}
                </p>
                <p>
                  {section?.texts.description2 || 'Ao proporcionar uma imersão na jornada de compra sob a ótica do comprador, este manual oferece uma compreensão estratégica dos critérios, motivações e desafios enfrentados pelo lado comprador (Buy-Side).'}
                </p>
                <p>
                  {section?.texts.description3 || 'Ao dominar o conceito Buy-Side, vendedores estarão aptos a lapidar sua abordagem comercial, entregar valor real, distanciar-se da briga por preço e elevar sua credibilidade no relacionamento com os clientes.'}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6 fade-in-delay-2">
              <ButtonPrimary
                className="text-base md:text-lg px-10 py-4"
                onClick={() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {section?.texts.ctaButton || 'QUERO VENDER COM ESTRATÉGIA AVANÇADA'}
                <ArrowRight size={20} />
              </ButtonPrimary>
            </div>
          </div>

          <div className="lg:col-span-6 sticky top-16 flex justify-center lg:justify-end pt-8 fade-in-delay-3">
            <div className="relative group">
              <div className="absolute -inset-14 bg-orange-500/50 blur-[110px] rounded-full group-hover:bg-orange-500/60 transition-colors duration-700 -z-10"></div>

              <img
                src={section?.images.manualImage || '/assets/Capa-manual-buy-side-definitiva.png'}
                alt="Manual Solar Buy-Side"
                className="w-[560px] max-w-full h-auto relative"
              />
            </div>
          </div>
        </div>

        <div className="relative mt-10 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent -z-10"></div>

        <div className="relative mt-10 max-w-4xl">
          <h2 className="text-3xl md:text-[40px] font-black text-white leading-snug tracking-tight mb-4">
            <CMSText value={
              section?.texts.section2Title?.trim()
                ? section.texts.section2Title
                : 'Veja os resultados <span class="cms-orange">concretos</span> que você pode alcançar ao aplicar o <span class="cms-orange">Manual Solar Buy-Side</span> no seu processo de venda.'
            } />
          </h2>
          {section?.texts.section2Subtitle && (
            <p className="text-xl md:text-2xl text-slate-400 font-medium">
              {section.texts.section2Subtitle}
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <header className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#F97316] rounded-full"></div>
              <h3 className="text-sm font-black tracking-[0.3em] text-[#F97316] uppercase">{section?.texts.sellSideHeader || 'O que o vendedor vai dominar'}</h3>
            </header>

            <div className="space-y-4">
              <Card
                Icon={Target}
                title={section?.texts.sellCard1Title || 'Dores reais do cliente'}
                desc={section?.texts.sellCard1Desc || 'Compreende o que realmente pesa na decisão, não apenas o que ele diz na reunião.'}
              />
              <Card
                Icon={Users}
                title={section?.texts.sellCard2Title || 'Postura consultiva'}
                desc={section?.texts.sellCard2Desc || 'Compreende o que realmente pesa na decisão, não apenas o que ele diz na reunião.'}
              />
              <Card
                Icon={TrendingUp}
                title={section?.texts.sellCard3Title || 'Valor técnico e econômico'}
                desc={section?.texts.sellCard3Desc || 'Demonstra, de forma fundamentada, como o valor técnico da solução se converte em benefício econômico.'}
              />
            </div>
          </div>

          <div className="space-y-6">
            <header className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#F97316] rounded-full"></div>
              <h3 className="text-sm font-black tracking-[0.3em] text-[#F97316] uppercase">{section?.texts.focusHeader || 'Principais focos e habilidades'}</h3>
            </header>

            <div className="space-y-4">
              <Card
                Icon={Layout}
                title={section?.texts.focusCard1Title || 'Apresentações persuasivas'}
                desc={section?.texts.focusCard1Desc || 'Estruture propostas objetivas e transparentes que facilitam a decisão do cliente.'}
              />
              <Card
                Icon={BarChart3}
                title={section?.texts.focusCard2Title || 'Domine a Venda'}
                desc={section?.texts.focusCard2Desc || 'Conquiste autoridade e crie conexões reais para fechar mais negócios.'}
              />
              <Card
                Icon={MinusCircle}
                title={section?.texts.focusCard3Title || 'Menos desconto, mais margem'}
                desc={section?.texts.focusCard3Desc || 'Argumente com precisão e preserve sua comissão sem perder vendas.'}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
