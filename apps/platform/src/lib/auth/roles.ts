/**
 * Papéis e regras de permissão do painel. Puro e seguro para o navegador (não
 * lê config nem banco): o servidor resolve o papel e se a conta é protegida
 * (ver role-resolution.ts) e as telas/actions perguntam aqui o que é permitido.
 *
 * - "admin": pode tudo, inclusive mexer em outro admin.
 * - "writer" (Editor): acesso total ao painel, mas não mexe em admin nem
 *   promove ninguém a admin.
 * - "user" (Comprador): sem acesso ao painel.
 */
export type UserRole = "admin" | "writer" | "user";

export const USER_ROLES: readonly UserRole[] = ["user", "writer", "admin"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  writer: "Editor",
  user: "Comprador",
};

export function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "writer" || value === "user";
}

export type RoleActor = { id: string; role: UserRole };
/** `protected` = conta protegida (env.ts): ninguém troca papel, bloqueia ou remove. */
export type RoleTarget = { id: string; role: UserRole; protected: boolean };

/** Pode bloquear/remover esta conta? Null = pode; string = motivo do não. */
export function manageTargetError(actor: RoleActor, target: RoleTarget): string | null {
  if (actor.role === "user") return "Não autorizado.";
  if (target.protected) return "Esta conta é protegida e não pode ser alterada.";
  if (target.role === "admin" && actor.role !== "admin") {
    return "Apenas um administrador pode mexer na conta de outro administrador.";
  }
  return null;
}

/** Pode trocar o papel desta conta para `next`? Null = pode. */
export function roleChangeError(actor: RoleActor, target: RoleTarget, next: UserRole): string | null {
  if (actor.role === "user") return "Não autorizado.";
  if (actor.id === target.id) return "Você não pode mudar o seu próprio papel.";
  const manage = manageTargetError(actor, target);
  if (manage) return manage;
  if (next === "admin" && actor.role !== "admin") {
    return "Apenas um administrador pode promover alguém a administrador.";
  }
  return null;
}

/** Pode criar uma conta já com este papel? Null = pode. */
export function createRoleError(actorRole: UserRole, role: UserRole): string | null {
  if (actorRole === "user") return "Não autorizado.";
  if (role === "admin" && actorRole !== "admin") {
    return "Apenas um administrador pode criar outro administrador.";
  }
  return null;
}

/** Papéis que este ator pode atribuir (para montar o seletor da tela). */
export function assignableRoles(actorRole: UserRole): UserRole[] {
  if (actorRole === "admin") return ["user", "writer", "admin"];
  if (actorRole === "writer") return ["user", "writer"];
  return [];
}
