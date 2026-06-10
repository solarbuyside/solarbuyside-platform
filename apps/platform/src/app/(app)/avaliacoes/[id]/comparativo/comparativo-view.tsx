"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Sparkles,
  Pencil,
  Wand2,
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
import type { ComparisonInput, CompetitorProposal, ScoreCategory } from "@/domain/comparisons/types";
import { cn } from "@/lib/utils";
import { ScoreCell } from "./score-cell";
import { RotateHint } from "./rotate-hint";
import {
  setScoreAction,
  toggleCriterionAction,
  setFinalistsAction,
  setScoringModeAction,
  applyAutoScoresAction,
} from "./actions";

type TabId = "company" | "technical" | "financial" | "overview";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "company", label: "Pontuação Empresas", icon: ShieldCheck },
  { id: "technical", label: "Pontuação Tecnológica", icon: Cpu },
  { id: "financial", label: "Análise de Viabilidade Financeira", icon: Wallet },
  { id: "overview", label: "Pontuação Geral", icon: Trophy },
];

// Botão "Ir para X" conforme a aba ativa (slides 17/18/20).
const NEXT_TAB: Record<Exclude<TabId, "overview">, { id: TabId; label: string }> = {
  company: { id: "technical", label: "Ir para Pontuação Tecnológica" },
  technical: { id: "financial", label: "Ir para Análise de Viabilidade" },
  financial: { id: "overview", label: "Ir para Pontuação Geral" },
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

const TAB_IDS: TabId[] = ["company", "technical", "financial", "overview"];

export function ComparativoView({ comparison: initial }: { comparison: ComparisonInput }) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab: TabId = TAB_IDS.includes(requestedTab as TabId)
    ? (requestedTab as TabId)
    : "company";
  const [comparison, setComparison] = React.useState<ComparisonInput>(initial);
  const [tab, setTab] = React.useState<TabId>(initialTab);
  const [saving, setSaving] = React.useState(false);
  const [applyingAuto, setApplyingAuto] = React.useState(false);

  const result = React.useMemo(
    () => calculateComparisonResult(applyAutoScores(comparison)),
    [comparison],
  );
  const isAuto = comparison.scoringMode !== "manual";

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
    category: ScoreCategory,
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

  function handleSetMode(mode: "auto" | "manual") {
    setComparison((prev) => ({ ...prev, scoringMode: mode }));
    run(() => setScoringModeAction(comparison.id, mode));
  }

  function handleApplyAuto() {
    setApplyingAuto(true);
    applyAutoScoresAction(comparison.id)
      .then(() => {
        // Reflete localmente: grava as notas auto como entries (override).
        setComparison((prev) => {
          const entries = [...prev.scoreEntries];
          const byKey = new Map(entries.map((e) => [`${e.competitorId}::${e.criterionKey}`, e]));
          for (const c of prev.competitors) {
            for (const cat of ["company", "technical"] as const) {
              const defs = cat === "company" ? companyComparisonRows : technicalComparisonRows;
              for (const row of defs) {
                if (!row.scoreKey) continue;
                const auto = autoScoreFor(row.scoreKey, cat, c);
                if (auto == null) continue;
                byKey.set(`${c.id}::${row.scoreKey}`, {
                  competitorId: c.id,
                  criterionKey: row.scoreKey,
                  score: auto,
                });
              }
            }
          }
          return { ...prev, scoreEntries: Array.from(byKey.values()) };
        });
      })
      .finally(() => setApplyingAuto(false));
  }

  return (
    <div className="space-y-5">
      {/* Aviso (mobile retrato): girar o celular para ver a tabela larga. */}
      <RotateHint />

      {/* Modo de pontuação — Automática é o padrão; o comprador clica em Manual
          para atribuir as notas ele mesmo (PPTX slide 12 / print 13). */}
      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeCard
            active={isAuto}
            onClick={() => handleSetMode("auto")}
            icon={Sparkles}
            title="Pontuação Automática"
            description="As notas são geradas automaticamente a partir dos dados fornecidos por você."
          />
          <ModeCard
            active={!isAuto}
            onClick={() => handleSetMode("manual")}
            icon={Pencil}
            title="Pontuação Manual"
            description="Você atribui suas próprias notas para cada critério."
          />
        </div>
        {isAuto && (
          <button
            onClick={handleApplyAuto}
            disabled={applyingAuto}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 text-[11px] font-bold text-primary transition-all hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50"
            title="Calcula e grava as notas automáticas em todos os critérios"
          >
            {applyingAuto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            Pontuar tudo automaticamente
          </button>
        )}
      </div>

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
          autoMode={isAuto}
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
          autoMode={isAuto}
          getAnswer={(c, prop) => answerFor(c.technical, prop)}
          manualScore={manualScore}
          isEnabled={isEnabled}
          onScore={handleScore}
          onToggle={handleToggle}
          gradeOf={(id) => result.competitors.find((x) => x.competitorId === id)?.technicalScore}
        />
      )}

      {tab === "financial" && (
        <div className="space-y-5">
          <FinancialStandardizationPanel />
          <FinancialInfoTable comparison={comparison} />
        </div>
      )}

      {tab === "overview" && (
        <OverviewTable comparison={comparison} result={result} onToggleFinalist={handleFinalist} />
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-5">
        <Link
          href={`/avaliacoes/${comparison.id}/preencher`}
          className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600"
        >
          ← Voltar ao preenchimento
        </Link>
        {tab === "overview" ? (
          <Link
            href={`/avaliacoes/${comparison.id}/finalistas`}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-[1px] hover:bg-primary/95 active:scale-[0.98]"
          >
            Definir finalistas
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            onClick={() => setTab(NEXT_TAB[tab].id)}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-[1px] hover:bg-primary/95 active:scale-[0.98]"
          >
            {NEXT_TAB[tab].label}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score table (Empresas / Tecnológica) — fiel à planilha
// ---------------------------------------------------------------------------

type Grade =
  | { points: number; maxPoints: number; grade10: number; index100: number; enabledCriteria: number }
  | undefined;

function ScoreTable({
  rows,
  category,
  comparison,
  autoMode,
  getAnswer,
  manualScore,
  isEnabled,
  onScore,
  onToggle,
  gradeOf,
}: {
  rows: ComparisonRow[];
  category: ScoreCategory;
  comparison: ComparisonInput;
  autoMode: boolean;
  getAnswer: (c: CompetitorProposal, prop: string) => unknown;
  manualScore: (competitorId: string, key: string) => number | null;
  isEnabled: (key: string, fallback: boolean) => boolean;
  onScore: (competitorId: string, key: string, category: ScoreCategory, next: number | null) => void;
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
                    // Não esmaecer a linha quando "Não": os valores precisam
                    // continuar legíveis para comparação. O estado é indicado só
                    // pelo toggle "Sim/Não" e pelo "—" na célula de nota.
                    className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/60")}
                  >
                    <td className="sticky left-0 z-10 bg-inherit border-r border-slate-100 px-4 py-2.5">
                      <div className="font-medium text-slate-700">{row.label}</div>
                      {row.rubric && <div className="mt-0.5 text-[10px] text-slate-400">{row.rubric}</div>}
                    </td>
                    {competitors.map((c) => {
                      const answer = getAnswer(c, row.prop);
                      const auto = row.scoreKey ? autoScoreFor(row.scoreKey, category, c) : null;
                      const manual = row.scoreKey ? manualScore(c.id, row.scoreKey) : null;
                      // Em modo manual, só vale a nota digitada; a auto fica de fora.
                      const effective = autoMode ? (manual ?? auto) : manual;
                      const isAutoValue = autoMode && manual == null;
                      return (
                        <React.Fragment key={c.id}>
                          <td className="border-l border-slate-100 px-3 py-2 text-center text-slate-600">
                            {formatAnswer(answer, row.kind)}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {row.scoreKey ? (
                              <ScoreCell
                                value={effective}
                                auto={isAutoValue}
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

          {/* Índice de Confiabilidade ponderado (0–100) do grupo */}
          <tr className="border-t-2 border-slate-200 bg-[#09143c]/5 font-bold">
            <td className="sticky left-0 z-10 bg-[#eef1f7] px-4 py-3 text-xs uppercase tracking-wider text-slate-700">
              Índice de Confiabilidade
            </td>
            {competitors.map((c) => {
              const g = gradeOf(c.id);
              return (
                <td key={c.id} colSpan={2} className="border-l border-slate-200 px-3 py-3 text-center">
                  <span className="text-base font-extrabold text-slate-900">{g?.index100 ?? 0}</span>
                  <span className="text-xs text-slate-400">/100</span>
                  <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
                    nota ponderada {g?.grade10 ?? 0}/10
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

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-left transition-all active:scale-[0.99]",
        active
          ? "border-primary bg-primary/5 shadow-[0_4px_15px_rgba(249,115,22,0.12)]"
          : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          active ? "bg-primary text-white" : "bg-slate-100 text-slate-400",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className={cn("block text-sm font-bold", active ? "text-primary" : "text-slate-700")}>
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{description}</span>
      </span>
    </button>
  );
}

// Painel de padronização da viabilidade econômico-financeira (PPTX slide 3-4).
function FinancialStandardizationPanel() {
  return (
    <div className="space-y-3 rounded-xl border border-amber-300/60 bg-amber-50/70 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-amber-700">
        <AlertTriangle className="h-4 w-4" />
        Não se pontua na análise de viabilidade econômico-financeira
      </p>
      <p className="text-[13px] leading-relaxed text-slate-700">
        Os valores apresentados pelas empresas variam muito e podem ser manipulados — índice de
        reajuste da energia, fator de simultaneidade e previsões de geração{" "}
        <strong>exageradas</strong> reduzem artificialmente o prazo de retorno. Quanto maiores esses
        índices, menor o payback, podendo levar a uma tomada de decisão equivocada.
      </p>
      <div className="rounded-lg bg-white/70 p-3 text-[13px] leading-relaxed text-slate-700">
        <p className="font-bold text-slate-900">Padronização das viabilidades econômico-financeiras</p>
        <p className="mt-1">
          Para comparar propostas de forma justa, todas devem usar os mesmos parâmetros de cálculo.
          Ao exigir dos vendedores os mesmos índices de reajuste tarifário e fator de simultaneidade,
          você garante uma comparação objetiva do prazo de retorno e da rentabilidade.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Inflação/reajuste da tarifa de energia:</strong> 4,0% ao ano (exemplo).
          </li>
          <li>
            <strong>Fator de simultaneidade residencial:</strong> 30% (exemplo).
          </li>
        </ul>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#09143c] text-white">
                  <th className="px-3 py-1.5 text-left font-semibold">Classe de consumo</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Fator sugerido</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {[
                  ["Residencial", "30%"],
                  ["Comercial", "60%"],
                  ["Industrial", "80%"],
                ].map(([classe, fator], i) => (
                  <tr key={classe} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-1.5 font-medium">{classe}</td>
                    <td className="px-3 py-1.5 text-right font-semibold">{fator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] leading-snug text-slate-600">
            <strong>Dica:</strong> pergunte ao ChatGPT a média de reajuste da sua distribuidora:{" "}
            <span className="italic">
              “Com base nos reajustes tarifários da distribuidora de energia do meu estado nos últimos
              10 ciclos tarifários, calcule a média anual de reajuste da tarifa residencial – Grupo B.”
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Tabela informativa da viabilidade — só dados lado a lado, sem nota nem total.
function FinancialInfoTable({ comparison }: { comparison: ComparisonInput }) {
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
                className="min-w-[140px] border-l border-white/10 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider"
              >
                {c.companyName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map(([section, sectionRows]) => (
            <React.Fragment key={section}>
              <tr>
                <td
                  colSpan={competitors.length + 1}
                  className="bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  {section}
                </td>
              </tr>
              {sectionRows.map((row, idx) => (
                <tr key={row.fieldKey} className={cn(idx % 2 === 0 ? "bg-white" : "bg-slate-50/60")}>
                  <td className="sticky left-0 z-10 bg-inherit border-r border-slate-100 px-4 py-2.5 font-medium text-slate-700">
                    {row.label}
                  </td>
                  {competitors.map((c) => (
                    <td key={c.id} className="border-l border-slate-100 px-3 py-2 text-center text-slate-600">
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
              <OverviewRow label="Empresas — Índice" competitors={competitors}>
                {(id) => `${byId(id)?.companyScore.index100 ?? 0}/100`}
              </OverviewRow>
              <OverviewRow label="Nota ponderada" competitors={competitors} muted>
                {(id) => `${byId(id)?.companyScore.grade10 ?? 0}/10`}
              </OverviewRow>
              <OverviewRow label="Tecnologias — Índice" competitors={competitors}>
                {(id) => `${byId(id)?.technicalScore.index100 ?? 0}/100`}
              </OverviewRow>
              <OverviewRow label="Nota ponderada" competitors={competitors} muted>
                {(id) => `${byId(id)?.technicalScore.grade10 ?? 0}/10`}
              </OverviewRow>
              <OverviewRow label="Índice de Confiabilidade Solar Buy-Side" competitors={competitors} highlight>
                {(id) => `${byId(id)?.totalScore.index100 ?? 0}/100`}
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
