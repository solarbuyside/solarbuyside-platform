"use client";

import * as React from "react";
import { Zap, Wallet, Check, Loader2, CircleAlert } from "lucide-react";

import { technicalFormFields, financialFormFields } from "@/domain/comparisons/workflow";
import type { TechnicalEvaluation, FinancialEvaluation } from "@/domain/comparisons/types";
import { InterviewForm } from "@/app/(app)/avaliacoes/[id]/preencher/step-wizard";
import { submitSharedResponseAction } from "./actions";

export function ResponderForm({
  token,
  initialTechnical,
  initialFinancial,
}: {
  token: string;
  initialTechnical: TechnicalEvaluation;
  initialFinancial: FinancialEvaluation;
}) {
  const [technical, setTechnical] = React.useState<TechnicalEvaluation>(initialTechnical);
  const [financial, setFinancial] = React.useState<FinancialEvaluation>(initialFinancial);
  const [state, setState] = React.useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  // The shared form has no real competitor object; InterviewForm only uses the
  // name for the Reclame Aqui search link, which we hide from vendors anyway.
  const pseudoCompetitor = { companyName: "", id: "", position: 1, company: {}, technical, financial };

  async function handleSubmit() {
    setState("saving");
    setError(null);
    try {
      await submitSharedResponseAction(token, technical, financial);
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Erro ao enviar.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
          <Check className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Resposta enviada!</h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Obrigado. Seus dados foram enviados ao comprador. Você pode fechar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
          <Zap className="h-4.5 w-4.5 text-primary" />
          Proposta técnica
        </h3>
        <InterviewForm
          fields={technicalFormFields}
          competitor={pseudoCompetitor}
          getValue={(prop) => (technical as Record<string, unknown>)[prop] ?? null}
          onChange={(prop, value) => setTechnical((t) => ({ ...t, [prop]: value }))}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
          <Wallet className="h-4.5 w-4.5 text-primary" />
          Viabilidade financeira
        </h3>
        <InterviewForm
          fields={financialFormFields}
          competitor={pseudoCompetitor}
          getValue={(prop) => (financial as Record<string, unknown>)[prop] ?? null}
          onChange={(prop, value) => setFinancial((f) => ({ ...f, [prop]: value }))}
        />
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={state === "saving"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-bold text-primary-foreground transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.3)] active:scale-[0.98] disabled:opacity-80"
        >
          {state === "saving" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando…
            </>
          ) : (
            "Enviar proposta"
          )}
        </button>
      </div>
    </div>
  );
}
