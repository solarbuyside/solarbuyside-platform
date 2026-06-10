import React from 'react'
import { BookOpen, FileCheck, LayoutGrid, Layers, Quote } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow, Reveal, Stamp } from './atoms'

/* Depoimento do Rodrigo — abertura do ato "paper": inversão editorial sobre o
   dark anterior, foto em arch com selo girando + citação gigante em serif. */
export const TestimonialsV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('testimonials')
  const rodrigoImage = section?.images.testimonialImage || '/assets/Integrador_Rodrigo_SP.png'

  return (
    <section className="relative z-10 -mt-20 rounded-t-[3rem] bg-[#f2ece1] pb-20 pt-24 text-[#181410] md:rounded-t-[4.5rem] md:pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-14 lg:grid-cols-12">
          {/* Figura: foto arch + selo girando + legenda */}
          <Reveal className="lg:col-span-5">
            <div className="relative mx-auto max-w-[420px]">
              <figure>
                <div className="v4-arch v4-hard-shadow aspect-[3/4] w-full">
                  <img
                    src={rodrigoImage}
                    alt="Rodrigo"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-8">
                  <Quote className="mb-3 h-7 w-7 fill-current text-orange-500" aria-hidden />
                  <p className="font-['Sora'] text-lg font-bold text-[#181410]">
                    {section?.texts.authorName || 'Rodrigo'}
                  </p>
                  <p className="v4-mono mt-1 text-[10px] uppercase tracking-[0.25em] text-[#4f463c]">
                    {section?.texts.authorRole || 'Integrador Solar, SP'}
                  </p>
                </figcaption>
              </figure>

              <div className="absolute right-0 -top-6 origin-top-right scale-[0.8] md:-right-8 md:-top-8 md:scale-100">
                <Stamp text={section?.texts.statLabel || 'Crescimento'} tone="ink" size={140}>
                  <p className="font-['Sora'] text-base font-extrabold leading-tight text-[#181410]">
                    {section?.texts.statValue || '+5 Sistemas'}
                  </p>
                  <p className="v4-mono mt-1 text-[8px] uppercase tracking-[0.18em] text-[#181410]">
                    {section?.texts.statSubtext || 'Fechados em 30 dias'}
                  </p>
                </Stamp>
              </div>
            </div>
          </Reveal>

          {/* Citação editorial */}
          <div className="lg:col-span-7">
            <Reveal>
              <Quote size={44} className="mb-4 fill-current text-orange-500" aria-hidden />
              <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.06] text-[#181410]">
                <span className="v4-serif">
                  {section?.texts.title || '"Em um mês fechei 5 sistemas novos"'}
                </span>
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-5 text-xl font-semibold text-[#4f463c]">
                {section?.texts.subtitle || 'Os benefícios são claros, e a prática comprova.'}
              </p>
            </Reveal>
            <Reveal delay={150}>
              <p className="v4-mono mt-2 text-[10px] uppercase tracking-[0.3em] text-[#4f463c]/70">
                {section?.texts.intro || 'Veja a experiência de Rodrigo, Integrador de São Paulo'}
              </p>
            </Reveal>

            <Reveal delay={220}>
              <p className="v4-dropcap mt-8 text-lg leading-relaxed text-[#4f463c] md:text-xl">
                {section?.texts.quote1 ||
                  '"Eu sofria com a concorrência acirrada e a baixa conversão. O Manual Solar Buy-Side me mostrou como entender a perspectiva do cliente, e isso mudou o jogo."'}
              </p>
              <p className="mt-5 text-lg leading-relaxed text-[#4f463c] md:text-xl">
                {section?.texts.quote2 ||
                  '"Em um mês, fechei 5 sistemas novos. O mais gratificante, porém, foi a conexão. Deixei de ser apenas um vendedor e me tornei um verdadeiro parceiro para meus clientes."'}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-9 rounded-r-2xl border-l-4 border-orange-500 bg-white/50 p-6">
                <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#181410]">
                  {section?.texts.ctaTitle || 'Faça como ele'}
                </p>
                <p className="mt-2 text-lg font-semibold leading-relaxed text-[#181410]">
                  {section?.texts.ctaText ||
                    'Imersão no Manual de Compra Solar Buy-Side: pense como seu cliente e torne-se um Vendedor de Alta Performance!'}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={140} className="mt-14 flex justify-center">
          <Cta size="lg" href="#oferta">
            {section?.texts.ctaButton || 'Quero fechar mais projetos solares'}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>
      </div>
    </section>
  )
}

