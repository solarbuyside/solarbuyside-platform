"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { saveLegalDocBlocks, type LegalBlockDb } from "@/lib/legal/admin";

export async function saveLegalDocAction(
  scope: string,
  slug: string,
  title: string,
  blocks: LegalBlockDb[],
) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Não autorizado.");
  await saveLegalDocBlocks(scope, slug, title, blocks);
}
