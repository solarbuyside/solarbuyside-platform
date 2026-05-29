"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Wallet,
  Trophy,
  ArrowRight,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Info,
} from "lucide-react";

import {
  companyComparisonRows,
  technicalComparisonRows,
  financialComparisonRows,
  formatAnswer,
  answerFor,
  type ComparisonRow,
} from "@/domain/comparisons/comparison-rows";
import { calculateComparisonResult } from "@/domain/comparisons/scoring";
import { applyAutoScores, autoScoreFor } from "@/domain/comparisons/auto-scoring";
import type { ComparisonInput, CompetitorProposal } from "@/domain/comparisons/types";
import { cn } from "@/lib/utils";
import { ScoreCell } from "./score-cell";
import { setScoreAction, toggleCriterionAction, setFinalistsAction } from "./actions";

type TabId = "company" | "technical" | "financial" | "overview";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "company", label: "Avaliação Empresas", icon: ShieldCheck },
  { id: "technical", label: "Avaliação Tecnológica", icon: Cpu },
  { id: "financial", label: "Viabilidade Financeira", icon: Wallet },
  { id: "overview", label: "Pontuação Geral", icon: Trophy },
];

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

export function ComparativoView({ comparison: initial }: { comparison: ComparisonInput }) {
  const [comparison, setComparison] = React.useState<ComparisonInput>(initial);
  const [tab, setTab] = React.useState<TabId>("company");
  const [saving, setSaving] = React.useState(false);

  const result = React.useMemo(
    () => calculateComparisonResult(applyAutoScores(comparison)),
    [comparison],
  );

  const run = React.useCallback((fn: () => Promise<void>) => {
    setSaving(true);
    fn().finally(() => setSaving(false));
  }, []);

  function manualScore(competitorId: string, key: string): number | null {
    const entry = comparison.scoreEntries.find(
      (e) => e.competitorId === competitorId && e.criterionKey === key,
    );
    return entry?.score ?? null;
  }

  function settingFor(key: string) {
    return comparison.scoreSettings.find((s) => s.criterionKey === key);
  }
  function isEnabled(key: string, fallback: boolean) {
    return settingFor(key)?.enabled ?? fallback;
  }

  function handleScore(
    competitorId: string,
    key: string,
    category: "company" | "technical",
    next: number | null,
  ) {
    setComparison((prev) => {
      const others = prev.scoreEntries.filter(
        (e) => !(e.competitorId === competitorId && e.criterionKey === key),
      );
      return { ...prev, scoreEntries: [...others, { competitorId, criterionKey: key, score: next }] };
    });
    run(() => setScoreAction(comparison.id, competitorId, key, category, next));
  }

  function handleToggle(key: string, fallbackEnabled: boolean) {
    const current = isEnabled(key, fallbackEnabled);
    const next = !current;
    const weight = settingFor(key)?.weight ?? 1;
    setComparison((prev) => {
      const others = prev.scoreSettings.filter((s) => s.criterionKey !== key);
      return { ...prev, scoreSettings: [...others, { criterionKey: key, enabled: next, weight }] };
    });
    run(() => toggleCriterionAction(comparison.id, key, next, weight));
  }

  function handleFinalist(competitorId: string) {
    setComparison((prev) => {
      const cur = [...prev.selectedFinalistIds];
      const has = cur.includes(competitorId);
      let nextIds: string[];
      if (has) nextIds = cur.filter((id) => id !== competitorId);
      else if (cur.length >= 2) nextIds = [cur[1], competitorId];
      else nextIds = [...cur, competitorId];
      run(() => setFinalistsAction(prev.id, nextIds));
      return { ...prev, selectedFinalistIds: nextIds };
    });
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all",
                  tab === t.id
                    ? "border-primary font-semibold text-primary"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
        <span
          className={cn(
            "hidden shrink-0 items-center gap-1.5 text-xs font-medium sm:flex",
            saving ? "text-slate-500" : "text-slate-300",
          )}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {saving ? "Salvando…" : "Salvo"}
        </span>
      </div>

      {tab === "company" && (
        <ScoreTable
          rows={companyComparisonRows}
          category="company"
          comparison={comparison}
          result={result}
          getAnswer={(c, prop) => answerFor(c.company, prop)}
          manualScore={manualScore}
          isEnabled={isEnabled}
          onScore={handleScore}
          onToggle={handleToggle}
          gradeOf={(id) => result.competitors.find((x) => x.competitorId === id)?.companyScore}
        />
      )}

      {tab === "technical" && (
        <ScoreTable
          rows={technicalComparisonRows}
          category="technical"
          comparison={comparison}
          result={result}
          getAnswer={(c, prop) => answerFor(c.technical, prop)}
          manualScore={manualScore}
          isEnabled={isEnabled}
          onScore={handleScore}
          onToggle={handleToggle}
          gradeOf={(id) => result.competitors.find((x) => x.competitorId === id)?.technicalScore}
        />
      )}

      {tab === "financial" && <FinancialTable comparison={comparison} />}

      {tab === "overview" && (
        <OverviewTable comparison={comparison} result={result} onToggleFinalist={handleFinalist} />
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-5">
        <Link
          href={`/avaliacoes/${comparison.id}/preencher`}
          className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600"
        >
          ← Voltar à entrevista
        </Link>
        <Link
          href={`/avaliacoes/${comparison.id}/finalistas`}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-[1px] hover:bg-primary/95 active:scale-[0.98]"
        >
          Definir finalistas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score table (Empresas / Tecnológica) — fiel à planilha
// ---------------------------------------------------------------------------

type Grade = { points: number; maxPoints: number; grade10: number; enabledCriteria: number } | undefined;

function ScoreTable({
  rows,
  category,
  comparison,
  getAnswer,
  manualScore,
  isEnabled,
  onScore,
  onToggle,
  gradeOf,
}: {
  rows: ComparisonRow[];
  category: "company" | "technical";
  comparison: ComparisonInput;
  result: ReturnType<typeof calculateComparisonResult>;
  getAnswer: (c: CompetitorProposal, prop: string) => unknown;
  manualScore: (competitorId: string, key: string) => number | null;
  isEnabled: (key: string, fallback: boolean) => boolean;
  onScore: (competitorId: string, key: string, category: "company" | "technical", next: number | null) => void;
  onToggle: (key: string, fallbackEnabled: boolean) => void;
  gradeOf: (competitorId: string) => Grade;
}) {
  const { competitors } = comparison;

  // Agrupa por seção, como na planilha.
  const sections = React.useMemo(() => {
    const map = new Map<string, ComparisonRow[]>();
    for (const r of rows) {
      const list = map.get(r.section) ?? [];
      list.push(r);
      map.set(r.section, list);
    }
    return Array.from(map.entries());
  }, [rows]);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#09143c] text-white">
            <th className="sticky left-0 z-10 min-w-[260px] bg-[#09143c] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Item
            </th>
            {competitors.map((c) => (
              <th
                key={c.id}
                colSpan={2}
                className="min-w-[180px] border-l border-white/10 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider"
              >
                {c.companyName}
              </th>
            ))}
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">Avaliar?</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(([section, sectionRows]) => (
            <React.Fragment key={section}>
              <tr>
                <td
                  colSpan={competitors.length * 2 + 2}
                  className="bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  {section}
                </td>
              </tr>
              {sectionRows.map((row, idx) => {
                const enabled = row.scoreKey ? isEnabled(row.scoreKey, row.defaultEnabled) : true;
                return (
                  <tr
                    key={row.fieldKey}
                    className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/60", !enabled && "opacity-50")}
                  >
                    <td className="sticky left-0 z-10 bg-inherit border-r border-slate-100 px-4 py-2.5">
                      <div className="font-medium text-slate-700">{row.label}</div>
                      {row.rubric && <div className="mt-0.5 text-[10px] text-slate-400">{row.rubric}</div>}
                    </td>
                    {competitors.map((c) => {
                      const answer = getAnswer(c, row.prop);
                      const auto = row.scoreKey ? autoScoreFor(row.scoreKey, category, c) : null;
                      const manual = row.scoreKey ? manualScore(c.id, row.scoreKey) : null;
                      const effective = manual ?? auto;
                      return (
                        <React.Fragment key={c.id}>
                          <td className="border-l border-slate-100 px-3 py-2 text-center text-slate-600">
                            {formatAnswer(answer, row.kind)}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {row.scoreKey ? (
                              <ScoreCell
                                value={effective}
                                auto={manual == null}
                                disabled={!enabled}
                                onChange={(next) => onScore(c.id, row.scoreKey!, category, next)}
                              />
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="px-3 py-2 text-center">
                      {row.scoreKey ? (
                        <ToggleAvaliar enabled={enabled} onToggle={() => onToggle(row.scoreKey!, row.defaultEnabled)} />
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}

          {/* Totais */}
          <tr className="border-t-2 border-slate-200 bg-[#09143c]/5 font-bold">
            <td className="sticky left-0 z-10 bg-[#eef1f7] px-4 py-3 text-xs uppercase tracking-wider text-slate-700">
              Total da pontuação
            </td>
            {competitors.map((c) => {
              const g = gradeOf(c.id);
              return (
                <td key={c.id} colSpan={2} className="border-l border-slate-200 px-3 py-3 text-center">
                  <span className="text-base font-extrabold text-slate-900">{g?.grade10 ?? 0}</span>
                  <span className="text-xs text-slate-400">/10</span>
                  <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
                    {g?.points ?? 0} / {g?.maxPoints ?? 0} pts
                  </span>
                </td>
              );
            })}
            <td className="px-3 py-3 text-center text-slate-400">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ToggleAvaliar({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold transition-all active:scale-95",
        enabled
          ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
          : "bg-slate-100 text-slate-400 hover:bg-slate-200",
      )}
      title={enabled ? "Avaliando — clique para desligar esta linha" : "Desligado — clique para avaliar"}
    >
      {enabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {enabled ? "Sim" : "Não"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Viabilidade Financeira (informativo, sem nota) + mensagem
// ---------------------------------------------------------------------------

function FinancialTable({ comparison }: { comparison: ComparisonInput }) {
  const { competitors } = comparison;
  const sections = React.useMemo(() => {
    const map = new Map<string, typeof financialComparisonRows>();
    for (const r of financialComparisonRows) {
      const list = map.get(r.section) ?? [];
      list.push(r);
      map.set(r.section, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#09143c] text-white">
              <th className="sticky left-0 z-10 min-w-[260px] bg-[#09143c] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                Item
              </th>
              {competitors.map((c) => (
                <th key={c.id} className="min-w-[150px] border-l border-white/10 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  {c.companyName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map(([section, rows]) => (
              <React.Fragment key={section}>
                <tr>
                  <td colSpan={competitors.length + 1} className="bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {section}
                  </td>
                </tr>
                {rows.map((row, idx) => (
                  <tr key={row.fieldKey} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="sticky left-0 z-10 bg-inherit border-r border-slate-100 px-4 py-2.5 font-medium text-slate-700">
                      {row.label}
                    </td>
                    {competitors.map((c) => (
                      <td key={c.id} className="border-l border-slate-100 px-3 py-2.5 text-center text-slate-700">
                        {formatAnswer(answerFor(c.financial, row.prop), row.kind)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensagem de alerta — texto fiel à planilha */}
      <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          Observações sobre o quadro de viabilidade econômico-financeira
        </p>
        <div className="space-y-3 text-[13px] leading-relaxed text-slate-700">
          <p>
            Você notou que não atribuímos pontuação para a análise de viabilidade econômico-financeira.
            Isso acontece porque muitas vezes os valores apresentados pelas empresas variam muito e podem
            não ser confiáveis.
          </p>
          <p>
            É crucial entender que análises como essa, focadas em sistemas fotovoltaicos, podem ser
            facilmente manipuladas. Isso ocorre quando variáveis importantes como o índice de reajuste da
            energia, o fator de simultaneidade e as previsões de geração <strong>EXAGERADAS</strong> levam
            a valores artificiais — prejudicando a qualidade da análise e fazendo com que você tome
            decisões erradas.
          </p>
          <p className="font-semibold text-amber-800">
            De forma geral: maiores os índices de reajuste da energia, de simultaneidade e de geração,
            menor o prazo de retorno — podendo levar a resultado enganador!
          </p>
          <p>
            Este quadro tem como objetivo permitir uma análise comparativa entre os valores apresentados,
            possibilitando que você tire conclusões informadas.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pontuação Geral
// ---------------------------------------------------------------------------

function OverviewTable({
  comparison,
  result,
  onToggleFinalist,
}: {
  comparison: ComparisonInput;
  result: ReturnType<typeof calculateComparisonResult>;
  onToggleFinalist: (competitorId: string) => void;
}) {
  const { competitors } = comparison;
  const byId = (id: string) => result.competitors.find((x) => x.competitorId === id);
  const selectedCount = comparison.selectedFinalistIds.length;

  return (
    <div className="space-y-6">
      {/* Seção 1 — Pontuação das propostas */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
          <Trophy className="h-4 w-4 text-primary" /> Seção 1 — Pontuação das propostas
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#09143c] text-white">
                <th className="sticky left-0 z-10 min-w-[180px] bg-[#09143c] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Item
                </th>
                {competitors.map((c) => (
                  <th key={c.id} className="min-w-[130px] border-l border-white/10 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                    {c.companyName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <OverviewRow label="Investimentos" competitors={competitors}>
                {(id) => {
                  const inv = byId(id)?.investment;
                  return inv != null ? BRL.format(inv) : "—";
                }}
              </OverviewRow>
              <OverviewRow label="Empresas (pontos)" competitors={competitors}>
                {(id) => byId(id)?.companyScore.points ?? 0}
              </OverviewRow>
              <OverviewRow label="Nota sobre 10" competitors={competitors} muted>
                {(id) => `${byId(id)?.companyScore.grade10 ?? 0}/10`}
              </OverviewRow>
              <OverviewRow label="Tecnologias (pontos)" competitors={competitors}>
                {(id) => byId(id)?.technicalScore.points ?? 0}
              </OverviewRow>
              <OverviewRow label="Nota sobre 10" competitors={competitors} muted>
                {(id) => `${byId(id)?.technicalScore.grade10 ?? 0}/10`}
              </OverviewRow>
              <OverviewRow label="Total (pontos)" competitors={competitors} strong>
                {(id) => byId(id)?.totalScore.points ?? 0}
              </OverviewRow>
              <OverviewRow label="Nota sobre 10" competitors={competitors} highlight>
                {(id) => `${byId(id)?.totalScore.grade10 ?? 0}/10`}
              </OverviewRow>

              {/* Decisão do comprador */}
              <tr className="border-t-2 border-slate-200">
                <td className="sticky left-0 z-10 bg-amber-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700">
                  ✅ Decisão do comprador
                </td>
                {competitors.map((c) => {
                  const selected = comparison.selectedFinalistIds.includes(c.id);
                  return (
                    <td key={c.id} className="border-l border-slate-100 px-3 py-2 text-center">
                      <button
                        onClick={() => onToggleFinalist(c.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95",
                          selected
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {selected ? <Trophy className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        {selected ? "Finalista" : "Descartada"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <Check className="h-3.5 w-3.5" />
          {selectedCount} de 2 finalistas selecionados
        </p>
      </section>

      {/* Seção 2 — Escala de risco */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
          🎯 Seção 2 — Escala de risco
        </h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { range: "0–4", label: "Risco Crítico", cls: "bg-red-500" },
            { range: "5–6", label: "Risco Moderado", cls: "bg-amber-500" },
            { range: "7–8", label: "Risco Baixo", cls: "bg-emerald-500" },
            { range: "9–10", label: "Risco Mínimo", cls: "bg-blue-500" },
          ].map((r) => (
            <div key={r.range} className={cn("rounded-xl p-4 text-center text-white", r.cls)}>
              <p className="text-lg font-extrabold">{r.range}</p>
              <p className="text-sm font-semibold">{r.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 3 — Observações importantes */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
          📌 Seção 3 — Observações importantes
        </h3>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-[13px] leading-relaxed text-slate-700 shadow-sm">
          <div>
            <p className="font-bold text-slate-900">As duas propostas finalistas, para a última rodada de negociações:</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              <li>Apesar de poderem não ter o menor preço, foram as melhores no conjunto de critérios avaliados.</li>
              <li>Obtiveram as maiores pontuações, refletindo maior experiência, competência e estrutura no setor.</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-slate-900">Considerações sobre preços e riscos ocultos:</p>
            <p className="mt-1">O menor preço pode, em alguns casos, ocultar riscos significativos, como:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Tecnologias de marcas pouco conhecidas no mercado brasileiro.</li>
              <li>Equipamentos de qualidade inferior ou de segunda linha.</li>
              <li>Indícios de fragilidade estrutural ou organizacional da empresa fornecedora.</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-slate-900">Equilíbrio entre proposta tecnológica e competência:</p>
            <p className="mt-1">
              Uma proposta tecnológica de ponta pode não bastar se a empresa tiver pouca experiência. E
              empresas consolidadas podem, às vezes, oferecer tecnologia inferior a preços mais baixos para
              se manter competitivas.
            </p>
          </div>
          <div className="flex gap-2 rounded-lg bg-amber-50 p-3">
            <Info className="h-4 w-4 shrink-0 text-amber-600" />
            <p>
              <strong>Conclusão:</strong> não existe escolha universalmente certa. A decisão ideal é a que
              considera os critérios mais relevantes para as suas necessidades, tomada de forma consciente
              e esclarecida.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function OverviewRow({
  label,
  competitors,
  children,
  muted,
  strong,
  highlight,
}: {
  label: string;
  competitors: CompetitorProposal[];
  children: (competitorId: string) => React.ReactNode;
  muted?: boolean;
  strong?: boolean;
  highlight?: boolean;
}) {
  return (
    <tr className={cn(highlight && "bg-primary/5", strong && "border-t border-slate-200")}>
      <td
        className={cn(
          "sticky left-0 z-10 bg-white px-4 py-2.5",
          muted ? "text-[11px] italic text-slate-400" : "font-medium text-slate-700",
          highlight && "bg-primary/5 font-bold",
        )}
      >
        {label}
      </td>
      {competitors.map((c) => (
        <td
          key={c.id}
          className={cn(
            "border-l border-slate-100 px-3 py-2.5 text-center",
            muted ? "text-[11px] italic text-slate-400" : "text-slate-700",
            (strong || highlight) && "font-bold",
            highlight && "bg-primary/5 text-primary",
          )}
        >
          {children(c.id)}
        </td>
      ))}
    </tr>
  );
}
