import React, { useState } from 'react'
import { ArrowRight, Settings2, ShieldCheck, Target, UserCheck } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { GrainOverlay, Reveal } from './atoms'

export const SellerCodeV4: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { getSection } = useContent()
  const section = getSection('seller-code')

  const contentItems = [
    {
      title: section?.texts.item1Title || 'Índice de Confiabilidade',
      desc: section?.texts.item1Desc || 'Aprenda a medir e provar a segurança da sua proposta de forma estruturada e profissional.',
      Icon: ShieldCheck,
    },
    {
      title: section?.texts.item2Title || 'Ajuste de Precisão com Checklist',
      desc:
        section?.texts.item2Desc ||
        'Refine seus materiais de vendas com base no que compradores realmente avaliam (e o que eles descartam).',
      Icon: Settings2,
    },
    {
      title: section?.texts.item3Title || 'Estratégia Anti-Leilão',
      desc:
        section?.texts.item3Desc ||
        'Saiba exatamente como agir com clientes focados apenas em preço e recupere sua margem de lucro.',
      Icon: Target,
    },
    {
      title: section?.texts.item4Title || 'Postura Consultiva de Elite',
      desc:
        section?.texts.item4Desc ||
        'Não dispute por preço, dispute por valor. Ajude o cliente a decidir com segurança e fortaleça uma relação de longo prazo.',
      Icon: UserCheck,
    },
  ]

  const bookImage = section?.images.bookImage || section?.images.book || '/assets/foto-o-codigo-do-vendedor.png'

  /* Painel dark do livro — ponte visual para o ato IV (versão compacta no mobile) */
  const bookPanel = (compact: boolean) => (
    <div
      className={`relative w-full overflow-hidden bg-[#0b0a08] ${
        compact ? 'mx-auto max-w-[400px] rounded-[2rem] p-7' : 'rounded-[2.5rem] p-10'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.15) 0%, transparent 70%)' }}
        aria-hidden
      />
      <GrainOverlay />
      <img src={bookImage} alt="O Código Oficial" className="v4-float relative z-10 h-auto w-full" loading="lazy" />
    </div>
  )

  return (
    <section className="relative bg-[#f2ece1] py-20 pb-44 text-[#181410] md:py-24 md:pb-44">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          {/* Narrativa + bônus + lista-índice */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="font-['Sora'] text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-[#181410]">
                {section?.texts.title || 'O Segredo por trás dos resultados:'}{' '}
                <span className="v4-serif text-orange-600">
                  {section?.texts.titleHighlight || 'O Código do Vendedor Consultivo'}
                </span>
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-6 border-l-2 border-[#181410]/20 pl-5 text-xl leading-relaxed text-[#4f463c]">
                {section?.texts.subtitle ||
                  'O sucesso do Rodrigo não foi por acaso. Além de aplicar o Manual Solar Buy-Side, ele incorporou a estratégia que inverte o jogo: pensar como um comprador para conduzir a venda.'}
              </p>
            </Reveal>

            {/* Bônus */}
            <Reveal delay={180} className="mt-12">
              <h3 className="inline-block rotate-[-1.5deg] rounded-xl bg-[#181410] px-6 py-2.5 font-['Sora'] text-xl font-extrabold tracking-tight text-[#f2ece1] shadow-[6px_6px_0_0_#f97316] md:text-2xl">
                {section?.texts.bonusTitle || 'BÔNUS EXCLUSIVO'}
              </h3>
              <p className="v4-serif mt-5 text-xl leading-relaxed text-[#4f463c] md:text-2xl">
                {section?.texts.bonusSubtitle ||
                  'O método de imersão no Manual Solar Buy-Side para quem não aceita mais perder vendas por preço.'}
              </p>
            </Reveal>

            {/* Livro no mobile */}
            <Reveal delay={90} className="mt-12 lg:hidden">
              {bookPanel(true)}
            </Reveal>

            {/* Lista interativa */}
            <Reveal delay={120} className="mt-12">
              <h4 className="border-b border-[#181410]/15 pb-3">
                <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#4f463c]/70">
                  {section?.texts.listTitle || section?.texts.listHeader || 'O que você leva do Código:'}
                </span>
              </h4>
              <div onMouseLeave={() => setHoveredIndex(null)}>
                {contentItems.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className={`grid cursor-default grid-cols-[64px_1fr] gap-5 border-b border-[#181410]/10 py-6 transition-all duration-500 ${
                      hoveredIndex !== null && hoveredIndex !== idx ? 'opacity-40' : 'opacity-100'
                    }`}
                  >
                    <div className="flex flex-col items-start gap-2.5 pt-1">
                      <span
                        className={`v4-mono text-2xl font-bold leading-none transition-colors duration-500 ${
                          hoveredIndex === idx ? 'text-orange-600' : 'text-[#181410]/25'
                        }`}
                      >
                        {`0${idx + 1}`}
                      </span>
                      <item.Icon
                        size={18}
                        className={`transition-colors duration-500 ${
                          hoveredIndex === idx ? 'text-orange-600' : 'text-[#181410]/30'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="flex items-center gap-3 font-['Sora'] text-xl font-bold tracking-tight text-[#181410]">
                        {item.title}
                        <ArrowRight
                          size={16}
                          className={`shrink-0 transition-all duration-300 ${
                            hoveredIndex === idx ? 'translate-x-1 text-orange-600 opacity-100' : '-translate-x-2 opacity-0'
                          }`}
                        />
                      </h5>
                      <p className="max-w-lg text-lg leading-relaxed text-[#4f463c]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Painel dark do livro no desktop — acompanha em sticky enquanto a
              coluna de texto rola; solta quando a seção termina. O sticky fica
              num wrapper limpo (o Reveal tem will-change/transform, que
              quebraria o grude se fosse o próprio nó sticky). */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="lg:sticky lg:top-24">
              <Reveal delay={200} className="ml-auto w-full max-w-[440px]">
                {bookPanel(false)}
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
