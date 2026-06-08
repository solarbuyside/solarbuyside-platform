"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { saveLandingSectionTexts, saveLandingGlobalValue } from "@/lib/landing/content-admin";

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Não autorizado.");
}

export async function saveLandingSectionAction(
  sectionId: string,
  texts: Record<string, string>,
) {
  await assertAdmin();
  await saveLandingSectionTexts(sectionId, texts);
}

export async function saveLandingGlobalAction(key: string, value: string) {
  await assertAdmin();
  await saveLandingGlobalValue(key, value);
}
