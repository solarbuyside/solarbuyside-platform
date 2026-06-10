import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow, GrainOverlay, Kicker, Reveal, SolarCells } from './atoms'
import { scrollToId } from './scroll'

/* ACESSO À PLATAFORMA — beat de "produto em ação". A compra do Manual também
   libera a Plataforma de Avaliação de Propostas; aqui mostramos um mock fiel
   do comparativo (colunas = fornecedores, linhas = critérios, Índice 0–100).
   Layout invertido (mock à esquerda, texto à direita) p/ quebrar o ritmo das
   outras seções. Copy NOVA — sujeita à aprovação do Francis. */

type Row = { label: string; scores: [number, number, number] }
const ROWS: Row[] = [
  { label: 'Reputação', scores: [60, 80, 100] },
  { label: 'Tecnologia', scores: [70, 75, 90] },
  { label: 'Viabilidade', scores: [80, 70, 85] },
]
const INDEX: [number, number, number] = [70, 76, 92]
const COLS = ['Fornecedor A', 'Fornecedor B', 'Fornecedor C']

const Bar: React.FC<{ value: number; strong?: boolean }> = ({ value, strong }) => (
  <div className="flex items-center gap-2">
    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
      <span
        className={`block h-full rounded-full ${strong ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-white/30'}`}
        style={{ width: `${value}%` }}
      />
    </span>
    <span className={`v4-mono w-7 shrink-0 text-right text-[10px] font-bold ${strong ? 'text-orange-300' : 'text-slate-400'}`}>
      {value}
    </span>
  </div>
)

/* Mock do comparativo da plataforma */
const ComparativoMock: React.FC = () => (
  <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e18]/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
    {/* barra de janela */}
    <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
      <span className="flex gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      </span>
      <span className="v4-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Comparativo de Propostas</span>
    </div>

    <div className="p-4 sm:p-5">
      {/* cabeçalho de colunas */}
      <div className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] items-end gap-3 pb-3">
        <span />
        {COLS.map((c, i) => (
          <div key={c} className="text-center">
            {i === 2 && (
              <span className="v4-mono mb-1 inline-block rounded-full bg-orange-500/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-orange-300">
                Recomendado
              </span>
            )}
            <p className={`truncate text-[11px] font-bold ${i === 2 ? 'text-white' : 'text-slate-400'}`}>{c}</p>
          </div>
        ))}
      </div>

      {/* linhas de critério */}
      <div className="space-y-3 border-t border-white/[0.06] pt-3">
        {ROWS.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] items-center gap-3">
            <span className="text-[11px] font-medium text-slate-300">{row.label}</span>
            {row.scores.map((s, i) => (
              <Bar key={i} value={s} strong={i === 2} />
            ))}
          </div>
        ))}
      </div>

      {/* índice de confiabilidade — destaque */}
      <div className="mt-4 grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] px-3 py-3">
        <span className="v4-mono text-[9px] font-bold uppercase leading-tight tracking-[0.15em] text-orange-300">
          Índice de
          <br />
          Confiabilidade
        </span>
        {INDEX.map((v, i) => (
          <div key={i} className="text-center">
            <span className={`font-['Sora'] text-2xl font-extrabold ${i === 2 ? 'v4-grad-text' : 'text-slate-500'}`}>{v}</span>
            <span className={`text-[9px] ${i === 2 ? 'text-orange-300/70' : 'text-slate-600'}`}>/100</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const PlatformV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('plataforma')

  const badge = section?.texts.badge || 'Incluso no acesso'
  const title = section?.texts.title || 'Do Manual à decisão: a Plataforma de Avaliação de Propostas'
  const lead =
    section?.texts.lead ||
    'Comprando o Manual, você também recebe acesso à plataforma onde aplica o método na prática — sem planilha manual, sem achismo.'
  const bullets = [
    section?.texts.bullet1 || 'Compare propostas de fornecedores lado a lado',
    section?.texts.bullet2 || 'Pontuação por reputação, tecnologia e viabilidade',
    section?.texts.bullet3 || 'Índice de Confiabilidade de 0 a 100 para cada fornecedor',
    section?.texts.bullet4 || 'Importe a planilha e o comparativo monta sozinho',
  ]
  const accessNote = section?.texts.accessNote || 'Acesso por 6 meses, liberado automaticamente após a compra.'
  const ctaButton = section?.texts.ctaButton || 'Quero o Manual + a Plataforma'

  return (
    <section className="relative overflow-hidden bg-[#07090d] text-slate-100 antialiased">
      <GrainOverlay />
      <SolarCells fade="center" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Mock à esquerda (inverte o ritmo das outras seções) */}
          <Reveal className="lg:col-span-7 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-orange-500/10 blur-[120px]" aria-hidden />
              <div className="relative">
                <ComparativoMock />
              </div>
            </div>
          </Reveal>

          {/* Texto à direita */}
          <div className="lg:col-span-5 lg:order-2">
            <Reveal>
              <Kicker tone="dark">{badge}</Kicker>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 font-['Sora'] text-[clamp(2.1rem,4vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-white">
                {title}
              </h2>
            </Reveal>
            <Reveal delay={170}>
              <p className="v4-serif mt-5 border-l-2 border-orange-500 pl-5 text-xl leading-snug text-amber-200/90">{lead}</p>
            </Reveal>

            <Reveal delay={250} className="mt-8">
              <ul className="space-y-3.5">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-300">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] bg-gradient-to-br from-orange-500 to-amber-400" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={340} className="mt-8">
              <Cta size="lg" onClick={() => scrollToId('oferta')}>
                {ctaButton}
                <CtaArrow size={20} />
              </Cta>
              <p className="v4-mono mt-4 text-[10px] uppercase tracking-[0.2em] text-slate-500">{accessNote}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
