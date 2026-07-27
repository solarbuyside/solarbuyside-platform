"use client";

import * as React from "react";
import {
  Check,
  Loader2,
  CircleAlert,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection } from "@/lib/landing/content-admin";
import { saveLandingSectionAction } from "./actions";
import { RichTextEditor } from "./rich-text";

/**
 * Editor de blocos repetíveis com chave numerada (`faq1Question`, `codeTop1`…).
 *
 * Resolve a classe de problema que travava o cliente: a landing lia um número
 * FIXO de itens e o manifesto expunha cada um como campo solto, então não havia
 * como adicionar uma pergunta no FAQ nem quebrar um parágrafo em dois — pedidos
 * do Francis em 27/07. Aqui ele adiciona, remove e reordena.
 *
 * Grava renumerando do zero e zerando as sobras até `max`. String vazia (e não
 * chave ausente) é o que de fato apaga: a landing usa o ContentData versionado
 * como base e o banco por cima, então chave AUSENTE faz o texto antigo do
 * código reaparecer na página.
 */

type SaveState = "idle" | "saving" | "saved" | "error";

/** Um campo dentro de cada item da lista. */
export type ListField = {
  /** Sufixo da chave: `faq{N}Question` -> "Question". Vazio = `codeTop{N}`. */
  suffix: string;
  label: string;
  /** `rich` usa o editor com destaque de marca (só onde a LP renderiza HTML). */
  kind?: "text" | "area" | "rich";
  placeholder?: string;
};

export type ListGroup = {
  /** Prefixo da chave: "faq", "codeTop", "codeBottom". */
  prefix: string;
  /** Título do bloco no editor. */
  label: string;
  help?: string;
  /** Rótulo de cada item ("Pergunta", "Parágrafo"). */
  itemLabel: string;
  fields: ListField[];
  max: number;
  /**
   * Chaves antigas que alimentavam as primeiras posições deste grupo. Na
   * primeira abertura, servem de conteúdo inicial — sem isso o editor viria
   * vazio e o primeiro salvamento apagaria o que está publicado.
   */
  legacyKeys?: string[];
};

type Item = Record<string, string>;

function parseGroup(section: LandingSection, g: ListGroup): Item[] {
  const t = section.texts;
  const itens: Item[] = [];
  for (let i = 1; i <= g.max; i++) {
    const item: Item = {};
    let temConteudo = false;
    for (const f of g.fields) {
      const novo = t[`${g.prefix}${i}${f.suffix}`];
      const legado = g.legacyKeys?.[i - 1] ? t[g.legacyKeys[i - 1]] : undefined;
      const valor = novo ?? legado ?? "";
      item[f.suffix] = valor;
      if (valor.trim()) temConteudo = true;
    }
    if (!temConteudo) continue;
    itens.push(item);
  }
  return itens;
}

