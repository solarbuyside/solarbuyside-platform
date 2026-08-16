import React from 'react'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { GrainOverlay, Kicker, Reveal } from './atoms'
import { criarTxt } from './cms'

/* RETORNO (Francis, revisão 27/07: nova seção "O verdadeiro retorno do Método
   Solar Buy-Side", entre os resultados do Manual estratégico e o depoimento
   do Rodrigo).

   Os textos são os do slide; a encenação é em três tempos:
   1. O NÚMERO é a história: a taxa de fechamento vira o protagonista, num
      "de 20% → para 25 a 30%" gigante em Sora, do apagado ao gradiente
      laranja, com um fio-seta ligando os dois. Nada de tabela genérica
      escondendo o dado que importa.
   2. A conta inteira vem numa lista editorial com hairlines — a mesma
      anatomia das listas do Manual (número mono apagado + fio inferior),
      sem caixa em volta: coluna Tradicional apagada, coluna Buy-Side acesa,
      e a última linha (os sistemas adicionais no ano) fecha em gradiente.
   3. O "E tem mais" é uma pull-quote em serif âmbar, a assinatura do ato.

   No celular o cabeçalho de colunas some e cada linha vira: cenário em cima,
   os dois valores lado a lado embaixo, com mini-etiqueta por valor.

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
  const txt = criarTxt(section)

  const title =
    txt('title', 'O <span class="cms-orange">verdadeiro retorno</span> do Método Solar Buy-Side')
  const intro =
    txt('intro', 'Com base em cinco anos de pesquisa de campo, estimamos que vendedores que apliquem o Método Solar Buy-Side possam elevar sua taxa média atual de fechamento de <span class="cms-bold">20% para 25% a 30%</span>, conforme sua capacidade de execução e isso sem aumentar o número de propostas apresentadas.')
  const outro =
    txt('outro', '<span class="cms-orange">E tem mais:</span> ao aplicar o Método Buy-Side em vendas consultivas B2B, você amplia sua capacidade de conquistar projetos de maior porte, aumentando seu potencial de faturamento e lucro.')

  /* O número em destaque (a taxa de fechamento amplificada). */
  const statLabel = txt('statLabel', 'Taxa média de fechamento')
  const statFrom = txt('statFrom', '20%')
  const statFromTag = txt('statFromTag', 'Hoje')
  const statTo = txt('statTo', '25 a 30%')
  const statToTag = txt('statToTag', 'Com o método')

  const colScenario = txt('colScenario', 'Cenário')
  const colTrad = txt('colTrad', 'Método Tradicional')
  const colBuy = txt('colBuy', 'Método Buy-Side')
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
      {/* Brilho no MEIO da seção, nunca encostado na borda: o DarkBackdrop
          punha o orbe em -top-[15%] e o overflow-hidden cortava o blur numa
          linha reta, marcando a emenda com a seção de cima (Gabriel, 27/07). */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-[-8%] top-[32%] h-[480px] w-[480px] rounded-full bg-orange-500/[0.06] blur-[130px]" />
        <GrainOverlay />
      </div>

      {/* pb-44: a próxima seção (paper) sobrepõe este ato com um arco */}
      <div className="relative mx-auto max-w-5xl px-6 py-24 pb-44 md:py-32 md:pb-44">
        <Reveal>
          <Kicker tone="dark">{txt('kicker', 'Projeção de resultados')}</Kicker>
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

        {/* ── O número é a história: de 20% → para 25 a 30% ─────────────── */}
        <Reveal delay={240}>
          <div className="mt-16 border-y border-white/[0.08] py-10 md:py-12">
            <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
              {statLabel}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 md:gap-x-10">
              {/* hoje: apagado */}
              <div>
                <p className="font-['Sora'] text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-none tracking-tight text-slate-600">
                  {statFrom}
                </p>
                <p className="v4-mono mt-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                  {statFromTag}
                </p>
              </div>

              {/* fio-seta: do cinza ao laranja, na direção da virada */}
              <div className="flex min-w-[56px] flex-1 items-center" aria-hidden>
                <span className="h-px w-full bg-gradient-to-r from-white/[0.08] via-orange-500/40 to-orange-500" />
                <ArrowRight size={22} className="-ml-2 shrink-0 text-orange-500" strokeWidth={2.5} />
              </div>

              {/* com o método: aceso, maior */}
              <div>
                <p className="v4-grad-text font-['Sora'] text-[clamp(3rem,7.5vw,5.6rem)] font-extrabold leading-none tracking-tight">
                  {statTo}
                </p>
                <p className="v4-mono mt-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
                  {statToTag}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h3 className="mt-16 max-w-3xl font-['Sora'] text-2xl font-bold tracking-tight text-white md:text-3xl">
            {txt('tableTitle', 'Veja o impacto real considerando uma base de 20 propostas por mês:')}
          </h3>
        </Reveal>

        {/* ── A conta, linha a linha: Tradicional apagado, Buy-Side aceso ──
            Mesma anatomia das listas do Manual: número mono + hairline. */}
        <div className="mt-4">
          {/* Cabeçalho das colunas (desktop) */}
          <Reveal delay={160}>
            <div className="hidden border-b border-white/[0.08] pb-4 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.3fr)] md:gap-x-8">
              <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-600">
                {colScenario}
              </p>
              <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                {colTrad}
              </p>
              <div className="flex items-center gap-2.5">
                <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.28em] text-orange-400">{colBuy}</p>
                {colBuyTag.trim() && (
                  <span className="v4-mono rounded-full border border-orange-500/25 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-orange-400/80">
                    {colBuyTag}
                  </span>
                )}
              </div>
            </div>
          </Reveal>

          {linhas.map(([label, trad, buy], i) => {
            const ultima = i === linhas.length - 1
            return (
              <Reveal key={i} delay={200 + i * 70}>
                <div className="group grid grid-cols-2 items-center gap-x-4 border-b border-white/[0.08] py-6 transition-transform duration-500 hover:translate-x-1 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.3fr)] md:gap-x-8 md:py-7">
                  {/* cenário, com o número-índice mono das listas do ato */}
                  <div className="col-span-2 mb-3 grid grid-cols-[40px_1fr] items-center gap-4 md:col-span-1 md:mb-0 md:grid-cols-[48px_1fr] md:gap-5">
                    <span className="v4-mono text-xl font-bold leading-none text-white/25" aria-hidden>
                      {`0${i + 1}`}
                    </span>
                    <h4 className="text-base font-semibold leading-snug text-slate-200 md:text-lg">{label}</h4>
                  </div>

                  {/* tradicional: apagado */}
                  <div className="pl-[56px] md:pl-0">
                    <p className="v4-mono mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 md:hidden">
                      {colTrad}
                    </p>
                    {/* v4-nojust: célula de tabela, não parágrafo. "12 a 24
                        sistemas adicionais" quebra em duas linhas num vão de
                        312px e teria a primeira esticada. */}
                    <p className="v4-nojust font-['Sora'] text-xl font-bold leading-tight tracking-tight text-slate-600 md:text-2xl">
                      {trad}
                    </p>
                  </div>

                  {/* Buy-Side: aceso; a última linha fecha em gradiente */}
                  <div>
                    <p className="v4-mono mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-orange-500/70 md:hidden">
                      {colBuy}
                    </p>
                    <p
                      className={`v4-nojust font-['Sora'] text-xl font-extrabold leading-tight tracking-tight md:text-2xl ${
                        ultima ? 'v4-grad-text' : 'text-white'
                      }`}
                    >
                      {buy}
                    </p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* ── Fechamento: pull-quote em serif, a assinatura do ato ─────── */}
        <Reveal delay={200}>
          <p className="v4-serif mt-14 max-w-3xl border-l-2 border-orange-500 pl-6 text-2xl leading-snug text-amber-200/90 md:text-[1.75rem]">
            <CMSText value={outro} />
          </p>
        </Reveal>
      </div>
    </section>
  )
}
