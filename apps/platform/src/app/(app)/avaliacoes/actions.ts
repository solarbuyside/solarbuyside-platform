"use server";

import { redirect } from "next/navigation";

import { createComparisonDraft } from "@/lib/comparisons/repository";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createComparisonDraftAction(formData: FormData) {
  const title = formString(formData, "title");
  const competitorNames = formData
    .getAll("competitorNames")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  const savedCompanyIds = formData
    .getAll("savedCompanyIds")
    .filter((value): value is string => typeof value === "string")
    .filter(Boolean);

  const id = await createComparisonDraft({
    title,
    competitorNames,
    savedCompanyIds: savedCompanyIds.length > 0 ? savedCompanyIds : undefined,
  });

  // Go straight into the interview flow — no intermediate "created" screen.
  redirect(`/avaliacoes/${id}/preencher`);
}
