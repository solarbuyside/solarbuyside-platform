"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
});

export async function updateProfileAction(input: { fullName?: string; phone?: string }) {
  const parsed = profileSchema.parse(input);
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) throw new Error("Authentication required.");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.fullName?.trim() || null,
      phone: parsed.phone?.trim() || null,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  // Keep auth user metadata in sync so the header name updates too.
  await supabase.auth.updateUser({ data: { full_name: parsed.fullName?.trim() || null } });

  revalidatePath("/configuracoes");
  revalidatePath("/", "layout");
}
