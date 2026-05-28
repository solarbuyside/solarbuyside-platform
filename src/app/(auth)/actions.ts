"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWith("/login", "error", "Nao foi possivel entrar. Confira seus dados.");
  }

  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const fullName = stringValue(formData, "fullName");
  const email = stringValue(formData, "email");
  const password = stringValue(formData, "password");

  if (!email || password.length < 8) {
    redirectWith("/login", "error", "Use um e-mail valido e senha com pelo menos 8 caracteres.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || null,
      },
    },
  });

  if (error) {
    redirectWith("/login", "error", "Nao foi possivel criar sua conta.");
  }

  redirectWith("/login", "message", "Conta criada. Confira seu e-mail ou entre para continuar.");
}

export async function resetPasswordAction(formData: FormData) {
  const email = stringValue(formData, "email");

  if (!email) {
    redirectWith("/reset-password", "error", "Informe seu e-mail.");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
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
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirectWith("/update-password", "error", "Nao foi possivel atualizar a senha.");
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
