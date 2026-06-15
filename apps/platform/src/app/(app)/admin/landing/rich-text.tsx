"use client";

import * as React from "react";
import { Bold, Eraser } from "lucide-react";

import { cn } from "@/lib/utils";
import { sanitizeCmsHtml } from "@/lib/landing/field-schema";

/**
 * Editor rich-text "fácil" para o cliente: caixa única, a palavra destacada já
 * aparece colorida dentro da caixa, e ao selecionar texto aparecem botões de
 * destaque da marca (laranja, azul, gradiente, negrito). A saída é HTML inline
 * sanitizado (mesmo allowlist do <CMSText> da landing) — não há tamanho de fonte
 * livre de propósito, pra não quebrar a tipografia do design system.
 */

type StyleBtn = { cls: string; label: string; swatch: string };

const STYLES: StyleBtn[] = [
  { cls: "cms-orange", label: "Laranja", swatch: "#F97316" },
  { cls: "cms-blue", label: "Azul", swatch: "#60a5fa" },
  { cls: "cms-gradient-orange", label: "Gradiente laranja", swatch: "linear-gradient(to right,#ea580c,#fb923c)" },
  { cls: "cms-gradient-blue", label: "Gradiente azul", swatch: "linear-gradient(to right,#60a5fa,#3b82f6)" },
];

export function RichTextEditor({
  value,
  onChange,
  simpleHighlightClass,
}: {
  value: string;
  onChange: (html: string) => void;
  /** Se definido: toolbar mostra só "Destaque" (com esta classe) + Negrito + Limpar.
   *  Usado por campos compostos (uma frase, um destaque). */
  simpleHighlightClass?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Define o HTML inicial uma vez (uncontrolled) — evita o cursor pular a cada tecla.
  React.useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    const el = ref.current;
    if (el) onChange(sanitizeCmsHtml(el.innerHTML));
  }

  function applyClass(cls: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.className = cls;
    try {
      range.surroundContents(span);
    } catch {
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    }
    // Reseleciona o trecho destacado.
    sel.removeAllRanges();
    const nr = document.createRange();
    nr.selectNodeContents(span);
    sel.addRange(nr);
    emit();
  }

  function toggleBold() {
    applyClass("cms-bold");
  }

  function clearFormat() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const text = range.toString();
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    sel.collapseToEnd();
    emit();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    // Enter = quebra de linha (<br>), nunca novo parágrafo/<div>.
    if (e.key === "Enter") {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const br = document.createElement("br");
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      emit();
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 px-2 py-1.5">
        {simpleHighlightClass ? (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyClass(simpleHighlightClass);
            }}
            title="Destacar trecho selecionado"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-100"
          >
            <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: "#F97316" }} />
            Destaque
          </button>
        ) : (
          STYLES.map((s) => (
            <button
              key={s.cls}
              type="button"
              // mouseDown + preventDefault: mantém a seleção ao clicar no botão.
              onMouseDown={(e) => {
                e.preventDefault();
                applyClass(s.cls);
              }}
              title={s.label}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-100"
            >
              <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: s.swatch }} />
              {s.label}
            </button>
          ))
        )}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBold();
          }}
          title="Negrito"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            clearFormat();
          }}
          title="Limpar formatação"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-100"
        >
          <Eraser className="h-3.5 w-3.5" />
          Limpar
        </button>
      </div>

      {/* área editável — usa as classes cms-* (globals.css) p/ mostrar o destaque real */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onKeyDown={onKeyDown}
        className={cn(
          "cms-rich min-h-[44px] w-full px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none",
        )}
      />
      <p className="px-3 pb-2 text-[11px] text-slate-400">
        Selecione uma palavra e clique num destaque. Enter quebra a linha.
      </p>
    </div>
  );
}
