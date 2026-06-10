import React from 'react'
import { ArrowRight, CheckCircle2, Quote } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

export const TestimonialsSection: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('testimonials')

  const rodrigoImage = section?.images.testimonialImage || '/assets/Integrador_Rodrigo_SP.png'
  return (
    <section className="lp-section-tight bg-white relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-slate-50 hidden lg:block"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-5 relative flex">
            <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={rodrigoImage}
                alt="Rodrigo"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/70 via-slate-800/10 to-slate-900/80"></div>
              <div className="absolute inset-0 flex items-end">
                <div className="w-full h-2/3 bg-gradient-to-t from-[#F97316]/20 to-transparent"></div>
              </div>
              <div className="absolute bottom-8 left-8">
                <Quote className="w-10 h-10 text-[#F97316] mb-3 fill-current" />
                <p className="text-white font-bold text-lg">{section?.texts.authorName || 'Rodrigo'}</p>
                <p className="text-slate-400 text-base">{section?.texts.authorRole || 'Integrador Solar, SP'}</p>
              </div>
            </div>
            <div className="absolute -right-8 top-12 bg-white p-5 rounded-xl shadow-xl border border-slate-100 hidden md:block">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">{section?.texts.statLabel || 'Crescimento'}</p>
              <p className="text-3xl font-bold text-[#F97316]">{section?.texts.statValue || '+5 Sistemas'}</p>
              <p className="text-slate-400 text-xs mt-1">{section?.texts.statSubtext || 'Fechados em 30 dias'}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2 className="lp-title font-black tracking-tight text-[#0F172A] leading-snug mb-4">
              {section?.texts.title || '"Em um mês fechei 5 sistemas novos"'}
            </h2>
            <p className="lp-subtitle text-slate-500 font-medium mb-4 lp-reading">
              {section?.texts.subtitle || 'Os benefícios são claros, e a prática comprova.'}
            </p>
            <p className="text-base font-medium text-slate-400 mb-6 lp-reading">
              {section?.texts.intro || 'Veja a experiência de Rodrigo, Integrador de São Paulo'}
            </p>
            <div className="space-y-4 text-base md:text-lg text-slate-600 leading-relaxed font-medium lp-reading">
              <p>
                {section?.texts.quote1 || '"Eu sofria com a concorrência acirrada e a baixa conversão. O Manual Solar Buy-Side me mostrou como entender a perspectiva do cliente, e isso mudou o jogo."'}
              </p>
              <p>
                {section?.texts.quote2 || '"Em um mês, fechei 5 sistemas novos. O mais gratificante, porém, foi a conexão. Deixei de ser apenas um vendedor e me tornei um verdadeiro parceiro para meus clientes."'}
              </p>
            </div>

            <div className="mt-6 bg-slate-50 border-l-4 border-[#F97316] p-5 rounded-r-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#F97316] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-[#0F172A] text-base uppercase mb-1">{section?.texts.ctaTitle || 'Faça como ele'}</h4>
                  <span className="block mt-1 font-semibold text-[#0F172A] text-base lp-reading">
                    {section?.texts.ctaText || 'Imersão no Manual de Compra Solar Buy-Side: pense como seu cliente e torne-se um Vendedor de Alta Performance!'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <a
            href="#oferta"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#F97316] hover:bg-[#EA580C] text-white text-lg font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 min-h-[44px]"
          >
            {section?.texts.ctaButton || 'Quero fechar mais projetos solares'}
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  )
}
