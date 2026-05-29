"use client";

import * as React from "react";
import { Share2, Copy, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createShareLinkAction } from "./actions";

export function ShareButton({
  comparisonId,
  competitorId,
  competitorName,
}: {
  comparisonId: string;
  competitorId: string;
  competitorName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [link, setLink] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    if (link) return;
    setLoading(true);
    setError(null);
    try {
      const url = await createShareLinkAction(comparisonId, competitorId);
      setLink(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar link.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Não foi possível copiar. Copie manualmente.");
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:border-primary/50 hover:text-primary active:scale-[0.98]"
      >
        <Share2 className="h-3.5 w-3.5" />
        Compartilhar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Share2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Link para o fornecedor</h4>
                  <p className="text-xs text-slate-500">{competitorName}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Envie este link para o vendedor preencher os dados <strong>técnicos e financeiros</strong> da
              proposta. Ele não precisa de conta e não vê notas nem outros fornecedores.
            </p>

            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-4 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando link…
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            ) : link ? (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={link}
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none"
                />
                <button
                  onClick={copy}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-4 text-xs font-bold transition-all active:scale-[0.97]",
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/95",
                  )}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
