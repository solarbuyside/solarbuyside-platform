"use client";

import * as React from "react";
import { Check, Loader2, CircleAlert, Save, Plus, Trash2, Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection } from "@/lib/landing/content-admin";
import { saveLandingSectionAction } from "./actions";

type SaveState = "idle" | "saving" | "saved" | "error";
type Card = {
  name: string;
  role: string;
  location: string;
  reviewTitle: string;
  quote: string;
  highlight: string;
  objectPosition: string;
  avatar: string;
};

function parseCards(section: LandingSection): Card[] {
  const t = section.texts;
  const img = section.images;
  const cards: Card[] = [];
  for (let i = 1; i <= 30; i++) {
    if (t[`testimonial${i}Name`] === undefined && t[`testimonial${i}Quote`] === undefined) continue;
    cards.push({
      name: t[`testimonial${i}Name`] ?? "",
      role: t[`testimonial${i}Role`] ?? "",
      location: t[`testimonial${i}Location`] ?? "",
      reviewTitle: t[`testimonial${i}ReviewTitle`] ?? "",
      quote: t[`testimonial${i}Quote`] ?? "",
      highlight: t[`testimonial${i}Highlight`] ?? "",
      objectPosition: t[`testimonial${i}ObjectPosition`] ?? "50% 50%",
      avatar: img[`testimonial${i}Avatar`] ?? "",
    });
  }
  return cards;
}

const blank: Card = { name: "", role: "", location: "", reviewTitle: "", quote: "", highlight: "", objectPosition: "50% 50%", avatar: "" };

export function TestimonialsEditor({
  section,
  onSaved,
}: {
  section: LandingSection;
  onSaved?: () => void;
}) {
  const [cards, setCards] = React.useState<Card[]>(() => {
    const c = parseCards(section);
    return c.length ? c : [{ ...blank }];
  });
  const [state, setState] = React.useState<SaveState>("idle");
  const [pending, start] = React.useTransition();

  function update(i: number, key: keyof Card, value: string) {
    setCards((cs) => cs.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  }
  function add() {
    setCards((cs) => [...cs, { ...blank }]);
  }
  function remove(i: number) {
    setCards((cs) => cs.filter((_, idx) => idx !== i));
  }

  function save() {
    setState("saving");
    start(async () => {
      try {
        // Preserva as chaves NÃO-depoimento do buyer-wave; regrava testimonial{i}* renumerados.
        const texts: Record<string, string> = {};
        for (const [k, v] of Object.entries(section.texts)) if (!/^testimonial\d+/.test(k)) texts[k] = v;
        const images: Record<string, string> = {};
        for (const [k, v] of Object.entries(section.images)) if (!/^testimonial\d+/.test(k)) images[k] = v;
        cards.forEach((c, idx) => {
          const i = idx + 1;
          texts[`testimonial${i}Name`] = c.name;
          texts[`testimonial${i}Role`] = c.role;
          texts[`testimonial${i}Location`] = c.location;
          texts[`testimonial${i}ReviewTitle`] = c.reviewTitle;
          texts[`testimonial${i}Quote`] = c.quote;
          texts[`testimonial${i}Highlight`] = c.highlight;
          texts[`testimonial${i}ObjectPosition`] = c.objectPosition;
          images[`testimonial${i}Avatar`] = c.avatar;
        });
        await saveLandingSectionAction("buyer-wave", texts, images);
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
            <Quote className="h-5 w-5 text-primary" /> Depoimentos
          </h3>
          <span className="text-[11px] text-slate-400">{cards.length} cards · seção buyer-wave</span>
        </div>
        <SaveButton state={pending ? "saving" : state} onClick={save} />
      </div>
      <div className="space-y-4 p-6">
        {cards.map((c, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Depoimento {i + 1}</span>
              <button
                onClick={() => remove(i)}
                className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Nome" value={c.name} onChange={(v) => update(i, "name", v)} />
              <Field label="Cargo/Perfil" value={c.role} onChange={(v) => update(i, "role", v)} />
              <Field label="Local" value={c.location} onChange={(v) => update(i, "location", v)} />
              <Field label="Avatar (URL)" value={c.avatar} onChange={(v) => update(i, "avatar", v)} />
              <div className="md:col-span-2">
                <Field label="Título da review" value={c.reviewTitle} onChange={(v) => update(i, "reviewTitle", v)} />
              </div>
              <div className="md:col-span-2">
                <Field label="Depoimento (quote)" value={c.quote} onChange={(v) => update(i, "quote", v)} area />
              </div>
              <div className="md:col-span-2">
                <Field label="Destaque (highlight)" value={c.highlight} onChange={(v) => update(i, "highlight", v)} area />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={add}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-bold text-primary transition-all hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" /> Adicionar depoimento
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  area,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      {area ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
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
      className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-80", map.cls)}
    >
      {map.icon}
      {map.label}
    </button>
  );
}
