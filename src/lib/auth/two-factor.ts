import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseSecretKey } from "@/lib/env";
import { sendLoginCodeEmail } from "@/lib/email/brevo";

/**
 * 2FA por e-mail no login (server-only). A cada login com senha (de não-admin),
 * gera um código de 6 dígitos enviado por e-mail; o app só libera após verificar.
 * O "estado verificado" é um cookie httpOnly assinado (HMAC) por usuário; o
 * cookie é apagado a cada novo login, forçando nova verificação.
 */

export const TWO_FA_COOKIE = "sb-2fa";
const CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function signingSecret() {
  return getSupabaseSecretKey() ?? "solarbuyside-2fa-fallback";
}

export function make2faToken(userId: string): string {
  return createHmac("sha256", signingSecret()).update(`2fa:${userId}`).digest("hex");
}

export function verify2faToken(userId: string, token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = make2faToken(userId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Gera + envia o código por e-mail. */
export async function issueLoginCode(userId: string, email: string): Promise<void> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const admin = createAdminClient();
  const expiresAt = new Date(Date.now() + CODE_TTL_MIN * 60_000).toISOString();
  await admin
    .from("login_2fa_codes")
    .upsert(
      { user_id: userId, code_hash: hashCode(code), expires_at: expiresAt, attempts: 0 },
      { onConflict: "user_id" },
    );
  await sendLoginCodeEmail(email, code);
}

/** Verifica o código. Consome em caso de sucesso; conta tentativas. */
export async function verifyLoginCode(userId: string, code: string): Promise<boolean> {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return false;
  const admin = createAdminClient();
  const { data } = await admin
    .from("login_2fa_codes")
    .select("code_hash,expires_at,attempts")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return false;
  if (new Date(data.expires_at).getTime() < Date.now()) return false;
  if (data.attempts >= MAX_ATTEMPTS) return false;
  if (hashCode(clean) !== data.code_hash) {
    await admin
      .from("login_2fa_codes")
      .update({ attempts: data.attempts + 1 })
      .eq("user_id", userId);
    return false;
  }
  await admin.from("login_2fa_codes").delete().eq("user_id", userId);
  return true;
}
