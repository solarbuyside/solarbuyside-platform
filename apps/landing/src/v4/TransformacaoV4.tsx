import React from 'react'
import { Check, X } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { GrainOverlay, Kicker, Reveal } from './atoms'
import { criarTxt, temConteudo } from './cms'

/* TRANSFORMAÇÃO (Francis, slide 8 da revisão de 25/07: "criar uma nova seção
   TRANSFORMAÇÃO").

   Os textos são os do slide. O visual, não: o slide é fundo preto com fonte
   branca e uma tabela de emojis ❌/✅. Aqui a comparação usa a paleta e os
   átomos da própria LP (Gabriel, 26/07: "usando as cores atuais do sistema,
   componentes atuais... um visual muito mais bonito").

   A comparação não é uma tabela: são pares em duas colunas separadas por uma
   calha. "Hoje" fica apagado e riscado (o que se perde), "Depois" fica em peso
   cheio com o check laranja (o que se ganha). No mobile as colunas viram duas
   linhas por par, para o olho ler sempre no sentido hoje → depois.

   FUNDO ESCURO desde 06/08. A seção era clara (#f7f8fa) porque abria o ato
   "paper" logo depois do depoimento do Lucas. Na ordem nova ela caiu entre o
   Manual (escuro) e o Retorno (escuro) e virava uma ilha branca de uma dobra
   só. Fica em #0b0907 chapado: é exatamente a cor em que o Manual termina e a
   cor em que o Retorno começa, então os três emendam sem costura visível. */

const PARES_PADRAO: [string, string][] = [
  ['Disputa preço', 'Defende valor'],
  ['Responde objeções', 'Evita objeções'],
  ['Espera a decisão', 'Conduz a decisão'],
  ['Vende equipamento', 'Vende confiança'],
  ['Fecha quando consegue', 'Fecha mais rápido'],
  ['É apenas vendedor', 'É consultor estratégico'],
  // 7º par, acrescentado em 06/08 (slide 15: "acrescentar na tabela").
  ['Sem diferencial na reunião', 'Autoridade desde o início'],
]

/* Slots de par oferecidos ao admin. Maior que o padrão de propósito: ele
   acrescenta um par novo sem pedir dev, como já faz nas outras listas. */
const MAX_PARES = 10

/* "Para quem o Método Solar Buy-Side foi desenvolvido!" (Francis, 06/08,
   slide 15). É o que sobrou da seção "Para quem o Método foi desenvolvido?",
   eliminada inteira no slide 11: três painéis com ícone, emblema girando e
   texto viraram três linhas. Ele pediu no mesmo corpo de "Veja sua
   transformação", então divide o mesmo nível de título com a comparação. */
const PERFIS_PADRAO = ['Empresas de integração solar', 'Empresas iniciantes', 'Representantes comerciais']
const MAX_PERFIS = 6

