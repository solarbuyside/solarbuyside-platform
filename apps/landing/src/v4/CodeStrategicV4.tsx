import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { GrainOverlay, Kicker, Reveal } from './atoms'

/* Seção do CÓDIGO DO VENDEDOR CONSULTIVO logo após o Manual Estratégico.
   Estratégia de venda nova: o Código é produto vendido (não bônus) e tão
   importante quanto o Manual. Espelha o spotlight do Manual: texto à esquerda,
   capa à direita, fundo escuro dando sequência ao ato anterior. */

export const CodeStrategicV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('seller-code')

  const codeImage =
    section?.images.codeImage || section?.images.book || '/assets/foto-o-codigo-do-vendedor.png'

  return (
    <section className="relative overflow-hidden bg-[#0b0907] text-slate-100 antialiased">
      <GrainOverlay />

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Texto */}
          <div className="relative z-10 flex flex-col lg:col-span-7">
            <Reveal>
              <Kicker tone="dark">Diferencial estratégico</Kicker>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 text-[clamp(2.2rem,4.4vw,3.6rem)] font-extrabold leading-[1.06] tracking-tight text-white">
                Código do Vendedor Consultivo
              </h2>
            </Reveal>

            <Reveal delay={180} className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-slate-400">
              <p>
                Como complemento ao Manual de Compra Solar Buy-Side, o{' '}
                <strong className="font-semibold text-slate-100">Código do Vendedor Consultivo</strong>{' '}
                funciona como uma chave de acesso prática ao universo Buy-Side para profissionais de
                vendas. Ele capacita o profissional a compreender como o cliente avalia risco, compara
                propostas e toma decisões de investimento.
              </p>
              <p>
                Ao aplicar o método, o profissional deixa de competir apenas por preço e passa a
                conduzir decisões com mais segurança e credibilidade. O resultado é mais conversões,
                margens mais saudáveis e clientes que encerram a negociação confiantes na escolha
                realizada.
              </p>
            </Reveal>
          </div>

          {/* Capa do Código */}
          <div className="lg:col-span-5">
            <Reveal delay={180}>
              <div className="relative flex justify-center">
                <div className="absolute -inset-10 rounded-full bg-orange-500/20 blur-[110px]" aria-hidden />
                <div className="relative w-[300px] max-w-full">
                  <img
                    src={codeImage}
                    alt="O Código do Vendedor Consultivo"
                    className="v4-float relative h-auto w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]"
                    loading="lazy"
                  />
                  <div
                    className="absolute -bottom-8 left-1/2 h-14 w-[70%] -translate-x-1/2 rounded-[100%] bg-orange-500/20 blur-2xl"
                    aria-hidden
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
