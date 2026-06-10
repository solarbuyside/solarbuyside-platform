import React, { useState } from 'react'
import { Award, Check, ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Cta, CtaArrow, GrainOverlay, Kicker, Reveal } from './atoms'
import { scrollToId } from './scroll'

type BuyerTestimonial = {
  name: string
  role: string
  location: string
  avatar: string
  objectPosition: string
  reviewTitle: React.ReactNode
  quote: string
  highlight: string
}

const DEFAULT_TESTIMONIALS: BuyerTestimonial[] = [
  {
    name: 'Ricardo',
    role: 'Empresário',
    location: 'São Paulo, SP',
    avatar: '/assets/Ricardo 1.png',
    objectPosition: '50% 50%',
    reviewTitle: (
      <>
        <span className="text-orange-500">Errar</span> na escolha de um <span className="text-orange-500">fornecedor</span>{' '}
        pode gerar prejuízo enorme.
      </>
    ),
    quote:
      'No mundo dos negócios, errar na escolha de um fornecedor pode gerar um prejuízo enorme. O manual foi indispensável para evitar armadilhas, ensinando-me a identificar empresas despreparadas e equipamentos duvidosos. Aprendi a buscar parceiros que garantem suporte técnico e manutenção contínua. Graças ao Solar Buy-Side, fechei negócio com a melhor empresa: meu investimento de R$ 195 mil foi muito bem aplicado.',
    highlight: 'Mais que um guia, o Manual é o seguro que todo empresário precisa para investir com risco controlado.',
  },
  {
    name: 'Guilherme',
    role: 'Particular',
    location: 'Santana de Parnaíba, SP',
    avatar: '/assets/empresariomanualk.png',
    objectPosition: '50% 50%',
    reviewTitle: (
      <>
        Decisão <span className="text-orange-500">segura</span> em investimento <span className="text-orange-500">complexo</span>.
      </>
    ),
    quote:
      'Minha casa tem consumo alto e a região sofre com apagões que duram horas. Decidi por um sistema híbrido com baterias, um investimento de alta complexidade técnica, e usei o Manual para conduzir a avaliação das propostas e a decisão final. Investimento desse porte pede método, não intuição.',
    highlight: 'Para quem busca segurança e ganho de tempo, recomendo com total confiança.',
  },
  {
    name: 'Jorge Luiz',
    role: 'Empresário',
    location: 'Rio de Janeiro, RJ',
    avatar: '/assets/jorge of_cleanup.png',
    objectPosition: '50% 100%',
    reviewTitle: (
      <>
        O manual foi o <span className="text-orange-500">divisor de águas</span>.
      </>
    ),
    quote:
      'Viver no Rio é aquilo: você tem que estar sempre ligado pra não cair em furada. Quando precisei cortar os custos fixos da minha metalúrgica, confesso que travei, porque de energia solar eu não entendia nada. O manual foi o divisor de águas; me deu o mapa da mina pra estudar as propostas e descartar de cara quem estava só no gogó. Investi R$ 188 mil com total segurança e o alívio já chegou no bolso.',
    highlight: 'O Manual valeu demais! Recomendo mesmo!',
  },
  {
    name: 'Rogério',
    role: 'Particular',
    location: 'Campinas, SP',
    avatar: '/assets/Rogerio_cleanup.png',
    objectPosition: '50% 100%',
    reviewTitle: (
      <>
        O manual valeu <span className="text-orange-500">cada página</span>.
      </>
    ),
    quote:
      'Eu nunca tinha tido contato com energia solar e temia errar. As 4 fases da jornada me deram a ordem certa das perguntas, e o índice com 160 tópicos resolvia cada dúvida na hora. Fechei com a empresa certa, pelo preço justo, sabendo exatamente o que estava assinando.',
    highlight: 'Sem exagero: o Manual Solar Buy-Side valeu cada página.',
  },
  {
    name: 'Lucineide',
    role: 'Particular',
    location: 'Recife, PE',
    avatar: '/assets/Lucineide 1.png',
    objectPosition: '50% 100%',
    reviewTitle: (
      <>
        Esse Manual foi <span className="text-orange-500">realmente</span> um <span className="text-orange-500">passo a passo</span>{' '}
        arretado!
      </>
    ),
    quote:
      'Morando sozinha, a quantidade de empresas e tecnologias me deixava insegura. Seguindo as etapas do manual, aprendi a avaliar propostas e a descartar o que era bom demais para ser verdade. Instalei meu sistema de R$ 28 mil sabendo exatamente o que estava comprando.',
    highlight: 'O Solar Buy-Side me deu a segurança para decidir sem arrependimentos.',
  },
  {
    name: 'Edivaldo',
    role: 'Produtor Rural',
    location: 'Sinop, MT',
    avatar: '/assets/Edivaldo.png',
    objectPosition: '50% 100%',
    reviewTitle: (
      <>
        O Manual me deu <span className="text-orange-500">segurança</span> para investir{' '}
        <span className="whitespace-nowrap text-orange-500">R$ 248 mil</span>.
      </>
    ),
    quote:
      'Sou produtor rural em Sinop/MT e decidi instalar energia solar devido ao alto consumo na irrigação e maquinários. Com a expansão da lavoura, a conta de luz pesava muito. O Manual Solar Buy-Side foi essencial nesse processo: me ensinou a comparar propostas tecnicamente e evitar erros caros que eu nem conhecia. O conteúdo me deu a segurança necessária para realizar um investimento de R$ 248 mil.',
    highlight: 'Realmente é uma ferramenta indispensável para quem busca eficiência no campo e proteção do capital.',
  },
]

