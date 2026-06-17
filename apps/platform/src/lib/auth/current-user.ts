import { cache } from "react";

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

type SessionClaims = {
  sub: string;
  email: string | null;
  fullName: string | null;
};

type GateProfile = {
  access_expires_at: string | null;
  blocked_at: string | null;
  password_set_at: string | null;
  onboarded_at: string | null;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
};

/**
 * Identidade da sessão — UMA verificação por request (memoizada com React
 * cache()). `getClaims()` valida o JWT localmente (sem ida ao Auth server com
 * chaves assimétricas), então é seguro e rápido. Layout, páginas e actions que
 * chamam isto no mesmo request reusam o mesmo resultado.
 */
export const getSessionClaims = cache(async (): Promise<SessionClaims | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const claims = data.claims;
  const meta = (claims.user_metadata ?? {}) as { full_name?: string };
  return {
    sub: claims.sub,
    email: (claims.email as string | undefined) ?? null,
    fullName: meta.full_name ?? null,
  };
});

/**
 * Perfil de gating — UMA query por request (memoizada). Traz todas as colunas
 * que o portão do app + telas precisam, evitando N consultas separadas. Null se
 * não logado ou se a query falhar (o portão não trava o app em falha).
 */
export const getGateProfile = cache(async (): Promise<GateProfile | null> => {
  const claims = await getSessionClaims();
  if (!claims) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("access_expires_at,blocked_at,password_set_at,onboarded_at,full_name,phone,company_name")
    .eq("id", claims.sub)
    .maybeSingle();
  return data ?? null;
});

/** Reads the authenticated user's identity for UI (header, admin gating). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const claims = await getSessionClaims();
  if (!claims) return null;

  // Papel vem do mapa de staff; e-mails listados em ADMIN_EMAILS (sem papel
  // explícito) caem como "admin" por compatibilidade.
  const role: UserRole = staffRoleForEmail(claims.email) ?? (isAdminEmail(claims.email) ? "admin" : "user");

  return {
    id: claims.sub,
    email: claims.email,
    fullName: claims.fullName,
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
  const claims = await getSessionClaims();
  if (!claims || isAdminEmail(claims.email)) return null;

  const exp = (await getGateProfile())?.access_expires_at;
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
  const claims = await getSessionClaims();
  if (!claims) return { allowed: true, reason: "ok" }; // não logado → middleware trata
  if (isAdminEmail(claims.email)) return { allowed: true, reason: "ok" };

  const data = await getGateProfile();
  if (!data) return { allowed: true, reason: "ok" }; // não trava o app em falha de query
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

/**
 * True quando o usuário ainda NÃO concluiu o onboarding (primeiro acesso).
 * Se não houver linha de perfil ainda, tratamos como primeiro acesso.
 */
export async function needsOnboarding(): Promise<boolean> {
  const claims = await getSessionClaims();
  if (!claims) return false;
  return !(await getGateProfile())?.onboarded_at;
}

/**
 * True quando o usuário ainda NÃO criou a própria senha (1º acesso Greenn).
 * O provisionamento cria a conta com senha aleatória e password_set_at NULL;
 * o app deve forçar /update-password até a senha ser definida. Admin nunca cai
 * aqui (não passa pelo provisionamento).
 */
export async function needsPasswordSetup(): Promise<boolean> {
  const claims = await getSessionClaims();
  if (!claims || isAdminEmail(claims.email)) return false;
  const data = await getGateProfile();
  if (!data) return false; // não trava o app em falha de query
  return !data.password_set_at;
}

/** Reads the editable profile row for the current user. */
export async function getProfileDetails(): Promise<ProfileDetails | null> {
  const claims = await getSessionClaims();
  if (!claims) return null;
  const data = await getGateProfile();
  if (!data) return { fullName: null, phone: null, companyName: null };
  return {
    fullName: data.full_name,
    phone: data.phone,
    companyName: data.company_name,
  };
}
