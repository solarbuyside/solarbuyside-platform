"use client";

import * as React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  FileSearch,
  Check,
  AlertTriangle,
  Info,
  Save,
  Trash2,
} from "lucide-react";

import type { ContractAnalysis, FindingSeverity } from "@/domain/contracts/analyzer";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  analyzeContractAction,
  saveContractReviewAction,
  deleteContractReviewAction,
} from "./actions";

export type SavedReview = {
  id: string;
  title: string;
  verdict: "reproved" | "attention" | "approved";
  score: number;
  approvedByUser: boolean;
  createdAt: string;
};

const VERDICT: Record<
  string,
  { label: string; cls: string; icon: React.ReactNode; bar: string }
> = {
  approved: {
    label: "Aprovado",
    cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    icon: <ShieldCheck className="h-5 w-5" />,
    bar: "bg-emerald-500",
  },
  attention: {
    label: "Requer atenção",
    cls: "text-amber-700 bg-amber-50 border-amber-200",
    icon: <ShieldAlert className="h-5 w-5" />,
    bar: "bg-amber-500",
  },
  reproved: {
    label: "Reprovado",
    cls: "text-destructive bg-destructive/5 border-destructive/20",
    icon: <ShieldX className="h-5 w-5" />,
    bar: "bg-destructive",
  },
};

const SEV_STYLE: Record<FindingSeverity, { cls: string; icon: React.ReactNode }> = {
  danger: { cls: "border-destructive/20 bg-destructive/5", icon: <ShieldX className="h-4 w-4 text-destructive" /> },
  warning: { cls: "border-amber-200/70 bg-amber-50", icon: <AlertTriangle className="h-4 w-4 text-amber-600" /> },
  info: { cls: "border-sky-200/70 bg-sky-50", icon: <Info className="h-4 w-4 text-sky-600" /> },
};

export function CuradoriaClient({ initialReviews }: { initialReviews: SavedReview[] }) {
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [analysis, setAnalysis] = React.useState<ContractAnalysis | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [reviews, setReviews] = React.useState(initialReviews);

  async function handleAnalyze() {
    setAnalyzing(true);
    setSaved(false);
    try {
      const result = await analyzeContractAction(text);
      setAnalysis(result);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave(approvedByUser: boolean) {
    setSaving(true);
    try {
      const id = await saveContractReviewAction({ title, contractText: text, approvedByUser });
      if (analysis) {
        setReviews((prev) => [
          {
            id,
            title: title.trim() || "Contrato sem título",
            verdict: analysis.verdict,
            score: analysis.score,
            approvedByUser,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteContractReviewAction(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    file.text().then((content) => setText(content));
  }

  const v = analysis ? VERDICT[analysis.verdict] : null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      {/* Left: input + analysis */}
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Título do contrato
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Contrato Renova Energia"
            className="mb-4 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />

          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Texto do contrato
            </label>
            <label className="cursor-pointer text-xs font-semibold text-primary hover:underline">
              Carregar arquivo .txt
              <input type="file" accept=".txt,text/plain" className="hidden" onChange={onFile} />
            </label>
          </div>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setAnalysis(null);
              setSaved(false);
            }}
            rows={12}
            placeholder="Cole aqui o texto do seu contrato de energia solar para análise…"
            className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || text.trim().length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
              Analisar contrato
            </button>
            <span className="text-xs text-slate-400">
              Análise por regras — sem IA. Nada substitui a leitura atenta.
            </span>
          </div>
        </div>

        {analysis && v && (
          <div className="space-y-4">
            {/* Verdict header */}
            <div className={cn("flex items-center gap-4 rounded-xl border p-5", v.cls)}>
              {v.icon}
              <div className="flex-1">
                <p className="text-lg font-bold">{v.label}</p>
                <p className="text-xs opacity-80">
                  {analysis.summary.danger} crítico(s) · {analysis.summary.warning} atenção ·{" "}
                  {analysis.summary.info} informativo(s)
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold">{analysis.score}</span>
                <span className="text-sm font-bold opacity-60">/100</span>
              </div>
            </div>

            {/* Findings */}
            <div className="space-y-2.5">
              {analysis.findings.map((f, i) => {
                const s = SEV_STYLE[f.severity];
                return (
                  <div key={i} className={cn("rounded-xl border p-4", s.cls)}>
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      {s.icon}
                      {f.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.detail}</p>
                    {f.excerpt && (
                      <p className="mt-2 rounded-md bg-white/60 px-3 py-2 text-xs italic text-slate-500">
                        “{f.excerpt}”
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save actions */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
              {saved ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <Check className="h-4 w-4" /> Curadoria salva
                </span>
              ) : (
                <>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Aprovar e salvar
                  </button>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Salvar análise
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: saved reviews */}
      <aside className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Curadorias salvas</h3>
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
            Nenhuma análise salva ainda.
          </div>
        ) : (
          reviews.map((r) => {
            const rv = VERDICT[r.verdict];
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{r.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-md p-1 text-slate-300 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Badge
                    variant={
                      r.verdict === "approved" ? "emerald" : r.verdict === "attention" ? "orange" : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {rv.label}
                  </Badge>
                  {r.approvedByUser && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <Check className="h-3 w-3" /> Aprovado por você
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </aside>
    </div>
  );
}
