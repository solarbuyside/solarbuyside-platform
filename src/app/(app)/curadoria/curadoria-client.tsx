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
  Trash2,
  Plus,
  FileText,
  UploadCloud,
  ArrowLeft,
  Clock,
} from "lucide-react";

import type { ContractAnalysis, FindingSeverity } from "@/domain/contracts/analyzer";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { extractPdfText } from "@/lib/contracts/pdf-text";
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
  { label: string; cls: string; icon: React.ReactNode; badge: "emerald" | "orange" | "destructive" }
> = {
  approved: {
    label: "Aprovado",
    cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    icon: <ShieldCheck className="h-5 w-5" />,
    badge: "emerald",
  },
  attention: {
    label: "Requer atenção",
    cls: "text-amber-700 bg-amber-50 border-amber-200",
    icon: <ShieldAlert className="h-5 w-5" />,
    badge: "orange",
  },
  reproved: {
    label: "Reprovado",
    cls: "text-destructive bg-destructive/5 border-destructive/20",
    icon: <ShieldX className="h-5 w-5" />,
    badge: "destructive",
  },
};

const SEV_STYLE: Record<FindingSeverity, { cls: string; icon: React.ReactNode }> = {
  danger: { cls: "border-destructive/20 bg-destructive/5", icon: <ShieldX className="h-4 w-4 text-destructive" /> },
  warning: { cls: "border-amber-200/70 bg-amber-50", icon: <AlertTriangle className="h-4 w-4 text-amber-600" /> },
  info: { cls: "border-sky-200/70 bg-sky-50", icon: <Info className="h-4 w-4 text-sky-600" /> },
};

type View = "list" | "new";

export function CuradoriaClient({ initialReviews }: { initialReviews: SavedReview[] }) {
  const [reviews, setReviews] = React.useState(initialReviews);
  const [view, setView] = React.useState<View>("list");

  function handleDelete(id: string) {
    void deleteContractReviewAction(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSaved(review: SavedReview) {
    setReviews((prev) => [review, ...prev]);
    setView("list");
  }

  if (view === "new") {
    return <NewReview onCancel={() => setView("list")} onSaved={handleSaved} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setView("new")}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.2)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nova curadoria
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-700">Nenhuma curadoria ainda</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Analise o contrato de um fornecedor antes de assinar — cole o texto ou arraste um PDF.
          </p>
          <button
            onClick={() => setView("new")}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Analisar um contrato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => {
            const v = VERDICT[r.verdict];
            return (
              <div key={r.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", v.cls)}>
                    {v.icon}
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="mt-3 text-base font-bold leading-tight text-slate-900">{r.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <Badge variant={v.badge} className="text-[10px]">
                    {v.label}
                  </Badge>
                  <span className="text-sm font-bold text-slate-700">
                    {r.score}
                    <span className="text-xs text-slate-300">/100</span>
                  </span>
                </div>
                {r.approvedByUser && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <Check className="h-3 w-3" /> Aprovado por você
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// New review flow: choose mode → input → analysis → save
// ---------------------------------------------------------------------------

type Mode = "choose" | "manual" | "auto";

function NewReview({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: (r: SavedReview) => void;
}) {
  const [mode, setMode] = React.useState<Mode>("choose");
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [analysis, setAnalysis] = React.useState<ContractAnalysis | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function runAnalysis(contractText: string) {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeContractAction(contractText);
      setAnalysis(result);
    } catch {
      setError("Não foi possível analisar. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave(approvedByUser: boolean) {
    if (!analysis) return;
    setSaving(true);
    try {
      const id = await saveContractReviewAction({ title, contractText: text, approvedByUser });
      onSaved({
        id,
        title: title.trim() || "Contrato sem título",
        verdict: analysis.verdict,
        score: analysis.score,
        approvedByUser,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para curadorias
      </button>

      {mode === "choose" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ModeCard
            icon={<FileText className="h-6 w-6" />}
            title="Colar texto (manual)"
            desc="Cole o título e o texto do contrato manualmente."
            onClick={() => setMode("manual")}
          />
          <ModeCard
            icon={<UploadCloud className="h-6 w-6" />}
            title="Carregar PDF (automático)"
            desc="Arraste um arquivo PDF e o sistema lê o texto sozinho."
            onClick={() => setMode("auto")}
          />
        </div>
      )}

      {mode !== "choose" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(320px,400px)]">
          {/* Input column */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Título do contrato
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Contrato Renova Energia"
                className="mb-4 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />

              {mode === "auto" ? (
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
                    rows={12}
                    placeholder="Cole aqui o texto completo do contrato…"
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => runAnalysis(text)}
                  disabled={analyzing || text.trim().length === 0}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
                  Analisar contrato
                </button>
                {mode === "auto" && text.length > 0 && (
                  <span className="text-xs text-slate-400">
                    {text.length.toLocaleString("pt-BR")} caracteres lidos
                  </span>
                )}
              </div>
              {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
            </div>
          </div>

          {/* Result column */}
          <div>
            {!analysis ? (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
                <FileSearch className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">O resultado da análise aparecerá aqui.</p>
              </div>
            ) : (
              <ResultPanel analysis={analysis} saving={saving} onSave={handleSave} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(249,115,22,0.1)]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
    </button>
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
      setError("Falha ao ler o PDF. Tente outro arquivo ou cole o texto manualmente.");
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
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
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
            <p className="mt-2 text-sm font-semibold text-slate-700">Arraste o PDF aqui</p>
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
  onSave,
}: {
  analysis: ContractAnalysis;
  saving: boolean;
  onSave: (approvedByUser: boolean) => void;
}) {
  const [saved, setSaved] = React.useState(false);
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

      <div className="max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
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

      {saved ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          <Check className="h-4 w-4" /> Curadoria salva
        </span>
      ) : (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <button
            onClick={() => {
              onSave(true);
              setSaved(true);
            }}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Aprovar e salvar
          </button>
          <button
            onClick={() => {
              onSave(false);
              setSaved(true);
            }}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
          >
            Salvar análise
          </button>
        </div>
      )}
    </div>
  );
}
