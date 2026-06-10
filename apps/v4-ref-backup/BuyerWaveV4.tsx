import React, { useState } from 'react'
import { Award, Check, ChevronLeft, ChevronRight, Target } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Cta, CtaArrow, Reveal } from './atoms'
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
      'Resido na região de São Paulo, em uma residência de grande porte, com elevado consumo elétrico e exposta a apagões frequentes, que podem durar horas ou dias. Para reduzir a fatura e garantir conforto energético, optei pela instalação de um sistema solar híbrido com baterias. Para embasar um investimento de alta complexidade técnica e valor, utilizei com sucesso o Manual de Compra Solar Buy-Side, que orientou todo o processo de avaliação e decisão.',
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
      'Eu nunca tinha tido contato com energia solar e temia tomar a decisão errada, mas o conteúdo claro e estruturado mudou tudo. As 4 fases da jornada de compra foram essenciais e o índice interativo, com mais de 160 tópicos, sanou todas as minhas dúvidas instantaneamente. No fim, escolhi a empresa certa e o sistema ideal pelo preço justo, conduzindo a negociação com total autoridade e segurança.',
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
      'Morando sozinha, a variedade de empresas e tecnologias me deixava insegura. O manual foi o guia fundamental: seguindo cada etapa, aprendi a avaliar propostas e descartar o que era bom demais para ser verdade. Com total convicção, instalei meu sistema de R$ 28 mil. O passo a passo foi "arretado"! No final, fui até elogiada pelos vendedores; eles nunca tinham encontrado uma mulher com tanto conhecimento técnico.',
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

  const active = testimonials[activeTestimonial]
  const next = () => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
  const prev = () => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="bg-[#f4f4f2] text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        {/* Cabeçalho */}
        <div className="mb-12 text-center">
          <Reveal>
            <span className="v4-kicker justify-center text-orange-600">{section?.texts.badge || 'Guia do Comprador'}</span>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
              <CMSText
                value={
                  section?.texts.title?.trim()
                    ? section.texts.title
                    : 'Descubra o que o manual ensina aos <span class="cms-orange">compradores</span> e entenda as <span class="cms-orange">novas regras</span> do jogo'
                }
              />
            </h2>
          </Reveal>
          <Reveal delay={170}>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl">
              {section?.texts.subtitle || 'Compradores estão evoluindo. Veja o que eles estarão aprendendo em breve.'}
            </p>
          </Reveal>
        </div>

        {/* Cards lado comprador */}
        <div className="grid gap-7 md:grid-cols-2">
          <Reveal>
            <div className="v4-lift flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_30px_60px_-28px_rgba(37,99,235,0.3)]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <Award className="text-blue-600" size={24} />
              </div>
              <h3 className="mb-5 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                {section?.texts.card1Title || 'O que o comprador vai dominar?'}
              </h3>
              <ul className="flex-grow space-y-3.5">
                {[
                  section?.texts.card1Item1 || 'Conceitos essenciais para uma compra técnica e segura',
                  section?.texts.card1Item2 || 'Reconhecimento de marcas e distribuidores de alta confiança',
                  section?.texts.card1Item3 || 'Critérios para selecionar empresas sérias e competentes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3.5 text-slate-600">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50">
                      <Check size={14} className="text-blue-600" />
                    </span>
                    <span className="text-base font-medium leading-relaxed md:text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <div className="v4-lift flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-[0_30px_60px_-28px_rgba(249,115,22,0.3)]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                <Target className="text-orange-500" size={24} />
              </div>
              <h3 className="mb-5 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                {section?.texts.card2Title || 'Principais focos e Habilidades'}
              </h3>
              <ul className="flex-grow space-y-3.5">
                {[
                  section?.texts.card2Item1 || 'Analisar propostas com critérios técnicos e financeiros',
                  section?.texts.card2Item2 || 'Avaliar reputação e suporte de pós-venda com precisão',
                  section?.texts.card2Item3 || 'Tomar decisão com segurança e embasamento técnico',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3.5 text-slate-600">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50">
                      <Check size={14} className="text-orange-500" />
                    </span>
                    <span className="text-base font-medium leading-relaxed md:text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Carrossel de depoimentos */}
        <div className="mt-16">
          <Reveal className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                {section?.texts.testimonialsTitle || 'As vozes de quem aprendeu'}
              </h2>
              <p className="mt-2 text-lg text-slate-500">
                {section?.texts.testimonialsSubtitle || 'Relatos de compradores informados e preparados'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm transition-all duration-300 hover:border-orange-400 hover:text-orange-600 active:scale-90"
                type="button"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={next}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm transition-all duration-300 hover:border-orange-400 hover:text-orange-600 active:scale-90"
                type="button"
                aria-label="Próximo depoimento"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_40px_90px_-50px_rgba(15,23,42,0.35)] md:min-h-[360px] md:flex-row">
              <div className="relative h-[380px] w-full md:h-auto md:w-[38%]">
                <img
                  key={active.avatar}
                  src={active.avatar}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: active.objectPosition || 'center' }}
                  alt={active.name}
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/70 to-transparent" aria-hidden />
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/25 bg-white/15 px-5 py-3 text-white shadow-2xl backdrop-blur-xl">
                  <p className="text-lg font-bold tracking-tight md:text-xl">{active.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] opacity-90">
                    <span>{active.role}</span>
                    <span className="h-1 w-1 rounded-full bg-white/60" aria-hidden />
                    <span>{active.location}</span>
                  </div>
                </div>
              </div>

              <div key={activeTestimonial} className="v4-rise flex w-full flex-col justify-center gap-4 p-7 md:w-[62%] md:p-10">
                <h4 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-[1.7rem]">
                  {active.reviewTitle}
                </h4>
                <p className="text-base leading-relaxed text-slate-600 md:text-lg">{active.quote}</p>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-base font-bold leading-snug tracking-tight text-slate-900 md:text-xl">
                    "{active.highlight}"
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Indicadores */}
          <div className="mt-4 flex justify-center">
            {testimonials.map((t, idx) => (
              <button
                key={t.name}
                type="button"
                aria-label={`Ver depoimento de ${t.name}`}
                onClick={() => setActiveTestimonial(idx)}
                className="group flex items-center justify-center px-1"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    idx === activeTestimonial ? 'w-8 bg-orange-500' : 'w-2 bg-slate-300 group-hover:bg-slate-400'
                  }`}
                />
              </button>
            ))}
          </div>

          <Reveal delay={120} className="mt-10 text-center">
            <Cta size="lg" onClick={() => scrollToId('oferta')}>
              {section?.texts.ctaButton || 'ACESSAR GUIA ESTRATÉGICO AGORA'}
              <CtaArrow size={20} />
            </Cta>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