export const TransformacaoV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('transformacao')
  const txt = criarTxt(section)

  const bullets = [
    txt('bullet1', 'O cliente não compra porque foi convencido.'),
    txt('bullet2', 'Ele compra porque sente segurança em seguir a sua recomendação.'),
    txt('bullet3', 'É exatamente essa transformação que o Método Solar Buy-Side desenvolve.'),
  ].filter(temConteudo)

  const pares: [string, string][] = []
  for (let i = 1; i <= MAX_PARES; i++) {
    const padrao = PARES_PADRAO[i - 1]
    const hoje = txt(`row${i}Hoje`, padrao?.[0] ?? '')
    const depois = txt(`row${i}Depois`, padrao?.[1] ?? '')
    if (temConteudo(hoje) && temConteudo(depois)) pares.push([hoje, depois])
  }

  const perfis: string[] = []
  for (let i = 1; i <= MAX_PERFIS; i++) {
    const perfil = txt(`audience${i}`, PERFIS_PADRAO[i - 1] ?? '')
    if (temConteudo(perfil)) perfis.push(perfil)
  }
  const perfisTitulo = txt('audienceTitle', 'Para quem o Método Solar Buy-Side foi desenvolvido')

  const hojeLabel = txt('hojeLabel', 'Hoje')
  const depoisLabel = txt('depoisLabel', 'Depois')

  return (
    <section className="relative overflow-hidden bg-[#0b0907] px-6 pb-24 pt-20 text-slate-100 antialiased md:pb-32 md:pt-24">
      <GrainOverlay />

      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <Kicker tone="dark">{txt('kicker', 'Transformação')}</Kicker>
        </Reveal>

        {/* Headline em TRÊS linhas, uma por parte (Gabriel, 26/07): corrida,
            os três "você" ficavam empilhados no meio da frase e a virada se
            perdia. Cada linha é um bloco. */}
        <Reveal delay={80}>
          <h2 className="mt-5 max-w-4xl font-['Sora'] text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.18] tracking-tight text-white">
            <span className="block">{txt('title1', 'Com o Método Buy-Side,')}</span>
            <span className="block text-slate-500">{txt('title2', 'você deixa de disputar preço,')}</span>
            <span className="v4-serif block font-normal text-orange-400">
              {txt('title3', 'você passa a conduzir decisões.')}
            </span>
          </h2>
        </Reveal>

        {/* As três afirmações do slide */}
        {bullets.length > 0 && (
          <Reveal delay={150}>
            <ul className="mt-9 max-w-2xl space-y-3.5">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <span
                    className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-orange-500"
                    aria-hidden
                  />
                  <span
                    className={
                      i === bullets.length - 1
                        ? 'text-lg font-semibold leading-relaxed text-white md:text-xl'
                        : 'text-lg leading-relaxed text-slate-400 md:text-xl'
                    }
                  >
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {/* Comparação hoje × depois */}
        <Reveal delay={220}>
          <h3 className="mt-16 font-['Sora'] text-2xl font-bold tracking-tight text-white md:text-3xl">
            {txt('tableTitle', 'Veja sua transformação')}
          </h3>
        </Reveal>

        <Reveal delay={280}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {/* Cabeçalho das colunas */}
            <div className="grid grid-cols-2 border-b border-white/[0.08] bg-white/[0.03]">
              <p className="v4-mono px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 md:px-7">
                {hojeLabel}
              </p>
              <p className="v4-mono border-l border-white/[0.08] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-orange-400 md:px-7">
                {depoisLabel}
              </p>
            </div>

            {pares.map(([hoje, depois], i) => (
              <div
                key={i}
                className="grid grid-cols-2 border-b border-white/[0.06] last:border-b-0 hover:bg-orange-500/[0.04]"
              >
                <div className="flex items-center gap-3 px-5 py-4 md:px-7 md:py-5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06]"
                    aria-hidden
                  >
                    <X size={11} className="text-slate-500" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-snug text-slate-500 line-through decoration-slate-600 md:text-base">
                    {hoje}
                  </span>
                </div>

                <div className="flex items-center gap-3 border-l border-white/[0.06] px-5 py-4 md:px-7 md:py-5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15"
                    aria-hidden
                  >
                    <Check size={11} className="text-orange-400" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] font-semibold leading-snug text-white md:text-base">{depois}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Para quem o Método foi desenvolvido */}
        {perfis.length > 0 && temConteudo(perfisTitulo) && (
          <>
            <Reveal delay={340}>
              <h3 className="mt-16 font-['Sora'] text-2xl font-bold tracking-tight text-white md:text-3xl">
                <CMSText value={perfisTitulo} />
              </h3>
            </Reveal>
            <Reveal delay={400}>
              <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                {perfis.map((perfil, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4"
                  >
                    <span className="v4-mono shrink-0 text-sm font-bold text-orange-400/70">{`0${i + 1}`}</span>
                    <span className="text-[15px] font-semibold leading-snug text-slate-200 md:text-base">
                      {perfil}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </>
        )}
      </div>
    </section>
  )
}
