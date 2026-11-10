import { isAdminEmail, isProtectedAccount, staffRoleForEmail } from "../env";
import type { UserRole } from "./roles";

/**
 * Resolução do papel efetivo (server-only: lê o mapa de staff do env.ts, que
 * não deve ir para o bundle do navegador). Puro: quem lê o banco passa o
 * papel salvo em user_roles.
 */

/** Papel que o código atribui ao e-mail quando não há papel salvo no banco. */
export function defaultRoleForEmail(email: string | null | undefined): UserRole {
  return staffRoleForEmail(email) ?? (isAdminEmail(email) ? "admin" : "user");
}

/**
 * Papel efetivo. Conta protegida ignora o banco; as demais usam o papel salvo
 * e, sem ele, o padrão do código.
 */
export function resolveRole(email: string | null | undefined, stored: UserRole | null): UserRole {
  if (isProtectedAccount(email)) return defaultRoleForEmail(email);
  return stored ?? defaultRoleForEmail(email);
}
