"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { ShieldCheck, Loader2, Mail } from "lucide-react";

import { verifyCodeAction, resendCodeAction, sendCodeAction } from "./actions";

const RESEND_COOLDOWN = 45;

function PrimaryButton({ idleLabel, pendingLabel, icon }: { idleLabel: string; pendingLabel: string; icon?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

/** Reenviar com cooldown: ao chegar em ?sent=1 um código foi enviado, então
 * inicia em 45s e desconta até liberar. Cada (re)envio recarrega a página e
 * reinicia o contador. */
function ResendButton() {
  const [left, setLeft] = React.useState(RESEND_COOLDOWN);
  const { pending } = useFormStatus();

  React.useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? 0 : l - 1)), 1000);
    return () => clearInterval(t);
  }, [left]);

  const blocked = left > 0 || pending;
  return (
    <button
      type="submit"
      disabled={blocked}
      className="w-full text-center text-xs font-semibold text-slate-400 transition-colors enabled:cursor-pointer enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending
        ? "Reenviando…"
        : left > 0
          ? `Reenviar código em ${left}s`
          : "Não recebeu? Reenviar código"}
    </button>
  );
}

export function VerifyForm({ email, sent }: { email: string; sent: boolean }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-center text-xl font-bold tracking-tight text-slate-900">
        Verifique seu acesso
      </h1>

      {sent ? (
        <>
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
            <PrimaryButton idleLabel="Entrar" pendingLabel="Verificando…" />
          </form>

          <form action={resendCodeAction} className="mt-3">
            <ResendButton />
          </form>
        </>
      ) : (
        <>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
            Por segurança, enviaremos um código de 6 dígitos para <strong>{email}</strong>. Clique abaixo para receber.
          </p>

          <form action={sendCodeAction} className="mt-6">
            <PrimaryButton idleLabel="Enviar código por e-mail" pendingLabel="Enviando…" icon={<Mail className="h-4 w-4" />} />
          </form>
        </>
      )}
    </div>
  );
}
