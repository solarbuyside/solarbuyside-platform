"use client";

import * as React from "react";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyEvaluation, TechnicalEvaluation } from "@/domain/comparisons/types";
import { saveCompanyToLibraryAction } from "./actions";

export function SaveToLibraryButton({
  companyName,
  sellerName,
  company,
  technical,
}: {
  companyName: string;
  sellerName: string | null;
  company: CompanyEvaluation;
  technical: TechnicalEvaluation;
}) {
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setState("saving");
    try {
      await saveCompanyToLibraryAction({ companyName, sellerName, company, technical });
      setState("saved");
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      window.setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={state === "saving"}
      title="Salvar esta empresa para reaproveitar em outros comparativos"
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-all active:scale-[0.98]",
        state === "saved"
          ? "border-emerald-500/30 bg-emerald-50 text-emerald-600"
          : state === "error"
            ? "border-destructive/30 bg-destructive/5 text-destructive"
            : "border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-primary",
      )}
    >
      {state === "saving" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : state === "saved" ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <BookmarkPlus className="h-3.5 w-3.5" />
      )}
      {state === "saved" ? "Salva na biblioteca" : state === "error" ? "Erro" : "Salvar empresa"}
    </button>
  );
}
