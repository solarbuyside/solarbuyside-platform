import React from 'react'
import { Trophy, X } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Cta, CtaArrow, Kicker, Reveal, SolarCells } from './atoms'
import { scrollToId } from './scroll'

/* PLATAFORMA DE AVALIAÇÃO — bloco reescrito conforme os slides do Francis
   (2026-06): copy virada pro vendedor ("sua proposta tem nota; teste antes que
   o mercado teste") + um EXEMPLO REAL da tela de Pontuação Geral embutido na LP.
   Estrutura da tabela (decisão do Francis):
   - índices por grupo + Índice de Confiabilidade, todos /100;
   - SEM as sub-linhas decimais "nota /10";
   - Viabilidade é informativa → mostra "/" no lugar de um número;
   - Decisão do comprador: Renova e Self Solar como finalistas (pode divergir do
     ranking puro — é escolha do comprador);
   - Escala de risco abaixo da tabela, em tamanho menor e na régua /100;
   - mobile: 4 colunas (finalistas + melhor e pior índice).
   Estilo segue o padrão das seções escuras: destaque de título em
   v4-serif laranja e lead em slate (sem o lead âmbar, que é exclusivo do
   spotlight do Manual). */

const COMPANIES = ['Renova', 'Soli Brasil', 'Energia SGE', 'TAP Solar', 'Fotovolta Express', 'Self Solar'] as const
const INVESTMENTS = [17690, 16342.8, 15900, 14500, 17325.75, 17497]
const EMPRESAS_INDICE = [66.9, 84.5, 26.8, 55.5, 69.1, 69.3]
const TECNOLOGIAS_INDICE = [61.1, 73.7, 57.9, 55.8, 53.7, 74.7]
const CONFIABILIDADE = [64.1, 79.2, 41.9, 55.6, 61.6, 72.0]
/* Finalistas do exemplo: Renova (0) e Self Solar (5) — conforme o Francis. */
const FINALISTS = new Set([0, 5])

/* No mobile a tabela mostra só 4 fornecedores (os 2 finalistas + a melhor e a
   pior pontuação); TAP Solar e Fotovolta Express aparecem a partir de md. */
const MOBILE_HIDDEN = new Set([3, 4])
const colCls = (i: number) => (MOBILE_HIDDEN.has(i) ? 'hidden md:table-cell' : '')

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })

/* Escala na MESMA régua da tabela (/100) — a versão /10 da plataforma não faz
   sentido aqui porque as sub-linhas "nota /10" foram removidas do exemplo. */
const RISK = [
  { range: '0–40', label: 'Risco Crítico', cls: 'bg-red-500' },
  { range: '50–60', label: 'Risco Moderado', cls: 'bg-amber-500' },
  { range: '70–80', label: 'Risco Baixo', cls: 'bg-emerald-500' },
  { range: '90–100', label: 'Risco Mínimo', cls: 'bg-blue-500' },
] as const

/* Moldura de janela (mesma da experiência do produto) */
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

const DecisionTag: React.FC<{ finalist: boolean }> = ({ finalist }) =>
  finalist ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300">
      <Trophy size={11} aria-hidden /> Finalista
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-500">
      <X size={11} aria-hidden /> Descartada
    </span>
  )

/* Célula de dado padrão, com leve realce de coluna para os finalistas */
const fin = (i: number, extra = '') =>
  `px-3 py-2.5 text-center ${colCls(i)} ${FINALISTS.has(i) ? `bg-orange-500/[0.04] ${extra}` : extra}`

