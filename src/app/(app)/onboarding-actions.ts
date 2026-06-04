"use server";

import { createClient } from "@/lib/supabase/server";

/** Marca o onboarding como concluído (ou pulado) para o usuário atual. */
export async function markOnboardedAction() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", userId);
}
