import { createAdminClient } from "@/lib/supabase/admin";
import { isUserRole, type UserRole } from "@/lib/auth/roles";
import { resolveRole } from "@/lib/auth/role-resolution";

/**
 * Leitura do papel salvo (tabela user_roles) com a service key. Server-only.
 * Usado onde ainda não há sessão no cookie (login) e nas telas do admin que
 * listam todo mundo. Falha de banco (ex.: migration 0028 ainda não aplicada)
 * nunca derruba nada: cai no papel padrão do código.
 */

export async function getStoredRolesById(): Promise<Map<string, UserRole>> {
  const out = new Map<string, UserRole>();
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("user_roles").select("user_id,role");
    if (error) return out;
    for (const row of data ?? []) {
      if (isUserRole(row.role)) out.set(row.user_id, row.role);
    }
  } catch {
    // sem service key / tabela: segue com o padrão
  }
  return out;
}

/** Papel efetivo de um usuário pelo id (consulta o banco com a service key). */
export async function resolveRoleById(userId: string, email: string | null): Promise<UserRole> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    const stored = !error && isUserRole(data?.role) ? data.role : null;
    return resolveRole(email, stored);
  } catch {
    return resolveRole(email, null);
  }
}