const ScoreTableExample: React.FC = () => (
  <Window title="Plataforma · Pontuação Geral — exemplo real">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Item
            </th>
            {COMPANIES.map((c, i) => (
              <th
                key={c}
                className={`min-w-[104px] px-3 py-3 text-center text-[11px] font-bold ${colCls(i)} ${
                  FINALISTS.has(i) ? 'text-orange-300' : 'text-slate-400'
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[12px]">
          {/* Investimentos */}
          <tr className="border-b border-white/[0.05]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-2.5 font-medium text-slate-300">Investimentos</td>
            {INVESTMENTS.map((v, i) => (
              <td key={i} className={fin(i, 'text-slate-400')}>
                {BRL.format(v)}
              </td>
            ))}
          </tr>

          {/* Empresas — Índice */}
          <tr className="border-b border-white/[0.05]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-2.5 font-medium text-slate-300">Empresas — Índice</td>
            {EMPRESAS_INDICE.map((v, i) => (
              <td key={i} className={fin(i, 'text-slate-300')}>
                {v}
                <span className="text-slate-600">/100</span>
              </td>
            ))}
          </tr>

          {/* Tecnologias — Índice */}
          <tr className="border-b border-white/[0.05]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-2.5 font-medium text-slate-300">Tecnologias — Índice</td>
            {TECNOLOGIAS_INDICE.map((v, i) => (
              <td key={i} className={fin(i, 'text-slate-300')}>
                {v}
                <span className="text-slate-600">/100</span>
              </td>
            ))}
          </tr>

          {/* Viabilidade — informativa, não pontua (mostra "/") */}
          <tr className="border-b border-white/[0.05]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-2.5">
              <span className="font-medium text-slate-300">Viabilidade</span>
              <span className="block text-[9px] text-slate-600">informativa — não pontua</span>
            </td>
            {COMPANIES.map((_, i) => (
              <td key={i} className={fin(i, 'text-slate-500')}>
                /
              </td>
            ))}
          </tr>

          {/* Índice de Confiabilidade Solar Buy-Side (destaque) */}
          <tr className="border-t border-white/10 bg-orange-500/[0.06]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-orange-300">
              Índice de Confiabilidade
            </td>
            {CONFIABILIDADE.map((v, i) => (
              <td key={i} className={`px-3 py-3 text-center ${colCls(i)} ${FINALISTS.has(i) ? 'bg-orange-500/[0.09]' : ''}`}>
                <span className={`font-['Sora'] text-lg font-extrabold ${FINALISTS.has(i) ? 'text-orange-400' : 'text-slate-300'}`}>
                  {v}
                </span>
                <span className="text-[9px] text-slate-500">/100</span>
              </td>
            ))}
          </tr>

          {/* Decisão do comprador */}
          <tr className="border-t border-white/[0.08]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Decisão do comprador
            </td>
            {COMPANIES.map((_, i) => (
              <td key={i} className={`px-3 py-3 text-center ${colCls(i)} ${FINALISTS.has(i) ? 'bg-orange-500/[0.04]' : ''}`}>
                <DecisionTag finalist={FINALISTS.has(i)} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  </Window>
)

/* Escala de risco — abaixo da tabela, compacta (tamanho menor, pedido do Francis) */
const RiskScale: React.FC = () => (
  <div className="mt-5">
    <p className="v4-mono mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Escala de risco</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {RISK.map((r) => (
        <div key={r.range} className={`rounded-lg ${r.cls} px-3 py-2 text-center text-white`}>
          <p className="font-['Sora'] text-sm font-extrabold leading-none">{r.range}</p>
          <p className="mt-1 text-[10px] font-semibold opacity-90">{r.label}</p>
        </div>
      ))}
    </div>
  </div>
)

export const PlatformV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('plataforma')

  const badge = section?.texts.badge || 'Bônus Exclusivo'
  const lead =
    section?.texts.lead ||
    'A Plataforma de Avaliação Solar Buy-Side revela as forças e fraquezas das suas ofertas, ajudando sua empresa a entregar propostas mais competitivas, confiáveis e persuasivas.'
  const bullets = [
    section?.texts.bullet1 || 'Compare propostas de fornecedores lado a lado',
    section?.texts.bullet2 || 'Pontuação por reputação, tecnologia e viabilidade',
    section?.texts.bullet3 || 'Índice de Confiabilidade de 0 a 100 para cada fornecedor',
    section?.texts.bullet4 || 'Importe a planilha e o comparativo monta sozinho',
    section?.texts.bullet5 || 'Manual completo para ler online, com busca por tópico',
    section?.texts.bullet6 || 'Avaliações salvas para retomar quando quiser',
  ]
  const accessNote = section?.texts.accessNote || 'Acesso por 6 meses, liberado automaticamente após a compra.'
  const ctaButton = section?.texts.ctaButton || 'Quero o Manual + Plataforma'

  return (
    <section className="relative overflow-hidden bg-[#07090d] text-slate-100 antialiased">
      <SolarCells fade="center" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
        {/* Header em largura própria: o texto deixa de disputar com a tabela */}
        <div className="max-w-3xl">
          <Reveal>
            <Kicker tone="dark">{badge}</Kicker>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-4 font-['Sora'] text-[clamp(2.1rem,4vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              No Buy-Side sua proposta comercial tem nota.{' '}
              <span className="v4-serif text-orange-400">Teste suas propostas antes que o mercado as teste.</span>
            </h2>
          </Reveal>
          <Reveal delay={170}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-400">{lead}</p>
          </Reveal>
        </div>

        {/* Exemplo real da tela de Pontuação Geral + escala de risco */}
        <div className="relative mt-12">
          <div className="pointer-events-none absolute -inset-10 rounded-full bg-orange-500/[0.07] blur-[130px]" aria-hidden />
          <Reveal className="relative">
            <ScoreTableExample />
            <RiskScale />
          </Reveal>
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
