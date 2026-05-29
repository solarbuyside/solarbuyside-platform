"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileSpreadsheet,
  Users,
  Clock,
  Search,
  Trash2,
  Pencil,
  Loader2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { deleteComparisonAction, renameComparisonAction } from "./list-actions";

export type ComparisonListItem = {
  id: string;
  title: string;
  status: "draft" | "ready_for_review" | "completed";
  competitorCount: number;
  competitors: string[];
  updatedAt: string;
};

const STATUS: Record<string, { label: string; variant: "secondary" | "orange" | "emerald" }> = {
  draft: { label: "Rascunho", variant: "orange" },
  ready_for_review: { label: "Em revisão", variant: "orange" },
  completed: { label: "Concluída", variant: "emerald" },
};

type Filter = "all" | "draft" | "completed";

export function AvaliacoesList({ items }: { items: ComparisonListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [renaming, setRenaming] = React.useState<ComparisonListItem | null>(null);
  const [deleting, setDeleting] = React.useState<ComparisonListItem | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filter === "draft" && it.status === "completed") return false;
      if (filter === "completed" && it.status !== "completed") return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        it.competitors.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [items, query, filter]);

  return (
    <>
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou fornecedor…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="flex gap-1.5">
          {(
            [
              { id: "all", label: "Todas" },
              { id: "draft", label: "Em andamento" },
              { id: "completed", label: "Concluídas" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                filter === f.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
          <FileSpreadsheet className="mx-auto h-9 w-9 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            {items.length === 0
              ? "Nenhuma avaliação ainda."
              : "Nenhuma avaliação corresponde à busca."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const status = STATUS[c.status] ?? { label: c.status, variant: "secondary" as const };
            const updated = new Date(c.updatedAt).toLocaleDateString("pt-BR");
            return (
              <div
                key={c.id}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_4px_16px_rgba(249,115,22,0.08)]"
              >
                <div className="p-5 pb-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant={status.variant} className="text-[10px] uppercase">
                      {status.label}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setRenaming(c)}
                        title="Renomear"
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleting(c)}
                        title="Excluir"
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold leading-tight text-slate-900">{c.title}</h3>
                  <p className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                    <Users className="h-3 w-3" />
                    {c.competitorCount} fornecedores
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    {updated}
                  </p>
                  {c.competitors.length > 0 && (
                    <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                      {c.competitors.join(" · ")}
                    </p>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                  <Link
                    href={`/avaliacoes/${c.id}/preencher`}
                    className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
                  >
                    Continuar
                  </Link>
                  <Link
                    href={`/avaliacoes/${c.id}/comparativo`}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Comparativo <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {renaming && (
        <RenameModal
          item={renaming}
          onClose={() => setRenaming(null)}
          onDone={() => {
            setRenaming(null);
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <DeleteModal
          item={deleting}
          onClose={() => setDeleting(null)}
          onDone={() => {
            setDeleting(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function RenameModal({
  item,
  onClose,
  onDone,
}: {
  item: ComparisonListItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const [title, setTitle] = React.useState(item.title);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await renameComparisonAction(item.id, title);
      onDone();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Erro ao renomear.");
    }
  }

  return (
    <ModalShell onClose={onClose} title="Renomear avaliação" icon={<Pencil className="h-4.5 w-4.5" />}>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={saving || title.trim().length < 3}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Salvar
        </button>
      </div>
    </ModalShell>
  );
}

function DeleteModal({
  item,
  onClose,
  onDone,
}: {
  item: ComparisonListItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function confirm() {
    setDeleting(true);
    setError(null);
    try {
      await deleteComparisonAction(item.id);
      onDone();
    } catch (err) {
      setDeleting(false);
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      title="Excluir avaliação"
      icon={<AlertTriangle className="h-4.5 w-4.5" />}
      danger
    >
      <p className="text-sm leading-relaxed text-slate-600">
        Tem certeza que deseja excluir <strong className="text-slate-900">{item.title}</strong>? Isso
        apaga permanentemente a avaliação e todos os dados dos fornecedores. Esta ação não pode ser
        desfeita.
      </p>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          onClick={confirm}
          disabled={deleting}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-5 text-sm font-bold text-white hover:bg-destructive/90 disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Excluir
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  icon,
  danger,
  onClose,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
              )}
            >
              {icon}
            </div>
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
