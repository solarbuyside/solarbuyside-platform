"use client";

import * as React from "react";
import Link from "next/link";
import { User, Phone, Mail, ShieldCheck, KeyRound, LogOut, Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/app/(auth)/actions";
import { updateProfileAction } from "./actions";

export function SettingsForm({
  email,
  isAdmin,
  roleLabel,
  initialFullName,
  initialPhone,
}: {
  email: string | null;
  isAdmin: boolean;
  roleLabel: string;
  initialFullName: string | null;
  initialPhone: string | null;
}) {
  const [fullName, setFullName] = React.useState(initialFullName ?? "");
  const [phone, setPhone] = React.useState(initialPhone ?? "");
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const dirty = fullName !== (initialFullName ?? "") || phone !== (initialPhone ?? "");

  async function handleSave() {
    setState("saving");
    setError(null);
    try {
      await updateProfileAction({ fullName, phone });
      setState("saved");
      window.setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Perfil</h3>
          <Badge variant={isAdmin ? "orange" : "secondary"}>{roleLabel}</Badge>
        </div>

        <div className="space-y-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Nome completo</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                className={inputClass}
              />
            </div>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Telefone</span>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                inputMode="tel"
                className={inputClass}
              />
            </div>
          </label>

          <div className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">E-mail</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                value={email ?? ""}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-sm text-slate-400"
              />
            </div>
            <span className="text-[11px] text-slate-400">O e-mail é usado para login e não pode ser alterado aqui.</span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!dirty || state === "saving"}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
              state === "saved"
                ? "bg-emerald-500 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.25)]",
            )}
          >
            {state === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando…
              </>
            ) : state === "saved" ? (
              <>
                <Check className="h-4 w-4" />
                Salvo
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
          {!dirty && state === "idle" && (
            <span className="text-xs text-slate-400">Nenhuma alteração pendente.</span>
          )}
        </div>
      </section>

      {/* Security */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Segurança</h3>
        <Link
          href="/reset-password"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all hover:border-primary/40 hover:text-primary active:scale-[0.98]"
        >
          <KeyRound className="h-4 w-4" />
          Trocar senha
        </Link>
      </section>

      {/* Session */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
          <ShieldCheck className="h-4 w-4" />
          Sessão
        </h3>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-5 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </form>
      </section>
    </div>
  );
}