export const BuyerWaveV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('buyer-wave')
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonials: BuyerTestimonial[] = DEFAULT_TESTIMONIALS.map((item, index) => {
    const itemIndex = index + 1
    return {
      name: section?.texts[`testimonial${itemIndex}Name`] || item.name,
      role: section?.texts[`testimonial${itemIndex}Role`] || item.role,
      location: section?.texts[`testimonial${itemIndex}Location`] || item.location,
      avatar: section?.images[`testimonial${itemIndex}Avatar`] || item.avatar,
      objectPosition: section?.texts[`testimonial${itemIndex}ObjectPosition`] || item.objectPosition,
      reviewTitle: section?.texts[`testimonial${itemIndex}ReviewTitle`]
        ? section.texts[`testimonial${itemIndex}ReviewTitle`]
        : item.reviewTitle,
      quote: section?.texts[`testimonial${itemIndex}Quote`] || item.quote,
      highlight: section?.texts[`testimonial${itemIndex}Highlight`] || item.highlight,
    }
  })

  const [quoteExpanded, setQuoteExpanded] = useState(false)

  const total = testimonials.length
  const goTo = (index: number) => {
    setQuoteExpanded(false)
    setActiveTestimonial(index)
  }
  const next = () => goTo((activeTestimonial + 1) % testimonials.length)
  const prev = () => goTo((activeTestimonial - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0705] to-[#07090d] py-24 text-white antialiased md:py-32">
      <GrainOverlay />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Cabeçalho */}
        <div className="text-center">
          <Reveal>
            <Kicker tone="dark">{section?.texts.badge || 'Guia do Comprador'}</Kicker>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mx-auto mt-5 max-w-3xl font-['Sora'] text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              <CMSText
                value={
                  section?.texts.title?.trim()
                    ? section.texts.title
                    : 'O outro lado da mesa <span class="cms-orange">já está estudando</span>. Veja o que os compradores aprendem no Manual.'
                }
              />
            </h2>
          </Reveal>
          <Reveal delay={170}>
            <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-slate-400">
              {section?.texts.subtitle || 'Compradores estão evoluindo. Veja o que eles estarão aprendendo em breve.'}
            </p>
          </Reveal>
        </div>

        {/* Duas colunas de conhecimento — índice editorial, sem cards */}
        <div className="mt-16 grid border-y border-white/[0.08] lg:grid-cols-2 lg:divide-x lg:divide-white/[0.08]">
          <Reveal className="py-12 lg:pl-0 lg:pr-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08]">
              <Award className="text-blue-500" size={22} />
            </div>
            <h3 className="mt-5 font-['Sora'] text-2xl font-bold tracking-tight text-white">
              {section?.texts.card1Title || 'O que o comprador está aprendendo'}
            </h3>
            <ul className="mt-3">
              {[
                section?.texts.card1Item1 || 'Conceitos essenciais para uma compra técnica e segura',
                section?.texts.card1Item2 || 'Reconhecimento de marcas e distribuidores de alta confiança',
                section?.texts.card1Item3 || 'Critérios para selecionar empresas sérias e competentes',
              ].map((item) => (
                <li key={item} className="flex items-start gap-4 border-b border-white/[0.06] py-4 last:border-b-0">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <Check size={13} className="text-blue-400" />
                  </span>
                  <span className="text-lg font-medium leading-relaxed text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={110} className="py-12 lg:pl-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08]">
              <Target className="text-orange-500" size={22} />
            </div>
            <h3 className="mt-5 font-['Sora'] text-2xl font-bold tracking-tight text-white">
              {section?.texts.card2Title || 'Principais focos e Habilidades'}
            </h3>
            <ul className="mt-3">
              {[
                section?.texts.card2Item1 || 'Analisar propostas com critérios técnicos e financeiros',
                section?.texts.card2Item2 || 'Avaliar reputação e suporte de pós-venda com precisão',
                section?.texts.card2Item3 || 'Tomar decisão com segurança e embasamento técnico',
              ].map((item) => (
                <li key={item} className="flex items-start gap-4 border-b border-white/[0.06] py-4 last:border-b-0">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                    <Check size={13} className="text-orange-400" />
                  </span>
                  <span className="text-lg font-medium leading-relaxed text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Deck de depoimentos */}
        <div className="mt-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {section?.texts.testimonialsTitle || 'As vozes de quem aprendeu'}
              </h2>
              <p className="mt-2 text-lg text-slate-400">
                {section?.texts.testimonialsSubtitle || 'Relatos de compradores informados e preparados'}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <span className="v4-mono text-2xl text-slate-500 md:text-3xl">
                {String(activeTestimonial + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={prev}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-all duration-300 hover:border-orange-400 hover:text-orange-400 active:scale-90"
                  type="button"
                  aria-label="Depoimento anterior"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={next}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-all duration-300 hover:border-orange-400 hover:text-orange-400 active:scale-90"
                  type="button"
                  aria-label="Próximo depoimento"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative mt-10 min-h-[660px] md:min-h-[460px]">
              {testimonials.map((t, idx) => {
                const offset = (idx - activeTestimonial + total) % total
                const deckPose =
                  offset === 0
                    ? 'z-30 translate-y-0 rotate-0 scale-100 opacity-100'
                    : offset === 1
                      ? 'z-20 translate-y-7 rotate-[1.5deg] scale-[0.97] opacity-50'
                      : offset === 2
                        ? 'z-10 translate-y-14 rotate-[-1deg] scale-[0.94] opacity-25'
                        : 'pointer-events-none scale-[0.9] opacity-0'

                return (
                  <div key={t.name} className={`absolute inset-0 transition-all duration-700 ${deckPose}`}>
                    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e0c10] md:grid-cols-[230px_1fr] md:grid-rows-1">
                      <div className="relative">
                        <img
                          src={t.avatar}
                          className="h-52 w-full object-cover md:h-full"
                          style={{ objectPosition: t.objectPosition || 'center' }}
                          alt={t.name}
                          loading="lazy"
                        />
                        <div
                          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0e0c10]/90 to-transparent"
                          aria-hidden
                        />
                        <div className="absolute bottom-4 left-4 pr-4">
                          <p className="font-['Sora'] text-lg font-bold tracking-tight text-white">{t.name}</p>
                          <div className="v4-mono mt-1 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-slate-300">
                            <span>{t.role}</span>
                            <span className="h-1 w-1 rounded-full bg-white/50" aria-hidden />
                            <span>{t.location}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex flex-col gap-4 p-7 md:justify-center md:p-9 ${
                          quoteExpanded && idx === activeTestimonial ? 'overflow-y-auto' : ''
                        }`}
                      >
                        <h4 className="font-['Sora'] text-xl font-bold leading-tight text-white md:text-2xl">
                          {t.reviewTitle}
                        </h4>
                        <p
                          className={`text-sm leading-relaxed text-slate-400 md:line-clamp-none md:text-base ${
                            quoteExpanded && idx === activeTestimonial ? '' : 'line-clamp-[6]'
                          }`}
                        >
                          {t.quote}
                        </p>
                        {idx === activeTestimonial && (
                          <button
                            type="button"
                            onClick={() => setQuoteExpanded((v) => !v)}
                            className="-mt-2 self-start text-xs font-bold uppercase tracking-wide text-orange-400 md:hidden"
                          >
                            {quoteExpanded ? 'Recolher' : 'Ler depoimento completo'}
                          </button>
                        )}
                        <div className="border-t border-white/[0.08] pt-4">
                          <p className="v4-serif text-lg text-amber-200/90 md:text-xl">"{t.highlight}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Reveal>

          {/* Indicadores */}
          <div className="mt-6 flex justify-center">
            {testimonials.map((t, idx) => (
              <button
                key={t.name}
                type="button"
                aria-label={`Ver depoimento de ${t.name}`}
                onClick={() => goTo(idx)}
                className="group flex items-center justify-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeTestimonial ? 'w-7 bg-orange-500' : 'w-1.5 bg-white/20 group-hover:bg-white/40'
                  }`}
                />
              </button>
            ))}
          </div>

          <Reveal delay={120} className="mt-12 text-center">
            <Cta size="lg" variant="ghost-dark" onClick={() => scrollToId('oferta')}>
              {section?.texts.ctaButton || 'Quero esse conhecimento do meu lado'}
              <CtaArrow size={20} />
            </Cta>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
