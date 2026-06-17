"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail, getAppUrl } from "@/lib/env";
import { make2faToken, TWO_FA_COOKIE } from "@/lib/auth/two-factor";
import { validatePassword } from "@/lib/auth/password-rules";
import { sendAccessEmail } from "@/lib/email/brevo";

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

  // Não-admin: vai para a verificação. O código NÃO é enviado automaticamente
  // — a tela /verificar tem um botão "Enviar código" (ação explícita, evita
  // o caso de chegar na tela sem código). Ver sendCodeAction.
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

/**
 * 1º acesso fora do link da compra. Quem comprou (Manual/PDF) já tem conta
 * provisionada pela Greenn, mas pode chegar ao site sem ter clicado no e-mail
 * inicial. Aqui ele informa o e-mail da compra e reenviamos o mesmo link seguro
 * de criação de senha (token recovery via Brevo, idêntico ao provisionamento).
 *
 * Anti-enumeração: a resposta é SEMPRE neutra — não revelamos se o e-mail tem
 * acesso. Se a conta não existir, geramos silêncio (nenhum e-mail é enviado).
 */
async function sendFirstAccessLink(email: string): Promise<void> {
  const admin = createAdminClient();
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${getAppUrl()}/update-password` },
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (linkErr || !tokenHash) return; // conta inexistente: silêncio

  const actionLink = `${getAppUrl()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery&next=${encodeURIComponent("/update-password")}`;
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("email", email)
    .maybeSingle();

  await sendAccessEmail({ to: email, name: profile?.full_name ?? null, actionLink });
}

export async function firstAccessAction(formData: FormData) {
  const email = stringValue(formData, "email").toLowerCase();

  if (!email) {
    redirectWith("/primeiro-acesso", "error", "Informe seu e-mail.");
  }

  await sendFirstAccessLink(email);

  redirectWith(
    "/primeiro-acesso",
    "message",
    "Se este e-mail tiver acesso liberado, enviamos um link para você criar sua senha. Confira a caixa de entrada (e o spam).",
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

  if (password !== confirmPassword) {
    redirectWith("/update-password", "error", "As senhas precisam ser iguais.");
  }
  if (!validatePassword(password).ok) {
    redirectWith(
      "/update-password",
      "error",
      "A senha precisa ter pelo menos 8 caracteres, uma letra maiúscula, um número e um símbolo.",
    );
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
    // Marca que o usuário já criou a própria senha (encerra o 1º acesso) e
    // satisfaz o 2FA desta sessão (cookie) — evita o /verificar redundante.
    await createAdminClient()
      .from("profiles")
      .update({ password_set_at: new Date().toISOString() })
      .eq("id", userId);

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
