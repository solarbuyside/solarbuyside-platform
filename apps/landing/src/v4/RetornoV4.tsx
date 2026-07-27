import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { DarkBackdrop, Kicker, Reveal } from './atoms'

/* RETORNO (Francis, revisão 27/07: nova seção "O verdadeiro retorno do Método
   Solar Buy-Side", entre os resultados do Manual estratégico e o depoimento
   do Rodrigo).

   Os textos são os do slide. O visual segue o ato escuro que a seção fecha:
   a projeção é apresentada como uma tabela comparativa de três colunas em que
   a coluna Buy-Side fica acesa (tinta laranja + valores em peso cheio) — o
   mesmo contraste apagado/aceso da comparação "hoje × depois" da seção
   Transformação, adaptado à paleta escura. No celular o cabeçalho some e cada
   linha vira: cenário em cima, os dois valores lado a lado embaixo, com uma
   mini-etiqueta de coluna por célula.

   Esta seção herda o pb-44 que era do Manual estratégico: é sobre ELA que o
   ato "paper" (depoimento do Rodrigo) sobrepõe o arco de -mt-20. */

/** Teto de linhas da tabela (espelha o editor do admin). */
const MAX_LINHAS = 6

/** Conteúdo do slide — usado quando o banco não trouxer a linha. */
const LINHAS_PADRAO: [string, string, string][] = [
  ['Propostas apresentadas por mês', '20', '20'],
  ['Taxa média de fechamento', '20%', '25% a 30%'],
  ['Vendas por mês', '4', '5 a 6'],
  ['Vendas adicionais por ano', '—', '12 a 24 sistemas adicionais'],
]

export const RetornoV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('retorno')

  const title =
    section?.texts.title ||
    'O <span class="cms-orange">verdadeiro retorno</span> do Método Solar Buy-Side'
  const intro =
    section?.texts.intro ||
    'Com base em cinco anos de pesquisa de campo, estimamos que vendedores que apliquem o Método Solar Buy-Side possam elevar sua taxa média atual de fechamento de <span class="cms-bold">20% para 25% a 30%</span>, conforme sua capacidade de execução e isso sem aumentar o número de propostas apresentadas.'
  const outro =
    section?.texts.outro ||
    '<span class="cms-orange">E tem mais:</span> ao aplicar o Método Buy-Side em vendas consultivas B2B, você amplia sua capacidade de conquistar projetos de maior porte, aumentando seu potencial de faturamento e lucro.'

  const colScenario = section?.texts.colScenario || 'Cenário'
  const colTrad = section?.texts.colTrad || 'Método Tradicional'
  const colBuy = section?.texts.colBuy || 'Método Buy-Side'
  const colBuyTag = section?.texts.colBuyTag ?? 'estimativa'

  /* `??` (não `||`): linha apagada no admin some da página; linha que o banco
     ainda não tem cai no conteúdo do slide. As linhas 5 e 6 existem só para o
     Francis poder acrescentar cenários sem depender de deploy. */
  const linhas: [string, string, string][] = []
  for (let i = 1; i <= MAX_LINHAS; i++) {
    const padrao = LINHAS_PADRAO[i - 1]
    const label = (section?.texts[`row${i}Label`] ?? padrao?.[0] ?? '').trim()
    if (!label) continue
    linhas.push([
      label,
      section?.texts[`row${i}Trad`] ?? padrao?.[1] ?? '',
      section?.texts[`row${i}Buy`] ?? padrao?.[2] ?? '',
    ])
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0b0907] to-[#07090d] text-slate-100">
      <DarkBackdrop orbs="orange" />

      {/* pb-44: a próxima seção (paper) sobrepõe este ato com um arco */}
      <div className="relative mx-auto max-w-5xl px-6 py-24 pb-44 md:py-32 md:pb-44">
        <Reveal>
          <Kicker tone="dark">{section?.texts.kicker || 'Projeção de resultados'}</Kicker>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-5 max-w-4xl font-['Sora'] text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.1] tracking-tight text-white">
            <CMSText value={title} />
          </h2>
        </Reveal>

        <Reveal delay={170}>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-400 md:text-xl">
            <CMSText value={intro} />
          </p>
        </Reveal>

        <Reveal delay={230}>
          <h3 className="mt-16 max-w-3xl font-['Sora'] text-2xl font-bold tracking-tight text-white md:text-3xl">
            {section?.texts.tableTitle || 'Veja o impacto real considerando uma base de 20 propostas por mês:'}
          </h3>
        </Reveal>

        {/* Tabela: coluna Buy-Side acesa (tinta + borda laranja, valor cheio),
            Tradicional apagada — o olho lê a direção da virada sozinho. */}
        <Reveal delay={280}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {/* Cabeçalho das colunas (desktop) */}
            <div className="hidden border-b border-white/[0.08] bg-white/[0.02] md:grid md:grid-cols-[1.35fr_1fr_1.35fr]">
              <p className="v4-mono px-7 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                {colScenario}
              </p>
              <p className="v4-mono border-l border-white/[0.06] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                {colTrad}
              </p>
              <div className="flex items-center gap-2.5 border-l border-orange-500/20 bg-orange-500/[0.06] px-7 py-4">
                <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.28em] text-orange-400">{colBuy}</p>
                {colBuyTag.trim() && (
                  <span className="v4-mono rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-orange-300">
                    {colBuyTag}
                  </span>
                )}
              </div>
            </div>

            {linhas.map(([label, trad, buy], i) => (
              <div
                key={i}
                className="grid grid-cols-2 border-b border-white/[0.06] transition-colors last:border-b-0 hover:bg-white/[0.02] md:grid-cols-[1.35fr_1fr_1.35fr]"
              >
                <p className="col-span-2 px-5 pt-5 text-[15px] font-semibold leading-snug text-slate-200 md:col-span-1 md:flex md:items-center md:px-7 md:py-5 md:text-base">
                  {label}
                </p>

                <div className="px-5 pb-5 pt-3 md:flex md:flex-col md:justify-center md:border-l md:border-white/[0.06] md:px-7 md:py-5">
                  <p className="v4-mono mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 md:hidden">
                    {colTrad}
                  </p>
                  <p className="v4-mono text-[15px] text-slate-400 md:text-base">{trad}</p>
                </div>

                <div className="bg-orange-500/[0.04] px-5 pb-5 pt-3 md:flex md:flex-col md:justify-center md:border-l md:border-orange-500/20 md:bg-orange-500/[0.06] md:px-7 md:py-5">
                  <p className="v4-mono mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-orange-500/70 md:hidden">
                    {colBuy}
                  </p>
                  <p className="v4-mono text-[15px] font-bold text-white md:text-base">{buy}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Fechamento: a mesma caixa de destaque dos depoimentos, em tinta escura */}
        <Reveal delay={320}>
          <div className="mt-12 max-w-3xl rounded-r-2xl border-l-4 border-orange-500 bg-white/[0.03] p-6 md:p-7">
            <p className="text-lg font-semibold leading-relaxed text-white md:text-xl">
              <CMSText value={outro} />
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
