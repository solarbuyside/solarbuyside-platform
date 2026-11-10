"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser, type CurrentUser } from "@/lib/auth/current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { getManagedUserById } from "@/lib/admin/users";
import { getAppUrl, isProtectedAccount } from "@/lib/env";
import {
  ROLE_LABELS,
  createRoleError,
  isUserRole,
  manageTargetError,
  roleChangeError,
  type UserRole,
} from "@/lib/auth/roles";
import { validatePassword } from "@/lib/auth/password-rules";
import { sendNewAccountEmail } from "@/lib/email/brevo";

/*
 * As actions DEVOLVEM o erro em vez de lançar: em produção o Next esconde a
 * mensagem de um erro lançado numa server action, e o Francis veria só um
 * "erro genérico" em vez de "já existe uma conta com este e-mail".
 */
export type ActionResult = { ok: true } | { ok: false; error: string };

export type CreateUserResult =
  | { ok: true; emailSent: boolean; emailError?: string }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Quem chama é da equipe (admin ou editor)? Devolve o usuário ou null. */
async function getStaff(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}

function refresh() {
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}

export async function createUserAction(input: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<CreateUserResult> {
  const actor = await getStaff();
  if (!actor) return { ok: false, error: "Não autorizado." };

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const role = input.role;

  if (fullName.length < 2) return { ok: false, error: "Informe o nome da pessoa." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Informe um e-mail válido." };
  if (!validatePassword(password).ok) {
    return {
      ok: false,
      error: "A senha precisa ter pelo menos 8 caracteres, uma letra maiúscula, um número e um símbolo.",
    };
  }
  if (!isUserRole(role)) return { ok: false, error: "Escolha um papel válido." };
  const roleError = createRoleError(actor.role, role);
  if (roleError) return { ok: false, error: roleError };
  if (isProtectedAccount(email)) return { ok: false, error: "Esta conta é protegida." };

  const admin = createAdminClient();

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (created.error || !created.data.user) {
    const msg = created.error?.message ?? "";
    // Só o código/mensagem de "já existe": 422 sozinho também é senha fraca.
    const exists =
      created.error?.code === "email_exists" || /already (been )?registered|already exists/i.test(msg);
    const weak = created.error?.code === "weak_password";
    return {
      ok: false,
      error: exists
        ? "Já existe uma conta com este e-mail."
        : weak
          ? "Essa senha foi recusada por ser fraca ou já ter vazado na internet. Gere outra."
          : `Não foi possível criar a conta: ${msg || "erro desconhecido"}`,
    };
  }
  const userId = created.data.user.id;

  // Papel salvo no banco. Se falhar, desfaz a conta: melhor nenhuma conta do
  // que uma conta com o papel errado (ex.: admin que nasce comprador).
  const { error: roleErr } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role, updated_by: actor.id, updated_at: new Date().toISOString() });
  if (roleErr) {
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, error: `Não foi possível salvar o papel: ${roleErr.message}` };
  }

  // O perfil nasce pelo trigger do auth.users. A senha já foi definida pelo
  // admin, então não força a tela de "crie sua senha" no 1º acesso. Sem
  // validade de acesso (conta manual, igual às contas antigas).
  await admin
    .from("profiles")
    .update({
      full_name: fullName,
      password_set_at: new Date().toISOString(),
      access_source: "admin",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  const mail = await sendNewAccountEmail({
    to: email,
    name: fullName,
    password,
    loginUrl: `${getAppUrl()}/login`,
    roleLabel: ROLE_LABELS[role],
  });

  refresh();
  if (!mail.ok) {
    return { ok: true, emailSent: false, emailError: mail.error ?? `status ${mail.status}` };
  }
  return { ok: true, emailSent: true };
}

export async function updateUserProfileAction(
  userId: string,
  data: { fullName: string; companyName: string; phone: string; role?: UserRole },
): Promise<ActionResult> {
  const actor = await getStaff();
  if (!actor) return { ok: false, error: "Não autorizado." };

  const admin = createAdminClient();

  // Troca de papel (só se veio e mudou): checa a permissão antes de gravar
  // qualquer coisa, para não salvar metade.
  let nextRole: UserRole | null = null;
  if (data.role !== undefined) {
    if (!isUserRole(data.role)) return { ok: false, error: "Papel inválido." };
    const target = await getManagedUserById(userId);
    if (!target) return { ok: false, error: "Usuário não encontrado." };
    if (target.role !== data.role) {
      const err = roleChangeError(actor, target, data.role);
      if (err) return { ok: false, error: err };
      nextRole = data.role;
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: data.fullName.trim() || null,
      company_name: data.companyName.trim() || null,
      phone: data.phone.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) return { ok: false, error: `Falha ao salvar: ${error.message}` };

  if (nextRole) {
    const { error: roleErr } = await admin.from("user_roles").upsert({
      user_id: userId,
      role: nextRole,
      updated_by: actor.id,
      updated_at: new Date().toISOString(),
    });
    if (roleErr) return { ok: false, error: `Dados salvos, mas o papel não: ${roleErr.message}` };
  }

  refresh();
  return { ok: true };
}

/** Checa se o ator pode bloquear/remover o alvo. Null = pode. */
async function manageError(actor: CurrentUser, userId: string): Promise<string | null> {
  const target = await getManagedUserById(userId);
  if (!target) return "Usuário não encontrado.";
  return manageTargetError(actor, target);
}

export async function setUserBlockedAction(userId: string, blocked: boolean): Promise<ActionResult> {
  const actor = await getStaff();
  if (!actor) return { ok: false, error: "Não autorizado." };
  if (actor.id === userId) return { ok: false, error: "Você não pode bloquear a própria conta." };
  const denied = await manageError(actor, userId);
  if (denied) return { ok: false, error: denied };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      blocked_at: blocked ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) return { ok: false, error: `Falha ao atualizar acesso: ${error.message}` };
  refresh();
  return { ok: true };
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const actor = await getStaff();
  if (!actor) return { ok: false, error: "Não autorizado." };
  if (actor.id === userId) {
    return { ok: false, error: "Você não pode remover a própria conta por aqui." };
  }
  const denied = await manageError(actor, userId);
  if (denied) return { ok: false, error: denied };

  const admin = createAdminClient();
  // Remove a conta do Auth; perfil, papel, avaliações e demais dados caem em
  // cascata (FKs `on delete cascade` para auth.users).
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: `Falha ao remover: ${error.message}` };
  refresh();
  return { ok: true };
}
