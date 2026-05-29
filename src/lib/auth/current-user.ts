import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/env";

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  isAdmin: boolean;
};

/** Reads the authenticated user's identity for UI (header, admin gating). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const claims = data.claims;
  const email = (claims.email as string | undefined) ?? null;
  // full_name may live in user metadata.
  const meta = (claims.user_metadata ?? {}) as { full_name?: string };

  return {
    id: claims.sub,
    email,
    fullName: meta.full_name ?? null,
    isAdmin: isAdminEmail(email),
  };
}
