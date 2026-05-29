"use server";

import { revalidatePath } from "next/cache";

import {
  companyEvaluationSchema,
  financialEvaluationSchema,
  technicalEvaluationSchema,
} from "@/domain/comparisons/types";
import {
  saveCompanyEvaluation,
  saveFinancialEvaluation,
  saveScoreEntry,
  saveScoreSetting,
  saveSelectedFinalists,
  saveTechnicalEvaluation,
} from "@/lib/comparisons/repository";
import { ensureShareToken } from "@/lib/comparisons/share";
import { saveCompanyToLibrary } from "@/lib/comparisons/saved-companies";
import { getAppUrl } from "@/lib/env";

/**
 * Server actions consumed by the step wizard. Each one validates the incoming
 * domain object with the same zod schemas the engine uses, then persists it.
 * Saving is per-competitor (one row each) so the wizard can auto-save fields
 * as the buyer fills them in.
 */

export async function saveCompanyEvaluationAction(
  comparisonId: string,
  competitorId: string,
  evaluation: unknown,
) {
  const parsed = companyEvaluationSchema.parse(evaluation);
  await saveCompanyEvaluation(comparisonId, competitorId, parsed);
  revalidatePath(`/avaliacoes/${comparisonId}/preencher`);
}

export async function saveTechnicalEvaluationAction(
  comparisonId: string,
  competitorId: string,
  evaluation: unknown,
) {
  const parsed = technicalEvaluationSchema.parse(evaluation);
  await saveTechnicalEvaluation(comparisonId, competitorId, parsed);
  revalidatePath(`/avaliacoes/${comparisonId}/preencher`);
}

export async function saveFinancialEvaluationAction(
  comparisonId: string,
  competitorId: string,
  evaluation: unknown,
) {
  const parsed = financialEvaluationSchema.parse(evaluation);
  await saveFinancialEvaluation(comparisonId, competitorId, parsed);
  revalidatePath(`/avaliacoes/${comparisonId}/preencher`);
}

export async function saveScoreEntryAction(
  comparisonId: string,
  competitorId: string,
  criterionKey: string,
  category: "company" | "technical",
  score: number | null,
) {
  const normalized =
    typeof score === "number" && Number.isFinite(score)
      ? Math.min(10, Math.max(0, score))
      : null;
  await saveScoreEntry(comparisonId, competitorId, criterionKey, category, normalized);
  revalidatePath(`/avaliacoes/${comparisonId}/preencher`);
}

export async function saveScoreSettingAction(
  comparisonId: string,
  criterionKey: string,
  enabled: boolean,
  weight: number,
) {
  const safeWeight = Math.min(10, Math.max(1, Math.round(weight)));
  await saveScoreSetting(comparisonId, criterionKey, enabled, safeWeight);
  revalidatePath(`/avaliacoes/${comparisonId}/preencher`);
}

export async function saveSelectedFinalistsAction(comparisonId: string, finalistIds: string[]) {
  await saveSelectedFinalists(comparisonId, finalistIds);
  revalidatePath(`/avaliacoes/${comparisonId}/preencher`);
  revalidatePath(`/dashboard/${comparisonId}`);
}

/** Generates (or reuses) a public share link for a competitor's interview. */
export async function createShareLinkAction(comparisonId: string, competitorId: string) {
  const token = await ensureShareToken(comparisonId, competitorId);
  return `${getAppUrl()}/responder/${token}`;
}

/** Saves a competitor's company + technical data to the reusable library. */
export async function saveCompanyToLibraryAction(input: {
  companyName: string;
  sellerName?: string | null;
  company: unknown;
  technical: unknown;
}) {
  await saveCompanyToLibrary({
    companyName: input.companyName,
    sellerName: input.sellerName ?? null,
    company: companyEvaluationSchema.parse(input.company),
    technical: technicalEvaluationSchema.parse(input.technical),
  });
}
