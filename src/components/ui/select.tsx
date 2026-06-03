"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

export interface SelectProps {
  value: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** aria-label / title when there is no visible <label> wrapping it. */
  ariaLabel?: string;
}

/**
 * Custom select (dropdown) — substitui o `<select>` nativo por um menu
 * estilizado seguindo os tokens do design.md (input claro, borda slate-200,
 * foco laranja, item ativo em laranja translúcido). Acessível por teclado.
 */
export function Select({
  value,
  options,
  onValueChange,
  placeholder = "—",
  disabled,
  className,
  ariaLabel,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  const selected = options.find((o) => o.value === value) ?? null;

  // Fecha ao clicar fora.
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Abre o menu posicionando o destaque no item selecionado.
  function openMenu() {
    if (disabled) return;
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function commit(idx: number) {
    const opt = options[idx];
    if (opt) {
      onValueChange(opt.value);
      setOpen(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 text-sm shadow-sm outline-none transition-all",
          "hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-primary ring-2 ring-primary/15",
        )}
      >
        <span className={cn("truncate", selected ? "text-slate-800" : "text-slate-400")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === activeIndex;
            return (
              <button
                key={opt.value || `__empty_${idx}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => commit(idx)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-slate-700",
                  isSelected && !isActive && "text-primary",
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
