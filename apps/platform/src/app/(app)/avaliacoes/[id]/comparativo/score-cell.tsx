"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pontuação ponderada exibida na célula: (nota / 10) × peso. */
function weightedOf(value: number | null, weight: number): number | null {
  if (value == null) return null;
  return Math.round((value / 10) * weight * 10) / 10;
}

function fmt(n: number | null): string {
  if (n == null) return "—";
  return n.toFixed(1).replace(".", ",");
}

/**
 * Célula da tabela de pontuação. A exibição depende do MODO:
 * - AUTOMÁTICO (`weighted`): mostra o valor PONDERADO de cada critério
 *   ((nota/10)×peso), para o total da coluna bater com o Índice de
 *   Confiabilidade. A nota automática (não editada à mão) ganha o selo "auto".
 * - MANUAL (`weighted=false`): mostra a NOTA CRUA que o comprador escolheu
 *   (clicou 4 → aparece 4), sem peso, porque no manual o índice é a média
 *   simples das notas. Em ambos os casos a edição é da nota de 0 a 10 (inteiro).
 */
export function ScoreCell({
  value,
  weight,
  weighted = true,
  auto,
  disabled,
  readOnly,
  onChange,
}: {
  /** Nota efetiva (0 a 10): override manual, ou a sugestão automática. */
  value: number | null;
  /** Peso (%) do critério, usado para calcular o valor ponderado exibido. */
  weight: number;
  /** True (automático) exibe o ponderado; false (manual) exibe a nota crua. */
  weighted?: boolean;
  /** True quando o valor exibido vem do cálculo automático (não manual). */
  auto: boolean;
  /** Linha desligada (Avaliar? = não). */
  disabled?: boolean;
  /** Mostra o valor mas não permite edição (modo automático). */
  readOnly?: boolean;
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

  // No automático mostramos o ponderado; no manual, a nota crua escolhida.
  const display = weighted ? weightedOf(value, weight) : value;

  return (
    <div ref={ref} className="relative inline-flex items-center gap-1">
      <button
        onClick={() => !readOnly && setOpen((o) => !o)}
        disabled={readOnly}
        className={cn(
          "inline-flex h-8 min-w-[3rem] items-center justify-center gap-1 rounded-md border px-2 text-sm font-bold transition-all",
          readOnly
            ? "cursor-not-allowed border-slate-200 bg-white text-slate-400"
            : open
              ? "border-primary bg-primary/10 text-primary"
              : auto
                ? "border-slate-200 bg-white text-slate-500 hover:border-primary/40"
                : "border-primary/40 bg-primary/5 text-primary hover:border-primary",
        )}
        title={
          readOnly
            ? `Nota ${value}/10 (modo automático — não editável)`
            : value == null
              ? "Clique para definir a nota (0 a 10)"
              : weighted
                ? `Nota ${value}/10 com peso ${weight}% = ${fmt(display)} ponderado`
                : `Nota ${value}/10`
        }
      >
        {fmt(display)}
        {auto && value != null && <Sparkles className="h-3 w-3 text-primary/60" />}
      </button>

      {!readOnly && (
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
      )}

      {open && (
        <div className="absolute left-1/2 top-10 z-30 w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl animate-in fade-in zoom-in-95">
          <div className="mb-1 flex items-center justify-between">
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
          <p className="mb-2 text-[10px] text-slate-400">
            {weighted
              ? `Peso ${weight}%. A nota vira ${value == null ? "o valor" : fmt(display)} ponderado na tabela.`
              : "A nota escolhida aparece direto na tabela e entra na média."}
          </p>
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
              {weighted ? "Limpar (voltar à nota automática)" : "Limpar nota"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
