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

export type ProfileDetails = {
  fullName: string | null;
  phone: string | null;
  companyName: string | null;
};

/** Reads the editable profile row for the current user. */
export async function getProfileDetails(): Promise<ProfileDetails | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name,phone,company_name")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return { fullName: null, phone: null, companyName: null };
  return {
    fullName: data.full_name,
    phone: data.phone,
    companyName: data.company_name,
  };
}
