import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, staffRoleForEmail } from "@/lib/env";

/** Papel do usuário no painel. "user" = comprador comum (sem acesso ao admin). */
export type UserRole = "admin" | "writer" | "user";

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  /** "admin" | "writer" = equipe (acessa o painel); "user" = comprador. */
  role: UserRole;
  /** Atalho de gating: true para qualquer membro da equipe (admin ou writer). */
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

  // Papel vem do mapa de staff; e-mails listados em ADMIN_EMAILS (sem papel
  // explícito) caem como "admin" por compatibilidade.
  const role: UserRole = staffRoleForEmail(email) ?? (isAdminEmail(email) ? "admin" : "user");

  return {
    id: claims.sub,
    email,
    fullName: meta.full_name ?? null,
    role,
    isAdmin: role !== "user",
  };
}

export type AccessGate = { allowed: boolean; reason: "ok" | "expired" | "blocked" };

/**
 * Dias restantes de acesso do usuário logado (não-admin). Retorna null para
 * admin, conta sem validade, ou não logado. Usado no aviso de expiração
 * (banner de contagem regressiva nos últimos dias).
 */
export async function getAccessExpiry(): Promise<{ expiresAt: string; daysLeft: number } | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  const email = (claims?.claims?.email as string | undefined) ?? null;
  if (!userId || isAdminEmail(email)) return null;

  const { data } = await supabase
    .from("profiles")
    .select("access_expires_at")
    .eq("id", userId)
    .maybeSingle();
  const exp = data?.access_expires_at;
  if (!exp) return null;
  const daysLeft = Math.ceil((new Date(exp).getTime() - Date.now()) / 86_400_000);
  return { expiresAt: exp, daysLeft };
}

/**
 * Portão de acesso pago (épico GREENN). Bloqueia quando o acesso foi revogado
 * (blocked_at) ou expirou (access_expires_at no passado). Contas sem
 * access_expires_at (antigas/admin/manuais) e admins passam sempre.
 */
export async function getAccessGate(): Promise<AccessGate> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  const email = (claims?.claims?.email as string | undefined) ?? null;
  if (!userId) return { allowed: true, reason: "ok" }; // não logado → middleware trata
  if (isAdminEmail(email)) return { allowed: true, reason: "ok" };

  const { data, error } = await supabase
    .from("profiles")
    .select("access_expires_at,blocked_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return { allowed: true, reason: "ok" }; // não trava o app em falha de query
  if (data.blocked_at) return { allowed: false, reason: "blocked" };
  if (data.access_expires_at && new Date(data.access_expires_at).getTime() < Date.now()) {
    return { allowed: false, reason: "expired" };
  }
  return { allowed: true, reason: "ok" };
}

export type ProfileDetails = {
  fullName: string | null;
  phone: string | null;
  companyName: string | null;
};

/** Reads the editable profile row for the current user. */
/**
 * True quando o usuário ainda NÃO concluiu o onboarding (primeiro acesso).
 * Se não houver linha de perfil ainda, tratamos como primeiro acesso.
 */
export async function needsOnboarding(): Promise<boolean> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("onboarded_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) return false; // não bloqueia o app se a query falhar
  return !data?.onboarded_at;
}

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
