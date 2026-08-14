import React from 'react'
import { Quote } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Img, Cta, CtaArrow, Reveal, Stamp } from './atoms'
import { criarTxt } from './cms'

/* Depoimento do Rodrigo — segundo relato do ato "paper": foto em arch com selo
   girando + citação gigante em serif.

   SEM o arco de subida desde 06/08. Ele abria o ato claro montando sobre uma
   seção escura, e o -mt-20 + rounded-t era essa entrada. Na ordem nova quem
   abre o ato é o depoimento do Lucas, e o Rodrigo passa a vir logo depois
   dele: claro sobre claro. O arco ali desenhava um degrau no meio de um bloco
   contínuo, e o -mt-20 comia 80px do respiro entre os dois relatos. */
export const TestimonialsV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('testimonials')
  const txt = criarTxt(section)
  const rodrigoImage = section?.images.testimonialImage ?? '/assets/Integrador_Rodrigo_SP.png'

  return (
    <section className="relative bg-[#f7f8fa] pb-20 pt-16 text-slate-900 md:pt-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-14 lg:grid-cols-12">
          {/* Figura: foto arch + selo girando + legenda */}
          <Reveal className="lg:col-span-5">
            <div className="relative mx-auto max-w-[420px]">
              <figure>
                <div className="v4-arch v4-hard-shadow aspect-[3/4] w-full">
                  <Img
                    src={rodrigoImage}
                    alt="Rodrigo"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-8">
                  <Quote className="mb-3 h-7 w-7 fill-current text-orange-500" aria-hidden />
                  <p className="font-['Sora'] text-lg font-bold text-slate-900">
                    {txt('authorName', 'Rodrigo')}
                  </p>
                  <p className="v4-mono mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-600">
                    {txt('authorRole', 'Integrador Solar, SP')}
                  </p>
                </figcaption>
              </figure>

              <div className="absolute right-0 -top-6 origin-top-right scale-[0.8] md:-right-8 md:-top-8 md:scale-100">
                <Stamp text={txt('statLabel', 'Crescimento')} tone="ink" size={140}>
                  <p className="font-['Sora'] text-base font-extrabold leading-tight text-slate-900">
                    {txt('statValue', '+5 Sistemas')}
                  </p>
                  <p className="v4-mono mt-1 text-[8px] uppercase tracking-[0.18em] text-slate-900">
                    {txt('statSubtext', 'Fechados em 30 dias')}
                  </p>
                </Stamp>
              </div>
            </div>
          </Reveal>

          {/* Citação editorial */}
          <div className="lg:col-span-7">
            <Reveal>
              <Quote size={44} className="mb-4 fill-current text-orange-500" aria-hidden />
              <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.06] text-slate-900">
                <span className="v4-serif">
                  {txt('title', '"Em um mês fechei 5 sistemas novos"')}
                </span>
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-5 text-xl font-semibold text-slate-600">
                {txt('subtitle', 'Os benefícios são claros, e a prática comprova.')}
              </p>
            </Reveal>
            <Reveal delay={150}>
              <p className="v4-mono mt-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                {txt('intro', 'Veja a experiência de Rodrigo, Integrador de São Paulo')}
              </p>
            </Reveal>

            <Reveal delay={220}>
              <p className="v4-dropcap mt-8 text-lg leading-relaxed text-slate-600 md:text-xl">
                {txt('quote1', '"Eu sofria com a concorrência acirrada e a baixa conversão. O Manual Solar Buy-Side me mostrou como entender a perspectiva do cliente, e isso mudou o jogo."')}
              </p>
              <p className="mt-5 text-lg leading-relaxed text-slate-600 md:text-xl">
                {txt('quote2', '"Em um mês, fechei 5 sistemas novos. O mais gratificante, porém, foi a conexão. Deixei de ser apenas um vendedor e me tornei um verdadeiro parceiro para meus clientes."')}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-9 rounded-r-2xl border-l-4 border-orange-500 bg-white p-6">
                <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-900">
                  {txt('ctaTitle', 'Faça como ele')}
                </p>
                <p className="mt-2 text-lg font-semibold leading-relaxed text-slate-900">
                  {txt('ctaText', 'Imersão no Manual de Compra Solar Buy-Side: pense como seu cliente e torne-se um Vendedor de Alta Performance!')}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={140} className="mt-14 flex justify-center">
          <Cta size="lg" variant="ghost-paper" href="#oferta">
            {txt('ctaButton', 'Quero fechar mais projetos solares')}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>
      </div>
    </section>
  )
}

/* DEPOIMENTO DO LUCAS (Francis, slide 7: "criar uma nova seção DEPOIMENTO no
   mesmo modelo do que do integrador RODRIGO").

   Duas diferenças pedidas em cima do modelo do Rodrigo:
   - sem o selo girando (o X vermelho do slide cai em cima dele);
   - foto retangular vertical, não o arco: o arco "parece uma portinha"
     (Gabriel, 26/07). Mesma proporção 3:4 do arquivo que veio no PPTX.

   A foto saiu do próprio PPTX do Francis (media/image17.png), tratada para
   800px de largura. O selo do Rodrigo continua onde está: o slide 14 não pede
   para tirar. */
