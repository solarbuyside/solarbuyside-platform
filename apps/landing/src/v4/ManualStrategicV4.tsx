import React from 'react'
import { BarChart3, Layout, MinusCircle, Target, TrendingUp, Users } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Cta, CtaArrow, DarkBackdrop, Kicker, Reveal } from './atoms'
import { scrollToId } from './scroll'

type CardProps = {
  Icon: React.ComponentType<{ size?: number }>
  title: string
  desc: React.ReactNode
  delay?: number
}

const FeatureCard: React.FC<CardProps> = ({ Icon, title, desc, delay = 0 }) => (
  <Reveal delay={delay}>
    <div className="v4-lift group relative flex gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm hover:border-orange-500/25 hover:bg-white/[0.045]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-all duration-500 group-hover:scale-105 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-[0_14px_28px_-10px_rgba(249,115,22,0.7)]">
        <Icon size={22} />
      </div>
      <div className="min-w-0 space-y-1.5">
        <h4 className="text-lg font-bold text-white transition-colors group-hover:text-orange-400">{title}</h4>
        <p className="text-base leading-relaxed text-slate-400">{desc}</p>
      </div>
    </div>
  </Reveal>
)

export const ManualStrategicV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('manual-strategic')

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#070d1d] via-[#060b1a] to-[#030712] text-slate-100 antialiased">
      <DarkBackdrop orbs="orange" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Texto */}
          <div className="relative z-10 flex flex-col lg:col-span-6">
            <Reveal>
              <Kicker tone="dark">{section?.texts.badge || 'A ferramenta estratégica'}</Kicker>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-[2.8rem] md:leading-[1.08]">
                {section?.texts.title || 'Manual Solar Buy-Side'}
              </h2>
            </Reveal>
            <Reveal delay={170}>
              <p className="mt-5 max-w-md border-l-2 border-orange-500 pl-5 text-lg font-medium leading-relaxed text-slate-300 md:text-xl">
                {section?.texts.subtitle || 'A ferramenta estratégica que todo vendedor do setor solar precisa ter.'}
              </p>
            </Reveal>

            <Reveal delay={250} className="mt-8 max-w-2xl space-y-5 text-lg font-medium leading-relaxed text-slate-400">
              <p>
                {section?.texts.description1 ||
                  'O Manual de Compra Solar Buy-Side é uma leitura essencial para profissionais do setor de vendas (Sell-Side) que desejam se destacar em um mercado ultracompetitivo.'}
              </p>
              <p>
                {section?.texts.description2 ||
                  'Ao proporcionar uma imersão na jornada de compra sob a ótica do comprador, este manual oferece uma compreensão estratégica dos critérios, motivações e desafios enfrentados pelo lado comprador (Buy-Side).'}
              </p>
              <p>
                {section?.texts.description3 ||
                  'Ao dominar o conceito Buy-Side, vendedores estarão aptos a lapidar sua abordagem comercial, entregar valor real, distanciar-se da briga por preço e elevar sua credibilidade no relacionamento com os clientes.'}
              </p>
            </Reveal>

            <Reveal delay={330} className="mt-10">
              <Cta size="lg" onClick={() => scrollToId('oferta')}>
                {section?.texts.ctaButton || 'QUERO VENDER COM ESTRATÉGIA AVANÇADA'}
                <CtaArrow size={20} />
              </Cta>
            </Reveal>
          </div>

          {/* Imagem do manual */}
          <div className="flex justify-center pt-4 lg:col-span-6 lg:sticky lg:top-24 lg:justify-end">
            <Reveal delay={180}>
              <div className="group relative">
                <div
                  className="absolute -inset-16 rounded-full bg-orange-500/35 blur-[120px] transition-colors duration-700 group-hover:bg-orange-500/45"
                  aria-hidden
                />
                <img
                  src={section?.images.manualImage || '/assets/Capa-manual-buy-side-definitiva.png'}
                  alt="Manual Solar Buy-Side"
                  className="relative h-auto w-[540px] max-w-full transition-transform duration-700 ease-out group-hover:scale-[1.025] group-hover:-rotate-1"
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>
        </div>

        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" aria-hidden />

        {/* Resultados */}
        <Reveal className="max-w-4xl">
          <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-white md:text-[2.5rem] md:leading-[1.2]">
            <CMSText
              value={
                section?.texts.section2Title?.trim()
                  ? section.texts.section2Title
                  : 'Veja os resultados <span class="cms-orange">concretos</span> que você pode alcançar ao aplicar o <span class="cms-orange">Manual Solar Buy-Side</span> no seu processo de venda.'
              }
            />
          </h2>
          {section?.texts.section2Subtitle && (
            <p className="mt-4 text-xl font-medium text-slate-400 md:text-2xl">{section.texts.section2Subtitle}</p>
          )}
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Reveal as="header" className="flex items-center gap-4">
              <span className="h-8 w-1 rounded-full bg-orange-500" aria-hidden />
              <h3 className="text-sm font-extrabold uppercase tracking-[0.28em] text-orange-500">
                {section?.texts.sellSideHeader || 'O que o vendedor vai dominar'}
              </h3>
            </Reveal>
            <div className="space-y-4">
              <FeatureCard
                Icon={Target}
                delay={80}
                title={section?.texts.sellCard1Title || 'Dores reais do cliente'}
                desc={section?.texts.sellCard1Desc || 'Compreende o que realmente pesa na decisão, não apenas o que ele diz na reunião.'}
              />
              <FeatureCard
                Icon={Users}
                delay={160}
                title={section?.texts.sellCard2Title || 'Postura consultiva'}
                desc={section?.texts.sellCard2Desc || 'Compreende o que realmente pesa na decisão, não apenas o que ele diz na reunião.'}
              />
              <FeatureCard
                Icon={TrendingUp}
                delay={240}
                title={section?.texts.sellCard3Title || 'Valor técnico e econômico'}
                desc={
                  section?.texts.sellCard3Desc ||
                  'Demonstra, de forma fundamentada, como o valor técnico da solução se converte em benefício econômico.'
                }
              />
            </div>
          </div>

          <div className="space-y-6">
            <Reveal as="header" className="flex items-center gap-4">
              <span className="h-8 w-1 rounded-full bg-orange-500" aria-hidden />
              <h3 className="text-sm font-extrabold uppercase tracking-[0.28em] text-orange-500">
                {section?.texts.focusHeader || 'Principais focos e habilidades'}
              </h3>
            </Reveal>
            <div className="space-y-4">
              <FeatureCard
                Icon={Layout}
                delay={80}
                title={section?.texts.focusCard1Title || 'Apresentações persuasivas'}
                desc={section?.texts.focusCard1Desc || 'Estruture propostas objetivas e transparentes que facilitam a decisão do cliente.'}
              />
              <FeatureCard
                Icon={BarChart3}
                delay={160}
                title={section?.texts.focusCard2Title || 'Domine a Venda'}
                desc={section?.texts.focusCard2Desc || 'Conquiste autoridade e crie conexões reais para fechar mais negócios.'}
              />
              <FeatureCard
                Icon={MinusCircle}
                delay={240}
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
