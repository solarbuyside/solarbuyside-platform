"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  FileSearch,
  Check,
  AlertTriangle,
  Info,
  UploadCloud,
  ArrowLeft,
} from "lucide-react";

import type { ContractAnalysis, FindingSeverity } from "@/domain/contracts/analyzer";
import { cn } from "@/lib/utils";
import { extractPdfText } from "@/lib/contracts/pdf-text";
import { analyzeContractAction, saveContractReviewAction } from "../actions";

const VERDICT: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  approved: { label: "Aprovado", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: <ShieldCheck className="h-5 w-5" /> },
  attention: { label: "Requer atenção", cls: "text-amber-700 bg-amber-50 border-amber-200", icon: <ShieldAlert className="h-5 w-5" /> },
  reproved: { label: "Reprovado", cls: "text-destructive bg-destructive/5 border-destructive/20", icon: <ShieldX className="h-5 w-5" /> },
};

const SEV_STYLE: Record<FindingSeverity, { cls: string; icon: React.ReactNode }> = {
  danger: { cls: "border-destructive/20 bg-destructive/5", icon: <ShieldX className="h-4 w-4 text-destructive" /> },
  warning: { cls: "border-amber-200/70 bg-amber-50", icon: <AlertTriangle className="h-4 w-4 text-amber-600" /> },
  info: { cls: "border-sky-200/70 bg-sky-50", icon: <Info className="h-4 w-4 text-sky-600" /> },
};

export function ReviewEditor({ mode }: { mode: "manual" | "pdf" }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [analysis, setAnalysis] = React.useState<ContractAnalysis | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function runAnalysis() {
    setAnalyzing(true);
    setError(null);
    try {
      setAnalysis(await analyzeContractAction(text));
    } catch {
      setError("Não foi possível analisar. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave(approvedByUser: boolean) {
    setSaving(true);
    try {
      await saveContractReviewAction({ title, contractText: text, approvedByUser });
      setSaved(true);
      router.push("/curadoria");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/curadoria")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para curadorias
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(320px,400px)]">
        {/* Input */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Título do contrato
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Contrato Renova Energia"
            className="mb-4 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />

          {mode === "pdf" ? (
            <PdfDropzone
              onText={(t, name) => {
                setText(t);
                if (!title && name) setTitle(name.replace(/\.[^.]+$/, ""));
                setAnalysis(null);
              }}
              hasText={text.length > 0}
            />
          ) : (
            <>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Texto do contrato
              </label>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setAnalysis(null);
                }}
                rows={14}
                placeholder="Cole aqui o texto completo do contrato…"
                className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={runAnalysis}
              disabled={analyzing || text.trim().length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
              Analisar contrato
            </button>
            {mode === "pdf" && text.length > 0 && (
              <span className="text-xs text-slate-400">
                {text.length.toLocaleString("pt-BR")} caracteres lidos
              </span>
            )}
          </div>
          {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
        </div>

        {/* Result */}
        <div>
          {!analysis ? (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
              <FileSearch className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">O resultado da análise aparecerá aqui.</p>
            </div>
          ) : (
            <ResultPanel analysis={analysis} saving={saving} saved={saved} onSave={handleSave} />
          )}
        </div>
      </div>
    </div>
  );
}

function PdfDropzone({
  onText,
  hasText,
}: {
  onText: (text: string, fileName: string) => void;
  hasText: boolean;
}) {
  const [dragging, setDragging] = React.useState(false);
  const [reading, setReading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Envie um arquivo PDF.");
      return;
    }
    setReading(true);
    setError(null);
    setFileName(file.name);
    try {
      const text = await extractPdfText(file);
      if (text.trim().length < 40) {
        setError("Não consegui extrair texto deste PDF (pode ser um PDF escaneado/imagem).");
        return;
      }
      onText(text, file.name);
    } catch {
      setError("Falha ao ler o PDF. Tente outro arquivo ou use o modo manual.");
    } finally {
      setReading(false);
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-slate-300 bg-slate-50/50",
        )}
      >
        {reading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm font-medium text-slate-600">Lendo {fileName}…</p>
          </>
        ) : hasText ? (
          <>
            <Check className="h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-slate-700">{fileName} carregado</p>
            <p className="text-xs text-slate-400">Arraste outro PDF para substituir.</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Arraste o PDF do contrato aqui</p>
            <label className="mt-1 cursor-pointer text-xs font-semibold text-primary hover:underline">
              ou clique para escolher
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </label>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

function ResultPanel({
  analysis,
  saving,
  saved,
  onSave,
}: {
  analysis: ContractAnalysis;
  saving: boolean;
  saved: boolean;
  onSave: (approvedByUser: boolean) => void;
}) {
  const v = VERDICT[analysis.verdict];
  return (
    <div className="space-y-4">
      <div className={cn("flex items-center gap-3 rounded-xl border p-4", v.cls)}>
        {v.icon}
        <div className="flex-1">
          <p className="text-base font-bold">{v.label}</p>
          <p className="text-[11px] opacity-80">
            {analysis.summary.danger} crítico(s) · {analysis.summary.warning} atenção ·{" "}
            {analysis.summary.info} info
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold">{analysis.score}</span>
          <span className="text-xs font-bold opacity-60">/100</span>
        </div>
      </div>

      <div className="max-h-[480px] space-y-2.5 overflow-y-auto pr-1">
        {analysis.findings.map((f, i) => {
          const s = SEV_STYLE[f.severity];
          return (
            <div key={i} className={cn("rounded-xl border p-3.5", s.cls)}>
              <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                {s.icon}
                {f.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{f.detail}</p>
              {f.excerpt && (
                <p className="mt-2 rounded-md bg-white/70 px-2.5 py-1.5 text-[11px] italic text-slate-500">
                  “{f.excerpt}”
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        <button
          onClick={() => onSave(true)}
          disabled={saving || saved}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Aprovar e salvar
        </button>
        <button
          onClick={() => onSave(false)}
          disabled={saving || saved}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
        >
          Salvar análise
        </button>
      </div>
    </div>
  );
}
