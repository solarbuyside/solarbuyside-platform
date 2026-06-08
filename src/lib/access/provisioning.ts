import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/env";
import { computeAccessExpiry } from "@/lib/access/access-policy";
import { sendAccessEmail } from "@/lib/email/brevo";
import type { Database } from "@/lib/supabase/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/**
 * Provisão de acesso pós-compra (Greenn). Server-only.
 *
 * Fluxo: cria (ou reaproveita) o usuário no Supabase, marca a validade de 6
 * meses no profile, gera o link seguro de definição de senha (sem enviar
 * e-mail pelo Supabase) e dispara o e-mail de acesso pelo Brevo.
 */

export type ProvisionInput = {
  email: string;
  orderId: string;
  fullName?: string | null;
};

export type ProvisionResult = { ok: boolean; created: boolean; error?: string };

export async function provisionGreennAccess(input: ProvisionInput): Promise<ProvisionResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, created: false, error: "email vazio" };

  const admin = createAdminClient();

  // 1. Cria ou reaproveita o usuário.
  let userId: string | null = null;
  let created = false;
  const createRes = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: input.fullName ? { full_name: input.fullName } : undefined,
  });

  if (createRes.data?.user) {
    userId = createRes.data.user.id;
    created = true;
  } else {
    // Já existe: busca o id pelo profile (email é único na prática).
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    userId = existing?.id ?? null;
  }

  if (!userId) {
    return { ok: false, created: false, error: "não foi possível criar/encontrar o usuário" };
  }

  // 2. Marca validade de 6 meses + vínculo com o pedido; limpa bloqueio.
  const expiresAt = computeAccessExpiry(new Date()).toISOString();
  const update: ProfileUpdate = {
    access_expires_at: expiresAt,
    greenn_order_id: input.orderId,
    blocked_at: null,
    access_source: "greenn",
  };
  if (input.fullName) update.full_name = input.fullName;
  const { error: updateErr } = await admin.from("profiles").update(update).eq("id", userId);
  if (updateErr) {
    return { ok: false, created, error: `falha ao atualizar profile: ${updateErr.message}` };
  }

  // 3. Gera o link seguro (NÃO envia e-mail) e dispara via Brevo.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${getAppUrl()}/update-password` },
  });
  if (linkErr || !linkData?.properties?.action_link) {
    return { ok: false, created, error: `falha ao gerar link: ${linkErr?.message ?? "sem action_link"}` };
  }

  const mail = await sendAccessEmail({
    to: email,
    name: input.fullName ?? null,
    actionLink: linkData.properties.action_link,
  });
  if (!mail.ok) {
    return { ok: false, created, error: `acesso provisionado, mas e-mail falhou: ${mail.error ?? mail.status}` };
  }

  return { ok: true, created };
}

/**
 * Bloqueia o acesso (reembolso/chargeback). Marca blocked_at no profile do
 * pedido — o enforcement nega a entrada enquanto estiver bloqueado.
 */
export async function revokeGreennAccess(input: {
  orderId?: string;
  email?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  let query = admin.from("profiles").update({ blocked_at: now });
  if (input.orderId) {
    query = query.eq("greenn_order_id", input.orderId);
  } else if (input.email) {
    query = query.eq("email", input.email.trim().toLowerCase());
  } else {
    return { ok: false, error: "informe orderId ou email" };
  }

  const { error } = await query;
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
