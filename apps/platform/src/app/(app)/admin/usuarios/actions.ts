"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { getManagedUserById } from "@/lib/admin/users";

/** Garante que quem chama é da equipe (admin ou writer). Retorna o usuário. */
async function assertStaff() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Não autorizado.");
  return user;
}

/**
 * Regra de proteção: um administrador só pode ser removido/bloqueado por outro
 * administrador. Um writer tem acesso ao painel mas não pode mexer num admin.
 */
async function assertCanManageTarget(actorRole: string, userId: string) {
  const target = await getManagedUserById(userId);
  if (target?.role === "admin" && actorRole !== "admin") {
    throw new Error("Apenas um administrador pode remover ou bloquear outro administrador.");
  }
}

export async function updateUserProfileAction(
  userId: string,
  data: { fullName: string; companyName: string; phone: string },
) {
  await assertStaff();
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: data.fullName.trim() || null,
      company_name: data.companyName.trim() || null,
      phone: data.phone.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw new Error(`Falha ao salvar: ${error.message}`);
  revalidatePath("/admin/usuarios");
}

export async function setUserBlockedAction(userId: string, blocked: boolean) {
  const actor = await assertStaff();
  await assertCanManageTarget(actor.role, userId);

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      blocked_at: blocked ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw new Error(`Falha ao atualizar acesso: ${error.message}`);
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}

export async function deleteUserAction(userId: string) {
  const actor = await assertStaff();
  if (actor.id === userId) {
    throw new Error("Você não pode remover a própria conta por aqui.");
  }
  await assertCanManageTarget(actor.role, userId);

  const admin = createAdminClient();
  // Remove a conta do Auth; perfil, avaliações e demais dados caem em cascata
  // (FKs `on delete cascade` para auth.users).
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`Falha ao remover: ${error.message}`);
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}
