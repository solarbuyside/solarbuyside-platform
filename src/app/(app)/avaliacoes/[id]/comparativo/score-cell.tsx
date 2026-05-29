"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Célula de nota editável (coluna "P" da planilha). Mostra a nota atual com
 * setinhas ↑↓ e, ao clicar no número, abre um seletor 0-10 bonito. Quando a
 * nota é a sugestão automática (não foi editada à mão), mostra o selo "auto".
 */
export function ScoreCell({
  value,
  auto,
  disabled,
  onChange,
}: {
  /** Nota efetiva exibida (override manual, ou auto). */
  value: number | null;
  /** True quando o valor exibido vem do cálculo automático (não manual). */
  auto: boolean;
  /** Linha desligada (Avaliar? = não). */
  disabled?: boolean;
  onChange: (next: number | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function step(delta: number) {
    const base = value ?? 0;
    const next = Math.min(10, Math.max(0, base + delta));
    onChange(next);
  }

  if (disabled) {
    return <span className="text-xs text-slate-300">—</span>;
  }

  return (
    <div ref={ref} className="relative inline-flex items-center gap-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-8 min-w-[2.5rem] items-center justify-center gap-1 rounded-md border px-2 text-sm font-bold transition-all",
          open
            ? "border-primary bg-primary/10 text-primary"
            : auto
              ? "border-slate-200 bg-white text-slate-500 hover:border-primary/40"
              : "border-primary/40 bg-primary/5 text-primary hover:border-primary",
        )}
        title={auto ? "Nota sugerida automaticamente — clique para definir" : "Clique para editar"}
      >
        {value ?? "—"}
        {auto && value != null && <Sparkles className="h-3 w-3 text-primary/60" />}
      </button>

      <div className="flex flex-col">
        <button
          onClick={() => step(1)}
          className="flex h-4 w-4 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          tabIndex={-1}
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          onClick={() => step(-1)}
          className="flex h-4 w-4 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          tabIndex={-1}
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {open && (
        <div className="absolute left-1/2 top-10 z-30 w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl animate-in fade-in zoom-in-95">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Nota (0 a 10)
            </span>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: 11 }).map((_, n) => (
              <button
                key={n}
                onClick={() => {
                  onChange(n);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-8 items-center justify-center rounded-md border text-sm font-bold transition-all active:scale-95",
                  value === n
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          {!auto && (
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="mt-2 w-full rounded-md py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600"
            >
              Limpar (voltar à nota automática)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
