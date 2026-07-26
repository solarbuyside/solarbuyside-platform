"use client";

import * as React from "react";
import { Check, Loader2, CircleAlert, Save, Plus, Trash2, ArrowUp, ArrowDown, Images } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection } from "@/lib/landing/content-admin";
import { MAX_LOGOS } from "@/lib/landing/field-schema";
import { saveLandingSectionAction } from "./actions";

/**
 * Editor dos logos de "Apoiadores institucionais" (Francis, revisão 22-23/07).
 *
 * Cada logo tem imagem, nome, categoria e o texto do card que abre no hover.
 * Grava como logo{i}Src (images) + logo{i}Name/Cat/Desc (texts), renumerando
 * do zero a cada salvamento — mesma mecânica do editor de depoimentos.
 *
 * A ORDEM importa: a landing monta as categorias na ordem em que aparecem
 * nesta lista, então subir/descer um logo também reordena os grupos.
 */

type SaveState = "idle" | "saving" | "saved" | "error";
type Logo = { src: string; name: string; cat: string; desc: string; url: string };

const blank: Logo = { src: "", name: "", cat: "", desc: "", url: "" };

function parseLogos(section: LandingSection): Logo[] {
  const t = section.texts;
  const img = section.images;
  const logos: Logo[] = [];
  for (let i = 1; i <= MAX_LOGOS; i++) {
    if (img[`logo${i}Src`] === undefined && t[`logo${i}Name`] === undefined) continue;
    logos.push({
      src: img[`logo${i}Src`] ?? "",
      name: t[`logo${i}Name`] ?? "",
      cat: t[`logo${i}Cat`] ?? "",
      desc: t[`logo${i}Desc`] ?? "",
      url: t[`logo${i}Url`] ?? "",
    });
  }
  return logos;
}

export function LogosEditor({ section, onSaved }: { section: LandingSection; onSaved?: () => void }) {
  const [logos, setLogos] = React.useState<Logo[]>(() => {
    const l = parseLogos(section);
    return l.length ? l : [{ ...blank }];
  });
  const [state, setState] = React.useState<SaveState>("idle");
  const [, start] = React.useTransition();

  // Categorias já usadas viram sugestão, pra ele não digitar variações
  // ("Fabricantes" vs "Fabricante") que quebrariam o agrupamento.
  const categorias = React.useMemo(
    () => Array.from(new Set(logos.map((l) => l.cat.trim()).filter(Boolean))),
    [logos],
  );

  const update = (i: number, key: keyof Logo, value: string) =>
    setLogos((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));
  const add = () => setLogos((ls) => [...ls, { ...blank }]);
  const remove = (i: number) => setLogos((ls) => ls.filter((_, idx) => idx !== i));
  const move = (i: number, delta: number) =>
    setLogos((ls) => {
      const j = i + delta;
      if (j < 0 || j >= ls.length) return ls;
      const copy = [...ls];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  function save() {
    setState("saving");
    start(async () => {
      try {
        // Preserva as chaves que não são de logo e regrava logo{i}* renumerados.
        const texts: Record<string, string> = {};
        for (const [k, v] of Object.entries(section.texts)) if (!/^logo\d+/.test(k)) texts[k] = v;
        const images: Record<string, string> = {};
        for (const [k, v] of Object.entries(section.images)) if (!/^logo\d+/.test(k)) images[k] = v;
        logos
          .filter((l) => l.src.trim() || l.name.trim())
          .forEach((l, idx) => {
            const i = idx + 1;
            images[`logo${i}Src`] = l.src.trim();
            texts[`logo${i}Name`] = l.name.trim();
            texts[`logo${i}Cat`] = l.cat.trim();
            texts[`logo${i}Desc`] = l.desc.trim();
            texts[`logo${i}Url`] = l.url.trim();
          });

        // Zera as posições que sobraram. Apagar a chave não basta: a landing
        // usa o ContentData versionado como base e o banco por cima, então uma
        // posição AUSENTE no banco faz o logo antigo do código reaparecer na
        // página (foi o que duplicou a Stäubli em 26/07). String vazia
        // sobrescreve de verdade e o hook ignora item sem imagem.
        const usados = logos.filter((l) => l.src.trim() || l.name.trim()).length;
        for (let i = usados + 1; i <= MAX_LOGOS; i++) {
          images[`logo${i}Src`] = "";
          texts[`logo${i}Name`] = "";
          texts[`logo${i}Cat`] = "";
          texts[`logo${i}Desc`] = "";
          texts[`logo${i}Url`] = "";
        }

        await saveLandingSectionAction("apoiadores", texts, images);
        onSaved?.();
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Images className="h-4 w-4 text-primary" />
            Logos dos apoiadores
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {logos.length} logo(s). A ordem define a ordem das categorias na página.
          </p>
        </div>
        <SaveButton state={state} onClick={save} />
      </div>

      <datalist id="categorias-apoiadores">
        {categorias.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="space-y-4 p-6">
        {logos.map((logo, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Logo {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <IconBtn label="Subir" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn label="Descer" onClick={() => move(i, 1)} disabled={i === logos.length - 1}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </IconBtn>
                <button
                  onClick={() => remove(i)}
                  className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[110px_1fr]">
              <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
                {logo.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo.src} alt="" className="max-h-14 w-auto object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-400">sem imagem</span>
                )}
              </div>
              <div className="grid gap-3">
                <Field
                  label="Imagem (caminho)"
                  value={logo.src}
                  onChange={(v) => update(i, "src", v)}
                  placeholder="/assets/apoiadores/nome-da-marca.png"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nome da empresa" value={logo.name} onChange={(v) => update(i, "name", v)} />
                  <Field
                    label="Categoria"
                    value={logo.cat}
                    onChange={(v) => update(i, "cat", v)}
                    list="categorias-apoiadores"
                    placeholder="Ex.: Fabricantes"
                  />
                </div>
                <Field
                  label="Texto do card (aparece ao passar o mouse)"
                  value={logo.desc}
                  onChange={(v) => update(i, "desc", v)}
                  area
                />
                <Field
                  label="Link do site (opcional)"
                  value={logo.url}
                  onChange={(v) => update(i, "url", v)}
                  placeholder="https://exemplo.com.br"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={add}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-bold text-primary transition-all hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" />
          Adicionar logo
        </button>
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

function Field({
  label,
  value,
  onChange,
  area,
  placeholder,
  list,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
  placeholder?: string;
  list?: string;
}) {
  const cls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15";
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      {area ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className={cn(cls, "py-2")}
        />
      ) : (
        <input
          value={value}
          list={list}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(cls, "h-10")}
        />
      )}
    </label>
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
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-80",
        map.cls,
      )}
    >
      {map.icon}
      {map.label}
    </button>
  );
}
