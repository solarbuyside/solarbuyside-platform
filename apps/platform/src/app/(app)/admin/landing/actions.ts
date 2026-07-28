"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  saveLandingSection,
  saveLandingGlobalValue,
  publishLanding,
  triggerLandingDeploy,
} from "@/lib/landing/content-admin";

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Não autorizado.");
}

export async function saveLandingSectionAction(
  sectionId: string,
  texts: Record<string, string>,
  images: Record<string, string>,
) {
  await assertAdmin();
  await saveLandingSection(sectionId, texts, images);
}

export async function saveLandingGlobalAction(key: string, value: string) {
  await assertAdmin();
  await saveLandingGlobalValue(key, value);
}

export async function publishLandingAction(): Promise<{ deployTriggered: boolean }> {
  await assertAdmin();
  await publishLanding();
  // O HTML da LP é pré-renderizado no build; sem rebuild, crawlers leem o
  // conteúdo anterior mesmo com o banco já atualizado.
  const deployTriggered = await triggerLandingDeploy();
  revalidatePath("/admin/landing");
  return { deployTriggered };
}
