"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Check,
  Trash2,
  Plus,
  FileText,
  UploadCloud,
  Clock,
  X,
  ArrowRight,
} from "lucide-react";

import { cn, formatDateBR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { deleteContractReviewAction } from "./actions";

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

export function CuradoriaClient({ initialReviews }: { initialReviews: SavedReview[] }) {
  const [reviews, setReviews] = React.useState(initialReviews);
  const [modalOpen, setModalOpen] = React.useState(false);

  function handleDelete(id: string) {
    void deleteContractReviewAction(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
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
            onClick={() => setModalOpen(true)}
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
                  {formatDateBR(r.createdAt)}
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

      {modalOpen && <NewReviewModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function NewReviewModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [choice, setChoice] = React.useState<"manual" | "pdf" | null>(null);

  function confirm() {
    if (!choice) return;
    router.push(`/curadoria/nova/${choice}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between">
          <h4 className="text-lg font-bold text-slate-900">Nova curadoria</h4>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-5 text-sm text-slate-500">Como você quer enviar o contrato para análise?</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ChoiceCard
            active={choice === "manual"}
            icon={<FileText className="h-6 w-6" />}
            title="Colar texto"
            desc="Cole o texto do contrato manualmente."
            onClick={() => setChoice("manual")}
          />
          <ChoiceCard
            active={choice === "pdf"}
            icon={<UploadCloud className="h-6 w-6" />}
            title="Carregar PDF"
            desc="Arraste um arquivo PDF e leremos o texto."
            onClick={() => setChoice("pdf")}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={confirm}
            disabled={!choice}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({
  active,
  icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          active ? "bg-primary text-white" : "bg-primary/10 text-primary",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-bold text-slate-900">{title}</span>
      <span className="text-xs text-slate-500">{desc}</span>
    </button>
  );
}
