import React from 'react'
import { BookOpen, CheckCircle2, FileCheck, LayoutGrid, Layers, Quote } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow, Reveal } from './atoms'

/* Depoimento do Rodrigo — editorial, foto grande + leitura confortável. */
export const TestimonialsV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('testimonials')
  const rodrigoImage = section?.images.testimonialImage || '/assets/Integrador_Rodrigo_SP.png'

  return (
    <section className="relative overflow-hidden bg-[#fafaf8]">
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/3 bg-white lg:block" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid items-stretch gap-12 lg:grid-cols-12">
          {/* Foto */}
          <Reveal className="relative flex lg:col-span-5">
            <figure className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] bg-slate-900 shadow-[0_50px_100px_-40px_rgba(15,23,42,0.5)] lg:aspect-auto lg:h-full">
              <img src={rodrigoImage} alt="Rodrigo" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/10 to-slate-950/30" aria-hidden />
              <figcaption className="absolute bottom-8 left-8 right-8">
                <Quote className="mb-3 h-9 w-9 fill-current text-orange-500" />
                <p className="text-lg font-bold text-white">{section?.texts.authorName || 'Rodrigo'}</p>
                <p className="text-base text-slate-300">{section?.texts.authorRole || 'Integrador Solar, SP'}</p>
              </figcaption>
            </figure>

            <div className="v4-float absolute -right-5 top-10 hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] md:block">
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                {section?.texts.statLabel || 'Crescimento'}
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-orange-500">{section?.texts.statValue || '+5 Sistemas'}</p>
              <p className="mt-1 text-xs text-slate-400">{section?.texts.statSubtext || 'Fechados em 30 dias'}</p>
            </div>
          </Reveal>

          {/* Texto */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-slate-900 md:text-[2.6rem] md:leading-[1.15]">
                {section?.texts.title || '"Em um mês fechei 5 sistemas novos"'}
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-4 text-lg font-medium text-slate-500 md:text-xl">
                {section?.texts.subtitle || 'Os benefícios são claros, e a prática comprova.'}
              </p>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-3 text-base font-medium text-slate-400">
                {section?.texts.intro || 'Veja a experiência de Rodrigo, Integrador de São Paulo'}
              </p>
            </Reveal>

            <Reveal delay={220} className="mt-7 space-y-5 text-base leading-relaxed text-slate-600 md:text-lg">
              <p>
                {section?.texts.quote1 ||
                  '"Eu sofria com a concorrência acirrada e a baixa conversão. O Manual Solar Buy-Side me mostrou como entender a perspectiva do cliente, e isso mudou o jogo."'}
              </p>
              <p>
                {section?.texts.quote2 ||
                  '"Em um mês, fechei 5 sistemas novos. O mais gratificante, porém, foi a conexão. Deixei de ser apenas um vendedor e me tornei um verdadeiro parceiro para meus clientes."'}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-8 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-extrabold uppercase tracking-[0.14em] text-slate-900">
                      {section?.texts.ctaTitle || 'Faça como ele'}
                    </h4>
                    <p className="text-base font-semibold leading-relaxed text-slate-700">
                      {section?.texts.ctaText ||
                        'Imersão no Manual de Compra Solar Buy-Side: pense como seu cliente e torne-se um Vendedor de Alta Performance!'}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={140} className="mt-12 flex justify-center">
          <Cta size="lg" href="#oferta">
            {section?.texts.ctaButton || 'Quero fechar mais projetos solares'}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>
      </div>
    </section>
  )
}

/* Ponte narrativa — manual + 4 atributos em grade limpa. */
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
    <section className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-slate-900 md:text-[2.5rem] md:leading-[1.15]">
              {section?.texts.title || 'A história de Rodrigo é apenas um exemplo do poder deste manual.'}
            </h2>
          </Reveal>
          <Reveal delay={110}>
            <p className="mt-4 text-lg font-medium leading-relaxed text-slate-500">
              {section?.texts.subtitle ||
                'Ele é uma ponte entre o comprador bem informado e o vendedor preparado, impulsionando negociações justas e satisfatórias.'}
            </p>
          </Reveal>
        </header>

        <div className="grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="flex justify-center lg:col-span-6 lg:justify-start">
            <div className="group relative">
              <div
                className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/50 blur-[100px] transition-all duration-700 group-hover:bg-orange-200/70"
                aria-hidden
              />
              <img
                src={section?.images.manualImage || '/assets/Manual de Compra -OF.png'}
                alt="Manual de Compra Solar Buy-Side"
                className="relative h-auto w-[460px] max-w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {features.map((feature, idx) => (
                <Reveal key={feature.title} delay={idx * 90}>
                  <div className="v4-lift group h-full rounded-2xl border border-slate-200/70 bg-slate-50/60 p-6 hover:border-orange-200 hover:bg-white hover:shadow-[0_20px_44px_-22px_rgba(15,23,42,0.2)]">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm transition-all duration-500 group-hover:bg-orange-500 group-hover:text-white">
                      <feature.Icon size={22} />
                    </div>
                    <h4 className="mb-1.5 text-base font-bold leading-tight text-slate-900">{feature.title}</h4>
                    <p className="text-base font-medium leading-relaxed text-slate-500">{feature.desc}</p>
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
