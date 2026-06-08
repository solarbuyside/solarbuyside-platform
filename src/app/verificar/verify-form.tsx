"use client";

import { useFormStatus } from "react-dom";
import { ShieldCheck, Loader2 } from "lucide-react";

import { verifyCodeAction, resendCodeAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98] disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Verificando…" : "Entrar"}
    </button>
  );
}

export function VerifyForm({ email }: { email: string }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-center text-xl font-bold tracking-tight text-slate-900">
        Verifique seu acesso
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
        Enviamos um código de 6 dígitos para <strong>{email}</strong>. Digite-o abaixo para entrar.
      </p>

      <form action={verifyCodeAction} className="mt-6 grid gap-3">
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          placeholder="000000"
          className="h-14 w-full rounded-lg border-2 border-slate-200 bg-white text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <SubmitButton />
      </form>

      <form action={resendCodeAction} className="mt-3">
        <button
          type="submit"
          className="w-full text-center text-xs font-semibold text-slate-400 transition-colors hover:text-primary"
        >
          Não recebeu? Reenviar código
        </button>
      </form>
    </div>
  );
}
