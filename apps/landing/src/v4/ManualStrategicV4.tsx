import React from 'react'
import { BarChart3, Layout, MinusCircle, Target, TrendingUp, Users } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Cta, CtaArrow, GrainOverlay, Kicker, Reveal } from './atoms'
import { scrollToId } from './scroll'

type ItemProps = {
  Icon: React.ComponentType<{ size?: number }>
  title: string
  desc: React.ReactNode
  delay?: number
}

/* Item editorial sem caixa: anel hairline + hairline inferior, inversão laranja no hover */
const FeatureItem: React.FC<ItemProps> = ({ Icon, title, desc, delay = 0 }) => (
  <Reveal
    as="li"
    delay={delay}
    className="group grid grid-cols-[48px_1fr] gap-5 border-b border-white/[0.08] py-6 transition-transform duration-500 hover:translate-x-1"
  >
    <span
      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-orange-500 transition-all duration-500 group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white"
      aria-hidden
    >
      <Icon size={20} />
    </span>
    <div className="min-w-0 space-y-1.5">
      <h4 className="text-lg font-bold text-white">{title}</h4>
      <p className="leading-relaxed text-slate-400">{desc}</p>
    </div>
  </Reveal>
)

export const ManualStrategicV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('manual-strategic')

  const manualImage = section?.images.manualImage || '/assets/Capa-manual-buy-side-definitiva.png'

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#07090d] to-[#0b0907] text-slate-100 antialiased">
      <GrainOverlay />

      {/* pb-44: a próxima seção (paper) sobrepõe este ato com um arco */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 pb-44 md:py-32 md:pb-44">
        {/* ── Parte 1: spotlight do produto ─────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Texto */}
          <div className="relative z-10 flex flex-col lg:col-span-6">
            <Reveal>
              <Kicker tone="dark">{section?.texts.badge || 'A ferramenta estratégica'}</Kicker>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 text-[clamp(2.6rem,5vw,4.2rem)] font-extrabold leading-[1.05] tracking-tight text-white">
                {section?.texts.title || 'Manual Solar Buy-Side'}
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="v4-serif mt-5 max-w-md border-l-2 border-orange-500 pl-5 text-2xl leading-snug text-amber-200/90">
                {section?.texts.subtitle || 'A ferramenta estratégica que todo vendedor do setor solar precisa ter.'}
              </p>
            </Reveal>

            <Reveal delay={270} className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-slate-400">
              <p>
                {section?.texts.description1 ||
                  'O Manual de Compra Solar Buy-Side é uma leitura essencial para profissionais do setor de vendas (Sell-Side) que desejam se destacar em um mercado ultracompetitivo.'}
              </p>
              <p>
                {section?.texts.description2 ||
                  'Ao proporcionar uma imersão na jornada de compra sob a ótica do comprador, este manual oferece uma compreensão estratégica dos critérios, motivações e desafios enfrentados pelo lado comprador (Buy-Side).'}
              </p>
            </Reveal>

            <Reveal delay={360} className="mt-10">
              <Cta size="lg" onClick={() => scrollToId('oferta')}>
                {section?.texts.ctaButton || 'Quero vender com estratégia'}
                <CtaArrow size={20} />
              </Cta>
            </Reveal>
          </div>

          {/* Pedestal de luz: glow + capa flutuando + elipse no chão + reflexo */}
          <div className="lg:sticky lg:top-24 lg:col-span-6">
            <Reveal delay={180}>
              <div className="relative flex justify-center">
                <div className="absolute -inset-12 rounded-full bg-orange-500/25 blur-[120px]" aria-hidden />

                <div className="relative w-[390px] max-w-full">
                  <div className="relative">
                    <img
                      src={manualImage}
                      alt="Manual Solar Buy-Side"
                      className="v4-float relative h-auto w-full"
                      loading="lazy"
                    />
                    {/* Elipse de luz no chão */}
                    <div
                      className="absolute -bottom-10 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[100%] bg-orange-500/20 blur-2xl"
                      aria-hidden
                    />
                  </div>

                  {/* Reflexo espelhado */}
                  <img
                    src={manualImage}
                    alt=""
                    aria-hidden
                    className="h-40 w-full scale-y-[-1] object-cover object-bottom opacity-[0.07]"
                    style={{
                      WebkitMaskImage: 'linear-gradient(180deg, black, transparent 70%)',
                      maskImage: 'linear-gradient(180deg, black, transparent 70%)',
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" aria-hidden />

        {/* ── Parte 2: resultados ───────────────────────────────────────── */}
        <Reveal className="max-w-4xl">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-white">
            <CMSText
              value={
                section?.texts.section2Title?.trim()
                  ? section.texts.section2Title
                  : 'Veja os resultados <span class="cms-orange">concretos</span> que você pode alcançar ao aplicar o <span class="cms-orange">Método Solar Buy-Side</span> no seu processo de venda.'
              }
            />
          </h2>
          {section?.texts.section2Subtitle && (
            <p className="mt-4 text-xl font-medium text-slate-400 md:text-2xl">{section.texts.section2Subtitle}</p>
          )}
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
          <div>
            <Reveal as="header" className="flex items-center gap-4">
              <span className="h-8 w-1 rounded-full bg-orange-500" aria-hidden />
              <h3 className="text-xs uppercase tracking-[0.3em] text-orange-500">
                <span className="v4-mono font-bold">{section?.texts.sellSideHeader || 'O que o vendedor desenvolve'}</span>
              </h3>
            </Reveal>
            <ul className="mt-2">
              <FeatureItem
                Icon={Target}
                delay={80}
                title={section?.texts.sellCard1Title || 'Dores reais do cliente'}
                desc={section?.texts.sellCard1Desc || 'Compreende o que realmente pesa na decisão, não apenas o que ele diz na reunião.'}
              />
              <FeatureItem
                Icon={Users}
                delay={160}
                title={section?.texts.sellCard2Title || 'Postura consultiva'}
                desc={
                  section?.texts.sellCard2Desc ||
                  'Conduz a conversa como conselheiro técnico, não como tirador de pedido. O cliente percebe a diferença logo na primeira reunião.'
                }
              />
              <FeatureItem
                Icon={TrendingUp}
                delay={240}
                title={section?.texts.sellCard3Title || 'Valor técnico e econômico'}
                desc={
                  section?.texts.sellCard3Desc ||
                  'Demonstra, de forma fundamentada, como o valor técnico da solução se converte em benefício econômico.'
                }
              />
            </ul>
          </div>

          <div>
            <Reveal as="header" className="flex items-center gap-4">
              <span className="h-8 w-1 rounded-full bg-orange-500" aria-hidden />
              <h3 className="text-xs uppercase tracking-[0.3em] text-orange-500">
                <span className="v4-mono font-bold">{section?.texts.focusHeader || 'Principais focos e habilidades'}</span>
              </h3>
            </Reveal>
            <ul className="mt-2">
              <FeatureItem
                Icon={Layout}
                delay={80}
                title={section?.texts.focusCard1Title || 'Apresentações persuasivas'}
                desc={section?.texts.focusCard1Desc || 'Estruture propostas objetivas e transparentes que facilitam a decisão do cliente.'}
              />
              <FeatureItem
                Icon={BarChart3}
                delay={160}
                title={section?.texts.focusCard2Title || 'Autoridade na mesa'}
                desc={section?.texts.focusCard2Desc || 'Constrói autoridade e conexões reais, que fecham negócio sem desconto.'}
              />
              <FeatureItem
                Icon={MinusCircle}
                delay={240}
                title={section?.texts.focusCard3Title || 'Menos desconto, mais margem'}
                desc={section?.texts.focusCard3Desc || 'Argumente com precisão e preserve sua comissão sem perder vendas.'}
              />
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
