import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";

/**
 * Tela cheia exibida quando o acesso pago expirou ou foi bloqueado
 * (reembolso/chargeback). Substitui o app inteiro até a regularização.
 */
export function AccessBlocked({ reason }: { reason: "expired" | "blocked" }) {
  const title = reason === "expired" ? "Seu acesso expirou" : "Acesso indisponível";
  const message =
    reason === "expired"
      ? "O período de 6 meses de acesso à plataforma chegou ao fim. Para continuar utilizando, renove o seu acesso."
      : "Seu acesso à plataforma está bloqueado no momento. Se você acredita que isto é um engano, fale com o nosso suporte.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <LockKeyhole className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          <a
            href="mailto:contato@solarbuyside.com.br"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98]"
          >
            Falar com o suporte
          </a>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100"
            >
              Sair
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Solar Buy-Side ·{" "}
          <Link href="/legal/termos" className="font-semibold text-primary hover:underline">
            Termos de Uso
          </Link>
        </p>
      </div>
    </main>
  );
}
