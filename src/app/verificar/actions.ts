"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  verifyLoginCode,
  issueLoginCode,
  make2faToken,
  TWO_FA_COOKIE,
} from "@/lib/auth/two-factor";

function back(type: "error" | "message", value: string): never {
  // Mantém sent=1 para o formulário seguir no estado "código enviado".
  redirect(`/verificar?sent=1&${type}=${encodeURIComponent(value)}`);
}

/** Envia o código pela 1ª vez (botão explícito) e passa para o estado "enviado". */
export async function sendCodeAction() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  const email = data?.claims?.email as string | undefined;
  if (!userId || !email) redirect("/login");
  await issueLoginCode(userId, email);
  redirect("/verificar?sent=1");
}

export async function verifyCodeAction(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (!userId) redirect("/login");

  const ok = await verifyLoginCode(userId, code);
  if (!ok) back("error", "Código inválido ou expirado. Tente novamente.");

  const cookieStore = await cookies();
  cookieStore.set(TWO_FA_COOKIE, make2faToken(userId), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  });
  redirect("/dashboard");
}

export async function resendCodeAction() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  const email = data?.claims?.email as string | undefined;
  if (!userId || !email) redirect("/login");
  await issueLoginCode(userId, email);
  back("message", "Enviamos um novo código para o seu e-mail.");
}

