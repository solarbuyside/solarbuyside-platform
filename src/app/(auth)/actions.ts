"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/env";
import { issueLoginCode, make2faToken, TWO_FA_COOKIE } from "@/lib/auth/two-factor";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWith(pathname: string, type: "error" | "message", value: string) {
  const params = new URLSearchParams({ [type]: value });
  redirect(`${pathname}?${params.toString()}`);
}

function safeNextPath(value: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function signInAction(formData: FormData) {
  const email = stringValue(formData, "email");
  const password = stringValue(formData, "password");
  const next = safeNextPath(stringValue(formData, "next"));

  if (!email || !password) {
    redirectWith("/login", "error", "Informe e-mail e senha.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[signIn] supabase error:", error.status, error.code, error.message);
    const friendly =
      error.code === "email_not_confirmed"
        ? "Confirme seu e-mail antes de entrar."
        : "Nao foi possivel entrar. Confira seus dados.";
    redirectWith("/login", "error", friendly);
  }

  // Sempre exige nova verificação 2FA a cada login: apaga o cookie de verificação.
  const cookieStore = await cookies();
  cookieStore.delete(TWO_FA_COOKIE);

  // Refresh server-rendered routes so the freshly written session cookies are
  // picked up before navigating, avoiding the client "unexpected response" race.
  revalidatePath("/", "layout");

  // Admins não passam pelo 2FA por e-mail.
  if (isAdminEmail(email) || !data.user) {
    redirect(next);
  }

  // Não-admin: gera o código por e-mail e manda para a verificação.
  try {
    await issueLoginCode(data.user.id, email);
  } catch (err) {
    console.error("[signIn] 2FA issue error:", err);
    // segue para /verificar mesmo assim — lá há a opção de reenviar.
  }
  redirect("/verificar");
}

export async function signUpAction() {
  // Cadastro público FECHADO (modelo gated GREENN): a conta nasce pela compra
  // do Manual + Código, provisionada pelo webhook. Não há auto-cadastro.
  redirectWith(
    "/login",
    "message",
    "O acesso é liberado após a compra do Manual Solar Buy-Side. Use o e-mail da compra para entrar.",
  );
}

export async function resetPasswordAction(formData: FormData) {
  const email = stringValue(formData, "email");

  if (!email) {
    redirectWith("/reset-password", "error", "Informe seu e-mail.");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  // redirect_to aponta para a nossa rota de callback, que troca o token por
  // sessão (server-side) antes de seguir para /update-password.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/update-password")}`,
  });

  if (error) {
    redirectWith("/reset-password", "error", "Nao foi possivel enviar o link de recuperacao.");
  }

  redirectWith("/reset-password", "message", "Enviamos um link de recuperacao para o seu e-mail.");
}

export async function updatePasswordAction(formData: FormData) {
  const password = stringValue(formData, "password");
  const confirmPassword = stringValue(formData, "confirmPassword");

  if (password.length < 8 || password !== confirmPassword) {
    redirectWith("/update-password", "error", "As senhas precisam ser iguais e ter pelo menos 8 caracteres.");
  }

  const supabase = await createClient();
  const { data: updated, error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirectWith("/update-password", "error", "Nao foi possivel atualizar a senha.");
  }

  // Quem chega aqui veio do link de recuperação/acesso enviado ao próprio
  // e-mail — ou seja, já provou posse do e-mail. Satisfaz o 2FA desta sessão
  // (evita o /verificar redundante logo após o reset / 1º acesso da Greenn).
  const userId = updated?.user?.id;
  if (userId) {
    const cookieStore = await cookies();
    cookieStore.set(TWO_FA_COOKIE, make2faToken(userId), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12h
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete(TWO_FA_COOKIE);
  revalidatePath("/", "layout");
  redirect("/login");
}
