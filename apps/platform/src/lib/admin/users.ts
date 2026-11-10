import { createAdminClient } from "@/lib/supabase/admin";
import { isProtectedAccount } from "@/lib/env";
import type { UserRole } from "@/lib/auth/roles";
import { resolveRole } from "@/lib/auth/role-resolution";
import { getStoredRolesById, resolveRoleById } from "@/lib/auth/role-store";

export type ManagedUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  companyName: string | null;
  phone: string | null;
  role: UserRole;
  /** Conta protegida: ninguém troca o papel, bloqueia ou remove pelo painel. */
  protected: boolean;
  blocked: boolean;
  accessExpiresAt: string | null;
  accessSource: string | null;
  createdAt: string;
  comparisonCount: number;
};

/**
 * Lista todos os usuários da plataforma para a tela de gestão. Usa a service
 * key (bypassa RLS) — só chamar de rota já protegida por `isAdmin`.
 */
export async function listManagedUsers(): Promise<ManagedUser[]> {
  const admin = createAdminClient();

  const [profilesRes, comparisonsRes, storedRoles] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id,email,full_name,company_name,phone,blocked_at,access_expires_at,access_source,created_at",
      )
      .order("created_at", { ascending: false }),
    admin.from("comparisons").select("owner_id"),
    getStoredRolesById(),
  ]);

  const profiles = profilesRes.data ?? [];
  const comparisons = comparisonsRes.data ?? [];

  const countByOwner = new Map<string, number>();
  for (const c of comparisons) {
    countByOwner.set(c.owner_id, (countByOwner.get(c.owner_id) ?? 0) + 1);
  }

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    companyName: p.company_name,
    phone: p.phone,
    role: resolveRole(p.email, storedRoles.get(p.id) ?? null),
    protected: isProtectedAccount(p.email),
    blocked: Boolean(p.blocked_at),
    accessExpiresAt: p.access_expires_at,
    accessSource: p.access_source,
    createdAt: p.created_at,
    comparisonCount: countByOwner.get(p.id) ?? 0,
  }));
}

/**
 * Carrega e-mail + papel efetivo de um usuário (para checagens de permissão
 * no servidor antes de bloquear/remover/trocar papel). Null se não houver perfil.
 */
export async function getManagedUserById(
  userId: string,
): Promise<{ id: string; email: string | null; role: UserRole; protected: boolean } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: userId,
    email: data.email,
    role: await resolveRoleById(userId, data.email),
    protected: isProtectedAccount(data.email),
  };
}
