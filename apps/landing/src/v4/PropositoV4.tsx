import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Kicker, Reveal, SolarCells } from './atoms'
import { criarTxt, temConteudo } from './cms'

/* "PARA QUE SERVEM O MANUAL, O CÓDIGO E A PLATAFORMA DE AVALIAÇÃO?"
   (Francis, slide 2 da revisão de 03/08: "novo texto abaixo do carrossel").

   Ele mandou uma pergunta e três respostas numeradas. A forma escolhida é uma
   ESCADA: cada resposta começa um pouco mais à direita que a anterior, com um
   filete que cresce de laranja apagado até laranja cheio. É a progressão do
   próprio texto (entender → aplicar → vender), lida antes de qualquer palavra.

   Por que não os cartões que a LP já usa em outros lugares: são três frases
   longas, e cartão lado a lado obriga a encurtar ou vira uma parede de texto
   em três colunas. Em escada elas respiram na largura de leitura.

   As três frases vivem no CMS (`purpose1..3`), então o Francis mexe sozinho.
   O bloco inteiro some se ele apagar o título. */

const PADRAO = [
  'Você entende exatamente como o comprador avalia integradora, tecnologia, viabilidade e risco antes de fechar negócio.',
  'Aplica esses mesmos critérios para revisar sua proposta e neutralizar objeções antes que elas apareçam.',
  'Vende como consultor, defendendo o valor da sua proposta com dados e evidências, não com desconto.',
]

const MAX_ITENS = 6

export const PropositoV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('apoiadores')
  const txt = criarTxt(section)

  const titulo = txt('purposeTitle', 'Para que servem o Manual, o Código e a Plataforma de Avaliação?')
  const kicker = txt('purposeKicker', 'O que você leva')

  const itens: string[] = []
  for (let i = 1; i <= MAX_ITENS; i++) {
    const item = txt(`purpose${i}`, PADRAO[i - 1] ?? '')
    if (temConteudo(item)) itens.push(item)
  }

  if (!temConteudo(titulo) || itens.length === 0) return null

  return (
    <section className="relative bg-[#07090d] text-white antialiased">
      <SolarCells fade="center" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 md:py-28">
        {temConteudo(kicker) && (
          <Reveal>
            <Kicker tone="dark">{kicker}</Kicker>
          </Reveal>
        )}

        <Reveal delay={80}>
          <h2 className="mt-5 max-w-3xl font-['Sora'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-extrabold leading-[1.12] tracking-tight text-white">
            <CMSText value={titulo} />
          </h2>
        </Reveal>

        <div className="mt-12 space-y-5">
          {itens.map((item, i) => (
            <Reveal key={item} delay={140 + i * 110}>
              {/* A escada: recuo e intensidade do filete crescem com o índice.
                  Só a partir de md — no celular a largura é curta demais para
                  gastar 96px com recuo, e a numeração já dá a progressão. */}
              <div
                className="group flex items-start gap-5 md:gap-7"
                style={{ ['--passo' as string]: `${i * 48}px` }}
              >
                <span className="hidden shrink-0 md:block" style={{ width: 'var(--passo)' }} aria-hidden />

                <span
                  className="mt-1 w-1 shrink-0 self-stretch rounded-full transition-all duration-500 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(180deg, #fbbf24, #f97316)',
                    opacity: 0.35 + i * 0.3,
                  }}
                  aria-hidden
                />

                <span className="v4-mono mt-0.5 shrink-0 text-sm font-bold text-orange-400/70">
                  {`0${i + 1}`}
                </span>

                <p className="text-[17px] leading-relaxed text-slate-300 md:text-lg">
                  <CMSText value={item} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
