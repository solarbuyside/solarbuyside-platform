import React, { useState } from 'react'
import { ArrowRight, Settings2, ShieldCheck, Sparkles, Target, UserCheck } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Reveal } from './atoms'

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

  const bookFigure = (
    <div className="group relative w-full max-w-[420px]">
      <div
        className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/40 blur-[110px]"
        aria-hidden
      />
      <img
        src={bookImage}
        alt="O Código Oficial"
        className="relative h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] group-hover:rotate-1"
        loading="lazy"
      />
    </div>
  )

  return (
    <section className="relative overflow-hidden bg-[#fafaf8] text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Narrativa + lista */}
          <div className="space-y-12 lg:col-span-7">
            <div className="space-y-5">
              <Reveal>
                <h2 className="text-3xl font-extrabold leading-[1.12] tracking-tight text-slate-900 md:text-[2.7rem]">
                  {section?.texts.title || 'O Segredo por trás dos resultados:'}{' '}
                  <span className="v4-grad-text">{section?.texts.titleHighlight || 'O Código do Vendedor Consultivo'}</span>
                </h2>
              </Reveal>
              <Reveal delay={110}>
                <p className="border-l-2 border-orange-200 pl-6 text-lg font-medium leading-relaxed text-slate-500 md:text-xl">
                  {section?.texts.subtitle ||
                    'O sucesso do Rodrigo não foi por acaso. Além de aplicar o Manual Solar Buy-Side, ele dominou a estratégia que inverte o jogo: aprender a pensar como um comprador para dominar a venda.'}
                </p>
              </Reveal>
            </div>

            {/* Bônus */}
            <Reveal delay={150}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Sparkles size={15} />
                </span>
                <span>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    {section?.texts.badge || 'Oferta Especial'}
                  </span>
                  {section?.texts.badgeHighlight ? (
                    <span className="block text-base font-bold uppercase tracking-tight text-slate-900">
                      {section.texts.badgeHighlight}
                    </span>
                  ) : null}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                {section?.texts.bonusTitle || 'BÔNUS EXCLUSIVO'}
              </h3>
              <p className="mt-2 text-lg font-medium leading-relaxed text-slate-500 md:text-xl">
                {section?.texts.bonusSubtitle ||
                  'O método de imersão no Manual Solar Buy-Side para quem não aceita mais perder vendas por preço.'}
              </p>
            </Reveal>

            {/* Livro no mobile */}
            <Reveal className="flex justify-center lg:hidden">{bookFigure}</Reveal>

            {/* Lista interativa */}
            <Reveal delay={120}>
              <h4 className="mb-2 border-b border-slate-200 pb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                {section?.texts.listTitle || section?.texts.listHeader || 'O que você vai dominar:'}
              </h4>
              <div onMouseLeave={() => setHoveredIndex(null)}>
                {contentItems.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className={`group cursor-default border-b border-slate-200/80 py-5 transition-all duration-500 ${
                      hoveredIndex !== null && hoveredIndex !== idx ? 'opacity-35' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                          hoveredIndex === idx ? 'bg-orange-500 text-white shadow-[0_12px_24px_-10px_rgba(249,115,22,0.7)]' : 'bg-white text-slate-300 shadow-sm'
                        }`}
                      >
                        <item.Icon size={19} />
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="flex items-center gap-3 text-lg font-bold text-slate-900 md:text-xl">
                          {item.title}
                          <ArrowRight
                            size={16}
                            className={`transition-all duration-300 ${
                              hoveredIndex === idx ? 'translate-x-1 text-orange-500 opacity-100' : '-translate-x-2 opacity-0'
                            }`}
                          />
                        </h5>
                        <p className="max-w-lg text-base leading-relaxed text-slate-500 md:text-lg">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Livro no desktop */}
          <div className="hidden lg:col-span-5 lg:flex lg:items-start lg:justify-end">
            <Reveal delay={200} className="lg:sticky lg:top-28 flex w-full justify-end">
              {bookFigure}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
