"use server";

import { revalidatePath } from "next/cache";

import { saveScoreSetting, saveSelectedFinalists } from "@/lib/comparisons/repository";

export async function updateScoreSettingAction(
  comparisonId: string,
  criterionKey: string,
  enabled: boolean,
  weight: number,
) {
  const safeWeight = Math.min(10, Math.max(1, Math.round(weight)));
  await saveScoreSetting(comparisonId, criterionKey, enabled, safeWeight);
  revalidatePath(`/dashboard/${comparisonId}`);
}

export async function updateSelectedFinalistsAction(comparisonId: string, finalistIds: string[]) {
  await saveSelectedFinalists(comparisonId, finalistIds);
  revalidatePath(`/dashboard/${comparisonId}`);
}
