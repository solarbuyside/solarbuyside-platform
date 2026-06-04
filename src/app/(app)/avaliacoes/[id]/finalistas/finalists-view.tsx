"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Check,
  ArrowLeft,
  Crown,
} from "lucide-react";

import { calculateComparisonResult } from "@/domain/comparisons/scoring";
import { applyAutoScores } from "@/domain/comparisons/auto-scoring";
import type { ComparisonInput, CompetitorResult } from "@/domain/comparisons/types";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { updateSelectedFinalistsAction } from "@/app/(app)/dashboard/[id]/actions";

export function FinalistsView({ comparison: initial }: { comparison: ComparisonInput }) {
  const [comparison, setComparison] = React.useState<ComparisonInput>(initial);

  const result = React.useMemo(
    () => calculateComparisonResult(applyAutoScores(comparison)),
    [comparison],
  );
  const ranked = React.useMemo(
    () => [...result.competitors].sort((a, b) => a.rank - b.rank),
    [result],
  );

  const selectedIds = comparison.selectedFinalistIds;
  const finalists = ranked.filter((c) => selectedIds.includes(c.competitorId));

  function toggleFinalist(competitorId: string) {
    setComparison((prev) => {
      const current = [...prev.selectedFinalistIds];
      const isSelected = current.includes(competitorId);
      let next: string[];
      if (isSelected) next = current.filter((id) => id !== competitorId);
      else if (current.length >= 2) next = [current[1], competitorId];
      else next = [...current, competitorId];
      void updateSelectedFinalistsAction(prev.id, next);
      return { ...prev, selectedFinalistIds: next };
    });
  }

  const ready = finalists.length === 2;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Selection bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Trophy className="h-4.5 w-4.5 text-primary" />
            Escolha os dois finalistas
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            O sistema sugere pelo ranking, mas a decisão final é sua.
          </p>
        </div>
        <Badge variant={ready ? "emerald" : "orange"} className="w-fit">
          {selectedIds.length}/2 selecionados
        </Badge>
      </div>

      {/* Quick chooser */}
      <div className="flex flex-wrap gap-2">
        {ranked.map((c) => {
          const isSelected = selectedIds.includes(c.competitorId);
          const isRecommended = result.recommendedFinalistIds.includes(c.competitorId);
          return (
            <button
              key={c.competitorId}
              onClick={() => toggleFinalist(c.competitorId)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded border",
                  isSelected ? "border-primary bg-primary text-white" : "border-slate-300 text-transparent",
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              {c.companyName}
              <span className="text-xs font-bold text-slate-400">{c.totalScore.grade10}</span>
              {isRecommended && (
                <Badge variant="orange" className="text-[8px]">
                  sugerido
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Podium */}
      {ready ? (
        <Podium finalists={finalists} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Selecione dois finalistas acima para ver o comparativo final.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <Link
          href={`/avaliacoes/${comparison.id}/comparativo?tab=overview`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à Pontuação Geral
        </Link>
      </div>
    </div>
  );
}

function Podium({ finalists }: { finalists: CompetitorResult[] }) {
  // Best-ranked first (leftmost), styled as the winner.
  const ordered = [...finalists].sort((a, b) => a.rank - b.rank);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {ordered.map((c, i) => (
        <FinalistCard key={c.competitorId} competitor={c} primary={i === 0} />
      ))}
    </div>
  );
}

function FinalistCard({
  competitor,
  primary,
}: {
  competitor: CompetitorResult;
  primary: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-white p-7 shadow-sm transition-all",
        primary
          ? "border-primary/40 shadow-[0_8px_40px_-12px_rgba(249,115,22,0.35)] ring-1 ring-primary/20"
          : "border-slate-200",
      )}
    >
      {/* Ambient glow for the winner */}
      {primary && (
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      )}

      {/* Medal / crown */}
      <div className="relative mb-5 flex items-center justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            primary
              ? "bg-primary/15 text-primary shadow-[0_0_18px_rgba(249,115,22,0.25)]"
              : "bg-slate-100 text-slate-400",
          )}
        >
          {primary ? <Crown className="h-6 w-6" /> : <Medal className="h-6 w-6" />}
        </div>
        <Badge variant={primary ? "orange" : "secondary"} className="uppercase tracking-wider">
          {primary ? "1ª opção" : "2ª opção"}
        </Badge>
      </div>

      <div className="relative">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{competitor.companyName}</h3>
        <p className="mt-0.5 text-xs text-slate-400">Proposta #{competitor.position}</p>
      </div>

      {/* Big score */}
      <div className="relative mt-5 flex items-end gap-4">
        <div>
          <span className="text-5xl font-extrabold text-slate-900">{competitor.totalScore.grade10}</span>
          <span className="text-lg font-bold text-slate-300">/10</span>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nota geral</p>
        </div>
        <div className="flex-1 space-y-1.5 pb-1">
          <ScoreBar label="Empresa" value={competitor.companyScore.grade10} />
          <ScoreBar label="Técnico" value={competitor.technicalScore.grade10} />
          <ScoreBar label="Viabilidade" value={competitor.financialScore.grade10} />
        </div>
      </div>

      {/* Investment */}
      <div className="relative mt-5 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        <span className="text-xs font-semibold text-slate-500">Investimento total</span>
        <span className="text-base font-bold text-slate-900">
          {formatCurrencyBRL(competitor.investment)}
        </span>
      </div>

    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary" style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <span className="w-6 text-right text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}
