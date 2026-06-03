"use server";

import { revalidatePath } from "next/cache";

import {
  saveScoreEntry,
  saveScoreSetting,
  saveSelectedFinalists,
  saveScoringMode,
  applyAutoScoresToAll,
} from "@/lib/comparisons/repository";
import type { ScoreCategory } from "@/domain/comparisons/types";

function revalidate(comparisonId: string) {
  revalidatePath(`/avaliacoes/${comparisonId}/comparativo`);
  revalidatePath(`/avaliacoes/${comparisonId}/finalistas`);
  revalidatePath(`/dashboard/${comparisonId}`);
}

/** Salva (override manual) a nota 0-10 de um critério para um fornecedor. */
export async function setScoreAction(
  comparisonId: string,
  competitorId: string,
  criterionKey: string,
  category: ScoreCategory,
  score: number | null,
) {
  const normalized =
    typeof score === "number" && Number.isFinite(score)
      ? Math.min(10, Math.max(0, Math.round(score)))
      : null;
  await saveScoreEntry(comparisonId, competitorId, criterionKey, category, normalized);
  revalidate(comparisonId);
}

/** Liga/desliga uma linha (coluna "Avaliar?") — recalcula o denominador. */
export async function toggleCriterionAction(
  comparisonId: string,
  criterionKey: string,
  enabled: boolean,
  weight: number,
) {
  const safeWeight = Math.min(10, Math.max(1, Math.round(weight)));
  await saveScoreSetting(comparisonId, criterionKey, enabled, safeWeight);
  revalidate(comparisonId);
}

export async function setFinalistsAction(comparisonId: string, finalistIds: string[]) {
  await saveSelectedFinalists(comparisonId, finalistIds);
  revalidate(comparisonId);
}

/** Define o modo de pontuação da avaliação (automático ou manual). */
export async function setScoringModeAction(comparisonId: string, mode: "auto" | "manual") {
  await saveScoringMode(comparisonId, mode);
  revalidate(comparisonId);
}

/** Aplica as notas automáticas a todos os critérios (override em massa). */
export async function applyAutoScoresAction(comparisonId: string) {
  await applyAutoScoresToAll(comparisonId);
  revalidate(comparisonId);
}
