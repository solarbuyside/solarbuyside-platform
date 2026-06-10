import React, { useState } from 'react'
import {
  ArrowRight,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from './CMSText'

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
        <span className="text-[#F97316]">Errar</span> na escolha de um <span className="text-[#F97316]">fornecedor</span> pode gerar prejuízo enorme.
      </>
    ),
    quote:
      'No mundo dos negócios, errar na escolha de um fornecedor pode gerar um prejuízo enorme. O manual foi indispensável para evitar armadilhas, ensinando-me a identificar empresas despreparadas e equipamentos duvidosos. Aprendi a buscar parceiros que garantem suporte técnico e manutenção contínua. Graças ao Solar Buy-Side, fechei negócio com a melhor empresa: meu investimento de R$ 195 mil foi muito bem aplicado.',
    highlight:
      'Mais que um guia, o Manual é o seguro que todo empresário precisa para investir com risco controlado.',
  },
  {
    name: 'Guilherme',
    role: 'Particular',
    location: 'Santana de Parnaíba, SP',
    avatar: '/assets/empresariomanualk.png',
    objectPosition: '50% 50%',
    reviewTitle: (
      <>
        Decisão <span className="text-[#F97316]">segura</span> em investimento <span className="text-[#F97316]">complexo</span>.
      </>
    ),
    quote:
      'Resido na região de São Paulo, em uma residência de grande porte, com elevado consumo elétrico e exposta a apagões frequentes, que podem durar horas ou dias. Para reduzir a fatura e garantir conforto energético, optei pela instalação de um sistema solar híbrido com baterias. Para embasar um investimento de alta complexidade técnica e valor, utilizei com sucesso o Manual de Compra Solar Buy-Side, que orientou todo o processo de avaliação e decisão.',
    highlight:
      'Para quem busca segurança e ganho de tempo, recomendo com total confiança.',
  },
  {
    name: 'Jorge Luiz',
    role: 'Empresário',
    location: 'Rio de Janeiro, RJ',
    avatar: '/assets/jorge of_cleanup.png',
    objectPosition: '50% 100%',
    reviewTitle: (
      <>
        O manual foi o <span className="text-[#F97316]">divisor de águas</span>.
      </>
    ),
    quote:
      'Viver no Rio é aquilo: você tem que estar sempre ligado pra não cair em furada. Quando precisei cortar os custos fixos da minha metalúrgica, confesso que travei, porque de energia solar eu não entendia nada. O manual foi o divisor de águas; me deu o mapa da mina pra estudar as propostas e descartar de cara quem estava só no gogó. Investi R$ 188 mil com total segurança e o alívio já chegou no bolso.',
    highlight:
      'O Manual valeu demais! Recomendo mesmo!',
  },
  {
    name: 'Rogério',
    role: 'Particular',
    location: 'Campinas, SP',
    avatar: '/assets/Rogerio_cleanup.png',
    objectPosition: '50% 100%',
    reviewTitle: (
      <>
        O manual valeu <span className="text-[#F97316]">cada página</span>.
      </>
    ),
    quote:
      'Eu nunca tinha tido contato com energia solar e temia tomar a decisão errada, mas o conteúdo claro e estruturado mudou tudo. As 4 fases da jornada de compra foram essenciais e o índice interativo, com mais de 160 tópicos, sanou todas as minhas dúvidas instantaneamente. No fim, escolhi a empresa certa e o sistema ideal pelo preço justo, conduzindo a negociação com total autoridade e segurança.',
    highlight:
      'Sem exagero: o Manual Solar Buy-Side valeu cada página.',
  },
  {
    name: 'Lucineide',
    role: 'Particular',
    location: 'Recife, PE',
    avatar: '/assets/Lucineide 1.png',
    objectPosition: '50% 100%',
    reviewTitle: (
      <>
        Esse Manual foi <span className="text-[#F97316]">realmente</span> um <span className="text-[#F97316]">passo a passo</span> arretado!
      </>
    ),
    quote:
      'Morando sozinha, a variedade de empresas e tecnologias me deixava insegura. O manual foi o guia fundamental: seguindo cada etapa, aprendi a avaliar propostas e descartar o que era bom demais para ser verdade. Com total convicção, instalei meu sistema de R$ 28 mil. O passo a passo foi "arretado"! No final, fui até elogiada pelos vendedores; eles nunca tinham encontrado uma mulher com tanto conhecimento técnico.',
    highlight:
      'O Solar Buy-Side me deu a segurança para decidir sem arrependimentos.',
  },
  {
    name: 'Edivaldo',
    role: 'Produtor Rural',
    location: 'Sinop, MT',
    avatar: '/assets/Edivaldo.png',
    objectPosition: '50% 100%',
    reviewTitle: (
      <>
        O Manual me deu <span className="text-[#F97316]">segurança</span> para investir <span className="text-[#F97316] whitespace-nowrap">R$ 248 mil</span>.
      </>
    ),
    quote:
      'Sou produtor rural em Sinop/MT e decidi instalar energia solar devido ao alto consumo na irrigação e maquinários. Com a expansão da lavoura, a conta de luz pesava muito. O Manual Solar Buy-Side foi essencial nesse processo: me ensinou a comparar propostas tecnicamente e evitar erros caros que eu nem conhecia. O conteúdo me deu a segurança necessária para realizar um investimento de R$ 248 mil.',
    highlight:
      'Realmente é uma ferramenta indispensável para quem busca eficiência no campo e proteção do capital.',
  },
]

