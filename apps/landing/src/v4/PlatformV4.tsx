import React from 'react'
import { Search } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow, Kicker, Reveal, SolarCells } from './atoms'
import { scrollToId } from './scroll'

/* ACESSO À PLATAFORMA — beat de "produto em ação". A compra do Manual também
   libera a Plataforma de Avaliação de Propostas; aqui mostramos a experiência
   completa em 3 janelas: comparativo, manual online com busca e avaliações
   salvas. Header em largura cheia (texto respira), bento de mocks embaixo.
   Copy NOVA — sujeita à aprovação do Francis. */

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

/* Moldura de janela compartilhada pelos 3 mocks */
const Window: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => (
  <div
    className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e18]/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl ${className}`}
  >
    <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
      <span className="flex gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      </span>
      <span className="v4-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">{title}</span>
    </div>
    {children}
  </div>
)

/* Mock 1 — comparativo de propostas */
const ComparativoMock: React.FC = () => (
  <Window title="Comparativo de Propostas" className="h-full">
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

      {/* índice de confiabilidade */}
      <div className="mt-4 grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] px-3 py-3">
        <span className="v4-mono text-[9px] font-bold uppercase leading-tight tracking-[0.15em] text-orange-300">
          Índice de
          <br />
          Confiabilidade
        </span>
        {INDEX.map((v, i) => (
          <div key={i} className="text-center">
            <span className={`font-['Sora'] text-2xl font-extrabold ${i === 2 ? 'text-orange-400' : 'text-slate-500'}`}>{v}</span>
            <span className={`text-[9px] ${i === 2 ? 'text-orange-300/70' : 'text-slate-600'}`}>/100</span>
          </div>
        ))}
      </div>
    </div>
  </Window>
)

/* Mock 2 — manual online com busca por tópico */
const ManualMock: React.FC = () => (
  <Window title="Manual Interativo">
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
        <Search size={13} className="shrink-0 text-slate-500" aria-hidden />
        <span className="v4-mono text-[11px] text-slate-300">garantia do inversor</span>
        <span className="ml-auto h-3.5 w-px animate-pulse bg-orange-400" aria-hidden />
      </div>
      {[
        { topic: 'Garantias: o que exigir do integrador', section: 'Fase 3 • Tópico 84' },
        { topic: 'Inversor híbrido vs. string: riscos', section: 'Fase 2 • Tópico 47' },
      ].map((r) => (
        <div key={r.topic} className="rounded-xl border border-white/[0.06] px-3 py-2.5">
          <p className="text-[12px] font-semibold leading-snug text-slate-200">{r.topic}</p>
          <p className="v4-mono mt-1 text-[9px] uppercase tracking-[0.15em] text-orange-300/80">{r.section}</p>
        </div>
      ))}
    </div>
  </Window>
)

/* Mock 3 — avaliações salvas (histórico) */
const HistoricoMock: React.FC = () => (
  <Window title="Minhas Avaliações">
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      {[
        { name: 'Residência 8 kWp', meta: '3 propostas avaliadas', index: 92 },
        { name: 'Galpão 75 kWp', meta: '5 propostas avaliadas', index: 88 },
      ].map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-slate-200">{item.name}</p>
            <p className="v4-mono mt-0.5 text-[9px] uppercase tracking-[0.15em] text-slate-500">{item.meta}</p>
          </div>
          <span className="font-['Sora'] text-lg font-extrabold text-orange-400">
            {item.index}
            <span className="text-[9px] font-bold text-orange-300/60">/100</span>
          </span>
        </div>
      ))}
    </div>
  </Window>
)

export const PlatformV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('plataforma')

  const badge = section?.texts.badge || 'Incluso no acesso'
  const title = section?.texts.title || 'Do Manual à decisão: a Plataforma de Avaliação de Propostas'
  const lead =
    section?.texts.lead ||
    'Comprando o Manual, você também recebe acesso à plataforma onde aplica o método na prática, sem planilha manual e sem achismo.'
  const bullets = [
    section?.texts.bullet1 || 'Compare propostas de fornecedores lado a lado',
    section?.texts.bullet2 || 'Pontuação por reputação, tecnologia e viabilidade',
    section?.texts.bullet3 || 'Índice de Confiabilidade de 0 a 100 para cada fornecedor',
    section?.texts.bullet4 || 'Importe a planilha e o comparativo monta sozinho',
    section?.texts.bullet5 || 'Manual completo para ler online, com busca por tópico',
    section?.texts.bullet6 || 'Avaliações salvas para retomar quando quiser',
  ]
  const accessNote = section?.texts.accessNote || 'Acesso por 6 meses, liberado automaticamente após a compra.'
  const ctaButton = section?.texts.ctaButton || 'Quero o Manual + a Plataforma'

  return (
    <section className="relative overflow-hidden bg-[#07090d] text-slate-100 antialiased">
      <SolarCells fade="center" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
        {/* Header em largura própria: o texto deixa de disputar com o mock */}
        <div className="max-w-3xl">
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
        </div>

        {/* Bento: comparativo protagonista + manual online + histórico */}
        <div className="relative mt-12">
          <div className="pointer-events-none absolute -inset-10 rounded-full bg-orange-500/[0.07] blur-[130px]" aria-hidden />
          <div className="relative grid gap-5 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <ComparativoMock />
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              <Reveal delay={110}>
                <ManualMock />
              </Reveal>
              <Reveal delay={200}>
                <HistoricoMock />
              </Reveal>
            </div>
          </div>
        </div>

        {/* O que isso significa na prática */}
        <Reveal delay={120} className="mt-12">
          <ul className="grid gap-x-10 gap-y-4 border-t border-white/[0.08] pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-300">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] bg-gradient-to-br from-orange-500 to-amber-400" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={200} className="mt-12 flex flex-col items-center gap-4">
          <Cta size="lg" variant="ghost-dark" onClick={() => scrollToId('oferta')}>
            {ctaButton}
            <CtaArrow size={20} />
          </Cta>
          <p className="v4-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">{accessNote}</p>
        </Reveal>
      </div>
    </section>
  )
}
