import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { GrainOverlay, Kicker, Reveal, SolarCells } from './atoms'
import { criarTxt, temConteudo } from './cms'
import { useKit } from './kit'

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

/* AS CAPAS DOS TRÊS PASSOS (V5, slide 3: "A inserção das capas deve ser feito
   para o formato DESKTOP").

   Cada passo nomeia uma peça do kit — Manual, Código, Plataforma —, nesta
   ordem, que é a mesma do leque do Hero e a mesma dos cards da oferta. Então a
   capa vem de `useKit()` por índice, sem campo novo no admin: trocar a arte na
   oferta troca no Hero e troca aqui, um lugar só.

   O 4º item (Licença Coletiva) fica de fora de propósito: os passos são três e
   a licença não é um passo, é o modo de distribuir os outros. Se o Francis
   acrescentar um 4º passo pelo admin, ele sai sem capa em vez de ganhar a capa
   errada.

   NO CELULAR ele perguntou se ficaria bom, "a menos que vc tiver um jeitinho".
   O jeitinho é escala: 44px encostado no número do passo, na mesma linha, em
   vez dos 96px do desktop ao lado do parágrafo. Some do fluxo vertical quase
   nada e mantém o par capa/passo, que é o que o bloco quer dizer. Esconder no
   celular era a alternativa segura, e jogaria fora o reconhecimento justo no
   aparelho onde ele mais conta. */
const CAPAS_NOS_PASSOS = 3

export const PropositoV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('apoiadores')
  const txt = criarTxt(section)
  const { pecas } = useKit()

  const titulo = txt('purposeTitle', 'Para que servem o Manual, o Código e a Plataforma de Avaliação?')
  const kicker = txt('purposeKicker', 'O que você leva')

  const itens: string[] = []
  for (let i = 1; i <= MAX_ITENS; i++) {
    const item = txt(`purpose${i}`, PADRAO[i - 1] ?? '')
    if (temConteudo(item)) itens.push(item)
  }

  if (!temConteudo(titulo) || itens.length === 0) return null

  return (
    /* SEM ARCO. Ele existiu por uma revisão só: na V5 esta seção passou a vir
       logo depois dos Apoiadores, que eram CLAROS, e herdou deles a emenda em
       arco. Os Apoiadores viraram escuros em 16/08 e a emenda perdeu a razão
       de ser — daqui até o Retorno é um bloco escuro contínuo, e arco no meio
       de bloco contínuo é degrau, não costura. */
    <section className="relative bg-[#07090d] text-white antialiased">
      {/* GRADE PLENA: de novo miolo de bloco escuro contínuo. Com `top` a
          máscara apagava a textura na borda de cima e a emenda com os
          Apoiadores reaparecia como linha. */}
      <SolarCells fade="full" />
      {/* O mesmo grão do Hero e da seção da Plataforma. Sem ele esta seção
          voltaria a ser a lisa do ato, e a costura só andaria mais um degrau
          para baixo. Ver o comentário em PlatformV4 para a medição. */}
      <GrainOverlay opacity={0.03} />

      {/* Sem arco em cima nem embaixo, o padding volta ao ritmo normal de
          seção do meio do ato. O pt-28/36 era a folga que o arco comia. */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-20 md:pb-32 md:pt-24">
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

        <div className="mt-12 space-y-6 md:space-y-5">
          {itens.map((item, i) => {
            const capa = i < CAPAS_NOS_PASSOS ? pecas[i] : undefined
            return (
              <Reveal key={item} delay={140 + i * 110}>
                {/* A escada: recuo e intensidade do filete crescem com o índice.
                    Só a partir de md — no celular a largura é curta demais para
                    gastar 96px com recuo, e a numeração já dá a progressão. */}
                <div
                  className="group flex items-start gap-4 md:gap-7"
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

                  {/* CELULAR: a capa ocupa o lugar do número. Os dois juntos
                      empilhariam duas colunas estreitas antes de o texto
                      começar, e a capa já identifica a peça melhor que "01". */}
                  {capa ? (
                    <img
                      src={capa.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="mt-0.5 w-11 shrink-0 rounded-[3px] shadow-lg shadow-black/50 ring-1 ring-white/10 md:hidden"
                      aria-hidden
                    />
                  ) : (
                    <span className="v4-mono mt-0.5 shrink-0 text-sm font-bold text-orange-400/70 md:hidden">
                      {`0${i + 1}`}
                    </span>
                  )}

                  <span className="v4-mono mt-0.5 hidden shrink-0 text-sm font-bold text-orange-400/70 md:block">
                    {`0${i + 1}`}
                  </span>

                  <p className="text-[17px] leading-relaxed text-slate-300 md:text-lg">
                    <CMSText value={item} />
                  </p>

                  {/* DESKTOP: a capa fecha a linha, à direita. Empilhadas, as
                      três formam a coluna de capas do print do Francis, mas
                      cada uma alinhada com o passo que ela nomeia — se ele
                      reescrever um passo e o texto crescer, a capa acompanha. */}
                  {capa && (
                    <img
                      src={capa.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="ml-auto hidden w-24 shrink-0 rounded-[4px] shadow-xl shadow-black/60 ring-1 ring-white/10 md:block"
                      aria-hidden
                    />
                  )}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