export const TestimonialLucasV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('testimonial-lucas')
  const txt = criarTxt(section)
  const foto = section?.images.testimonialImage ?? '/assets/Integrador_Lucas_BH.jpg'

  return (
    <section className="relative z-10 -mt-20 rounded-t-[3rem] bg-[#f7f8fa] pb-20 pt-24 text-slate-900 md:rounded-t-[4.5rem] md:pt-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Era um rótulo mono de 10px e o Gabriel apontou (26/07) que isto é um
            título de seção, não uma etiqueta. Virou título de verdade. */}
        <Reveal>
          <h2 className="mb-14 max-w-4xl font-['Sora'] text-[clamp(1.8rem,3.6vw,2.9rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900">
            {txt('kicker', 'Relato de caso: a história do integrador Lucas')}
          </h2>
        </Reveal>

        <div className="grid items-start gap-14 lg:grid-cols-12">
          {/* Figura: retângulo vertical, sem selo */}
          <Reveal className="lg:col-span-5">
            <figure className="mx-auto max-w-[420px]">
              <div className="v4-hard-shadow aspect-[3/4] w-full overflow-hidden rounded-2xl">
                <Img src={foto} alt="Lucas de Freitas" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <figcaption className="mt-8">
                <Quote className="mb-3 h-7 w-7 fill-current text-orange-500" aria-hidden />
                <p className="font-['Sora'] text-lg font-bold text-slate-900">
                  {txt('authorName', 'Lucas de Freitas')}
                </p>
                <p className="v4-mono mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-600">
                  {txt('authorRole', 'Integrador Solar, BH')}
                </p>
              </figcaption>
            </figure>
          </Reveal>

          {/* Citação editorial */}
          <div className="lg:col-span-7">
            <Reveal>
              <Quote size={44} className="mb-4 fill-current text-orange-500" aria-hidden />
              <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.06] text-slate-900">
                <span className="v4-serif">
                  {txt('title', '"Deixei de competir por preço e passei a ser vendedor consultivo"')}
                </span>
              </h2>
            </Reveal>

            <Reveal delay={220}>
              <p className="v4-dropcap mt-8 text-lg leading-relaxed text-slate-600 md:text-xl">
                {txt('quote1', 'Com o Método Solar Buy-Side, aprendi a ancorar o valor do projeto na perspectiva de investimento do cliente e isso mudou o jogo.')}
              </p>
              <p className="mt-5 text-lg leading-relaxed text-slate-600 md:text-xl">
                {txt('quote2', 'Hoje eu entro numa reunião muito mais tranquilo. Não preciso convencer ninguém. Meu papel é educar e ajudar o cliente a decidir.')}
              </p>
              <p className="mt-5 text-lg leading-relaxed text-slate-600 md:text-xl">
                {txt('quote3', 'Quando o cliente compara três orçamentos, ele volta pra mim. Não vendo mais o sistema mais barato, vendo a decisão mais segura, e isso pesa muito mais na hora de fechar.')}
              </p>
            </Reveal>

            <Reveal delay={300}>
              {/* Sem o rótulo "Para quem é" (Gabriel, 26/07): a frase se
                  sustenta sozinha e o rótulo só empurrava o texto para baixo. */}
              <div className="mt-9 rounded-r-2xl border-l-4 border-orange-500 bg-white p-6">
                <p className="text-lg font-semibold leading-relaxed text-slate-900">
                  {txt('ctaText', 'Se tornar vendedor consultivo Buy-Side significa reduzir risco, insegurança e arrependimento do comprador, e não pressionar por fechamento.')}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* CTA 2 */}
        <Reveal delay={140} className="mt-14 flex justify-center">
          <Cta size="lg" variant="ghost-paper" href="#oferta">
            {txt('ctaButton', 'Quero parar de perder venda por preço')}
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
  const txt = criarTxt(section)

  const features = [
    {
      title: txt('feature1Title', 'Conteúdo Técnico'),
      desc: txt('feature1Desc', 'Mais de 130 páginas com conteúdo técnico e estratégico.'),
    },
    {
      title: txt('feature2Title', 'Consulta Rápida'),
      desc: txt('feature2Desc', '160 tópicos organizados para consulta rápida.'),
    },
    {
      title: txt('feature3Title', 'Jornada de Compra'),
      desc: txt('feature3Desc', 'Uma metodologia em 4 fases que orienta toda a jornada de compra.'),
    },
    {
      title: txt('feature4Title', 'Suporte Decisório'),
      desc: txt('feature4Desc', 'Anexos técnicos que auxiliam na tomada de decisão.'),
    },
  ]

  return (
    <section className="bg-[#f2ece1] pb-24 pt-4 text-[#181410]">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="text-[clamp(1.8rem,3.2vw,2.6rem)] font-extrabold leading-[1.12] tracking-tight text-[#181410]">
              {txt('title', 'A história de Rodrigo é apenas um exemplo do poder deste manual.')}
            </h2>
          </Reveal>
          <Reveal delay={110}>
            <p className="mt-4 text-xl leading-relaxed text-[#4f463c]">
              {txt('subtitle', 'Ele é uma ponte entre o comprador bem informado e o vendedor preparado, impulsionando negociações justas e satisfatórias.')}
            </p>
          </Reveal>
        </header>

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-12">
          {/* Manual sobre bloco paper-deep */}
          <Reveal className="lg:col-span-5">
            <div className="group v4-hard-shadow rounded-[2rem] bg-[#e9e0d0] p-10">
              {/* multiply: o fundo branco do PNG some sobre o paper */}
              <Img
                src={section?.images.manualImage ?? '/assets/Manual de Compra -OF.png'}
                alt="Manual de Compra Solar Buy-Side"
                className="h-auto w-full rotate-[-2deg] mix-blend-multiply transition-transform duration-700 ease-out group-hover:rotate-0"
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
                    <span className="v4-mono text-xs text-[#181410]/40 transition-colors duration-500 group-hover:text-orange-400">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
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
