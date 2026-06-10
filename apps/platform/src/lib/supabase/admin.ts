import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig, getSupabaseSecretKey } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Server-only Supabase client using the service/secret key. It BYPASSES Row
 * Level Security, so it must only ever be used in trusted server code after the
 * caller's right to act has been validated some other way (e.g. a share token).
 * Never import this from client components.
 */
export function createAdminClient() {
  const { url } = getPublicSupabaseConfig();
  const secret = getSupabaseSecretKey();
  if (!secret) {
    throw new Error("Missing Supabase secret key for admin client.");
  }
  return createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