export const BuyerWaveSection: React.FC = () => {
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

  const next = () => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
  const prev = () => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased">
      <div className="py-12 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-orange-600 font-semibold mb-2 block uppercase text-xs tracking-[0.2em]">
            {section?.texts.badge || 'Guia do Comprador'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <CMSText value={
              section?.texts.title?.trim()
                ? section.texts.title
                : 'Descubra o que o manual ensina aos <span class="cms-orange">compradores</span> e entenda as <span class="cms-orange">novas regras</span> do jogo'
            } />
          </h2>
          <p className="text-xl text-[#86868B] max-w-2xl mx-auto leading-relaxed">
            {section?.texts.subtitle || 'Compradores estão evoluindo. Veja o que eles estarão aprendendo em breve.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E5E5E7] p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Award className="text-blue-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight text-[#1D1D1F]">
              {section?.texts.card1Title || 'O que o comprador vai dominar?'}
            </h3>
            <ul className="space-y-3 flex-grow">
              {[
                section?.texts.card1Item1 || 'Conceitos essenciais para uma compra técnica e segura',
                section?.texts.card1Item2 || 'Reconhecimento de marcas e distribuidores de alta confiança',
                section?.texts.card1Item3 || 'Critérios para selecionar empresas sérias e competentes',
              ].map((item) => (
                <li key={item} className="flex flex-col text-[#424245]">
                  <div className="flex gap-4 items-start">
                    <Check size={18} className="text-blue-600 shrink-0 mt-1" />
                    <span className="text-lg leading-tight font-medium">{item}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-[#E5E5E7] p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <Target className="text-orange-500" size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight text-[#1D1D1F]">
              {section?.texts.card2Title || 'Principais focos e Habilidades'}
            </h3>
            <ul className="space-y-3 flex-grow">
              {[
                section?.texts.card2Item1 || 'Analisar propostas com critérios técnicos e financeiros',
                section?.texts.card2Item2 || 'Avaliar reputação e suporte de pós-venda com precisão',
                section?.texts.card2Item3 || 'Tomar decisão com segurança e embasamento técnico',
              ].map((item) => (
                <li key={item} className="flex flex-col text-[#424245]">
                  <div className="flex gap-4 items-start">
                    <Check size={18} className="text-orange-500 shrink-0 mt-1" />
                    <span className="text-lg leading-tight font-medium">{item}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="py-10 px-6 bg-[#FBFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{section?.texts.testimonialsTitle || 'As vozes de quem aprendeu'}</h2>
              <p className="text-lg text-[#86868B]">{section?.texts.testimonialsSubtitle || 'Relatos de compradores informados e preparados'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-[#D2D2D7] flex items-center justify-center hover:bg-white transition-all active:scale-90 shadow-sm"
                type="button"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-[#D2D2D7] flex items-center justify-center hover:bg-white transition-all active:scale-90 shadow-sm"
                type="button"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-[#E5E5E7] shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:min-h-[330px]">
            <div className="w-full md:w-[38%] relative h-[360px] md:h-auto">
              <img
                src={testimonials[activeTestimonial].avatar}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: testimonials[activeTestimonial].objectPosition || 'center' }}
                alt={testimonials[activeTestimonial].name}
              />
              <div className="absolute bottom-1 left-6 right-6 md:bottom-2 md:left-8 md:right-8 backdrop-blur-xl bg-white/20 border border-white/30 px-4 py-2 md:px-6 md:py-2 rounded-2xl text-white shadow-2xl">
                <p className="text-lg md:text-[22px] font-bold tracking-tight">{testimonials[activeTestimonial].name}</p>
                <div className="flex items-center gap-2 mt-1.5 opacity-90 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <span>{testimonials[activeTestimonial].role}</span>
                  <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                  <span>{testimonials[activeTestimonial].location}</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[62%] p-4 flex flex-col justify-start">
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-xl md:text-3xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
                  {testimonials[activeTestimonial].reviewTitle}
                </h4>

                <p className="text-base md:text-lg text-[#424245] leading-relaxed font-normal text-justify">
                  {testimonials[activeTestimonial].quote}
                </p>

                <div className="pt-2 md:pt-3 border-t border-[#F5F5F7]">
                  <p className="text-base md:text-[22px] font-bold tracking-tight text-[#1D1D1F] leading-snug text-justify">
                    "{testimonials[activeTestimonial].highlight}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              className="group relative inline-flex items-center gap-6 bg-orange-600 hover:bg-orange-500 text-white px-8 py-5 rounded-full transition-all duration-300 shadow-2xl shadow-orange-600/30 active:scale-95"
              onClick={() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })}
              type="button"
            >
              <span className="text-xl font-bold tracking-tight uppercase">{section?.texts.ctaButton || 'ACESSAR GUIA ESTRATÉGICO AGORA'}</span>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight size={28} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