export function ListEditor({
  section,
  groups,
  title,
  icon: Icon,
  onSaved,
}: {
  section: LandingSection;
  groups: ListGroup[];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onSaved?: () => void;
}) {
  const [dados, setDados] = React.useState<Record<string, Item[]>>(() =>
    Object.fromEntries(groups.map((g) => [g.prefix, parseGroup(section, g)])),
  );
  const [state, setState] = React.useState<SaveState>("idle");
  const [, start] = React.useTransition();
  const [arrastando, setArrastando] = React.useState<string | null>(null);

  const setItens = (prefix: string, fn: (itens: Item[]) => Item[]) =>
    setDados((d) => ({ ...d, [prefix]: fn(d[prefix]) }));

  const update = (prefix: string, i: number, suffix: string, valor: string) =>
    setItens(prefix, (itens) => itens.map((x, idx) => (idx === i ? { ...x, [suffix]: valor } : x)));

  const add = (g: ListGroup) =>
    setItens(g.prefix, (itens) => [
      ...itens,
      Object.fromEntries(g.fields.map((f) => [f.suffix, ""])),
    ]);

  const remove = (prefix: string, i: number) =>
    setItens(prefix, (itens) => itens.filter((_, idx) => idx !== i));

  const mover = (prefix: string, de: number, para: number) =>
    setItens(prefix, (itens) => {
      if (para < 0 || para >= itens.length || de === para) return itens;
      const copy = [...itens];
      const [x] = copy.splice(de, 1);
      copy.splice(para, 0, x);
      return copy;
    });

  function save() {
    setState("saving");
    start(async () => {
      try {
        const texts: Record<string, string> = { ...section.texts };
        for (const g of groups) {
          const itens = dados[g.prefix].filter((x) => g.fields.some((f) => x[f.suffix].trim()));
          itens.forEach((x, idx) => {
            for (const f of g.fields) texts[`${g.prefix}${idx + 1}${f.suffix}`] = x[f.suffix].trim();
          });
          for (let i = itens.length + 1; i <= g.max; i++) {
            for (const f of g.fields) texts[`${g.prefix}${i}${f.suffix}`] = "";
          }
          // As chaves antigas viraram fallback na landing. Depois de gravar as
          // novas, precisam sair de cena — senão voltariam a mandar no render.
          for (const k of g.legacyKeys ?? []) if (k in texts) texts[k] = "";
        }
        await saveLandingSectionAction(section.sectionId, texts, section.images);
        onSaved?.();
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  const total = groups.reduce((n, g) => n + dados[g.prefix].length, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{title}</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {total} {total === 1 ? "item" : "itens"}. Arraste pela alça{" "}
            <GripVertical className="inline h-3 w-3 -translate-y-px" /> para reordenar.
          </p>
        </div>
        <SaveButton state={state} onClick={save} />
      </div>

      <div className="space-y-8 p-6">
        {groups.map((g) => (
          <div key={g.prefix} className="space-y-3">
            {groups.length > 1 && (
              <div className="border-b border-slate-100 pb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{g.label}</p>
                {g.help && <p className="mt-1 text-[11px] leading-snug text-slate-400">{g.help}</p>}
              </div>
            )}

            {dados[g.prefix].length === 0 && (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-400">
                Nada aqui ainda. Use o botão abaixo.
              </p>
            )}

            {dados[g.prefix].map((item, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => setArrastando(`${g.prefix}:${i}`)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={() => setArrastando(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const [pfx, de] = (arrastando ?? "").split(":");
                  if (pfx === g.prefix) mover(g.prefix, Number(de), i);
                  setArrastando(null);
                }}
                className={cn(
                  "rounded-xl border border-slate-200 p-4 transition-opacity",
                  arrastando === `${g.prefix}:${i}` && "opacity-40",
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <GripVertical className="h-4 w-4 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing" />
                    {g.itemLabel} {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconBtn label="Subir" onClick={() => mover(g.prefix, i, i - 1)} disabled={i === 0}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      label="Descer"
                      onClick={() => mover(g.prefix, i, i + 1)}
                      disabled={i === dados[g.prefix].length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconBtn>
                    <button
                      onClick={() => remove(g.prefix, i)}
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {g.fields.map((f) => (
                    <label key={f.suffix} className="grid gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">{f.label}</span>
                      {f.kind === "rich" ? (
                        <RichTextEditor
                          value={item[f.suffix]}
                          onChange={(v) => update(g.prefix, i, f.suffix, v)}
                        />
                      ) : f.kind === "area" ? (
                        <textarea
                          value={item[f.suffix]}
                          onChange={(e) => update(g.prefix, i, f.suffix, e.target.value)}
                          rows={4}
                          placeholder={f.placeholder}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      ) : (
                        <input
                          value={item[f.suffix]}
                          onChange={(e) => update(g.prefix, i, f.suffix, e.target.value)}
                          placeholder={f.placeholder}
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <button
                onClick={() => add(g)}
                disabled={dados[g.prefix].length >= g.max}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-bold text-primary transition-all hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <Plus className="h-4 w-4" />
                Adicionar {g.itemLabel.toLowerCase()}
              </button>
              {dados[g.prefix].length >= g.max && (
                <span className="text-[11px] text-slate-500">Limite de {g.max}.</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
  const map = {
    idle: { icon: <Save className="h-3.5 w-3.5" />, label: "Salvar", cls: "bg-primary text-white hover:bg-primary/95" },
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: "Salvando…", cls: "bg-primary/70 text-white" },
    saved: { icon: <Check className="h-3.5 w-3.5" />, label: "Salvo", cls: "bg-emerald-500 text-white" },
    error: { icon: <CircleAlert className="h-3.5 w-3.5" />, label: "Erro", cls: "bg-destructive text-white" },
  }[state];
  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-4 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-80",
        map.cls,
      )}
    >
      {map.icon}
      {map.label}
    </button>
  );
}
