import React from 'react'
import { Check, X } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Reveal } from './atoms'

/* TRANSFORMAÇÃO (Francis, slide 8: "criar uma nova seção TRANSFORMAÇÃO").

   Os textos são exatamente os do slide. O visual, não: o slide é fundo preto
   com fonte branca e uma tabela de emojis ❌/✅. Aqui a seção fecha o ato
   "paper" que começa no depoimento do Lucas, usando a paleta e os átomos da
   própria LP (Gabriel, 26/07: "usando as cores atuais do sistema, componentes
   atuais... um visual muito mais bonito").

   A comparação não é uma tabela: são seis pares em duas colunas separadas por
   uma calha. "Hoje" fica apagado e riscado (o que se perde), "Depois" fica em
   peso cheio com o check laranja (o que se ganha). No mobile as colunas viram
   duas linhas por par, para o olho ler sempre no sentido hoje → depois. */

const PARES_PADRAO: [string, string][] = [
  ['Disputa preço', 'Defende valor'],
  ['Responde objeções', 'Evita objeções'],
  ['Espera a decisão', 'Conduz a decisão'],
  ['Vende equipamento', 'Vende confiança'],
  ['Fecha quando consegue', 'Fecha mais rápido'],
  ['É apenas vendedor', 'É consultor estratégico'],
]

export const TransformacaoV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('transformacao')

  const bullets = [
    section?.texts.bullet1 || 'O cliente não compra porque foi convencido.',
    section?.texts.bullet2 || 'Ele compra porque sente segurança em seguir a sua recomendação.',
    section?.texts.bullet3 || 'É exatamente essa transformação que o Método Solar Buy-Side desenvolve.',
  ]

  const pares = PARES_PADRAO.map(([hoje, depois], i) => [
    section?.texts[`row${i + 1}Hoje`] || hoje,
    section?.texts[`row${i + 1}Depois`] || depois,
  ])

  const hojeLabel = section?.texts.hojeLabel || 'Hoje'
  const depoisLabel = section?.texts.depoisLabel || 'Depois'

  return (
    <section className="bg-[#f7f8fa] px-6 pb-24 pt-8 text-slate-900 md:pb-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-600">
            {section?.texts.kicker || 'Transformação'}
          </p>
        </Reveal>

        {/* Headline: as três linhas do slide, com a virada em serif */}
        <Reveal delay={80}>
          <h2 className="mt-5 max-w-3xl font-['Sora'] text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900">
            {section?.texts.title1 || 'Com o Método Buy-Side,'}{' '}
            <span className="text-slate-500">{section?.texts.title2 || 'você deixa de disputar preço,'}</span>{' '}
            <span className="v4-serif font-normal text-orange-600">
              {section?.texts.title3 || 'você passa a conduzir decisões.'}
            </span>
          </h2>
        </Reveal>

        {/* As três afirmações do slide */}
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
                      ? 'text-lg font-semibold leading-relaxed text-slate-900 md:text-xl'
                      : 'text-lg leading-relaxed text-slate-600 md:text-xl'
                  }
                >
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Comparação hoje × depois */}
        <Reveal delay={220}>
          <h3 className="mt-16 font-['Sora'] text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {section?.texts.tableTitle || 'Veja sua transformação'}
          </h3>
        </Reveal>

        <Reveal delay={280}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Cabeçalho das colunas */}
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80">
              <p className="v4-mono px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 md:px-7">
                {hojeLabel}
              </p>
              <p className="v4-mono border-l border-slate-200 px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600 md:px-7">
                {depoisLabel}
              </p>
            </div>

            {pares.map(([hoje, depois], i) => (
              <div
                key={i}
                className="grid grid-cols-2 border-b border-slate-100 last:border-b-0 hover:bg-orange-500/[0.03]"
              >
                <div className="flex items-center gap-3 px-5 py-4 md:px-7 md:py-5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100"
                    aria-hidden
                  >
                    <X size={11} className="text-slate-400" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-snug text-slate-400 line-through decoration-slate-300 md:text-base">
                    {hoje}
                  </span>
                </div>

                <div className="flex items-center gap-3 border-l border-slate-100 px-5 py-4 md:px-7 md:py-5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/10"
                    aria-hidden
                  >
                    <Check size={11} className="text-orange-600" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] font-semibold leading-snug text-slate-900 md:text-base">
                    {depois}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