/* Ponte narrativa — manual sobre bloco paper-deep + tabela de specs estilo
   revista com hairlines colapsadas e inversão de tinta no hover. */
export const StoryBridgeV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('story-bridge')

  const features = [
    {
      title: section?.texts.feature1Title || 'Conteúdo Técnico',
      desc: section?.texts.feature1Desc || 'Mais de 130 páginas com conteúdo técnico e estratégico.',
      Icon: BookOpen,
    },
    {
      title: section?.texts.feature2Title || 'Consulta Rápida',
      desc: section?.texts.feature2Desc || '160 tópicos organizados para consulta rápida.',
      Icon: LayoutGrid,
    },
    {
      title: section?.texts.feature3Title || 'Jornada de Compra',
      desc: section?.texts.feature3Desc || 'Uma metodologia em 4 fases que orienta toda a jornada de compra.',
      Icon: Layers,
    },
    {
      title: section?.texts.feature4Title || 'Suporte Decisório',
      desc: section?.texts.feature4Desc || 'Anexos técnicos que auxiliam na tomada de decisão.',
      Icon: FileCheck,
    },
  ]

  return (
    <section className="bg-[#f2ece1] pb-24 pt-4 text-[#181410]">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.12] tracking-tight text-[#181410]">
              {section?.texts.title || 'A história de Rodrigo é apenas um exemplo do poder deste manual.'}
            </h2>
          </Reveal>
          <Reveal delay={110}>
            <p className="mt-4 text-xl leading-relaxed text-[#4f463c]">
              {section?.texts.subtitle ||
                'Ele é uma ponte entre o comprador bem informado e o vendedor preparado, impulsionando negociações justas e satisfatórias.'}
            </p>
          </Reveal>
        </header>

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-12">
          {/* Manual sobre bloco paper-deep */}
          <Reveal className="lg:col-span-5">
            <div className="group v4-hard-shadow rounded-[2rem] bg-[#e9e0d0] p-10">
              <img
                src={section?.images.manualImage || '/assets/Manual de Compra -OF.png'}
                alt="Manual de Compra Solar Buy-Side"
                className="h-auto w-full rotate-[-2deg] transition-transform duration-700 ease-out group-hover:rotate-0"
                loading="lazy"
              />
            </div>
          </Reveal>

          {/* Tabela de specs com hairlines colapsadas */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 border-l border-t border-[#181410]/15 sm:grid-cols-2">
              {features.map((feature, idx) => (
                <Reveal key={feature.title} delay={idx * 90}>
                  <div className="group h-full border-b border-r border-[#181410]/15 p-8 transition-colors duration-500 hover:bg-[#181410]">
                    <div className="flex items-center justify-between">
                      <span className="v4-mono text-xs text-[#181410]/40 transition-colors duration-500 group-hover:text-orange-400">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <feature.Icon
                        size={22}
                        className="text-[#181410] transition-colors duration-500 group-hover:text-orange-400"
                      />
                    </div>
                    <h4 className="mt-5 text-lg font-bold leading-tight text-[#181410] transition-colors duration-500 group-hover:text-[#f2ece1]">
                      {feature.title}
                    </h4>
                    <p className="mt-2 leading-relaxed text-[#4f463c] transition-colors duration-500 group-hover:text-[#f2ece1]/70">
                      {feature.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
