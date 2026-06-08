"use client";

import * as React from "react";
import { Check, Loader2, CircleAlert, ChevronDown, Save } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection, LandingGlobals } from "@/lib/landing/content-admin";
import { saveLandingSectionAction, saveLandingGlobalAction } from "./actions";

type SaveState = "idle" | "saving" | "saved" | "error";

const GLOBAL_FIELDS: { key: string; label: string }[] = [
  { key: "purchaseLink", label: "Link de checkout (Greenn)" },
  { key: "whatsappNumber", label: "WhatsApp" },
  { key: "logo", label: "Logo (URL)" },
  { key: "favicon", label: "Favicon (URL)" },
];

export function LandingEditor({
  sections,
  globals,
}: {
  sections: LandingSection[];
  globals: LandingGlobals;
}) {
  return (
    <div className="space-y-6">
      <GlobalsCard globals={globals} />
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
          Seções ({sections.length})
        </h3>
        <div className="space-y-3">
          {sections.map((s) => (
            <SectionCard key={s.sectionId} section={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GlobalsCard({ globals }: { globals: LandingGlobals }) {
  const [values, setValues] = React.useState<Record<string, string>>(() => ({ ...globals }));
  const [state, setState] = React.useState<SaveState>("idle");
  const [pending, start] = React.useTransition();

  function save() {
    setState("saving");
    start(async () => {
      try {
        for (const { key } of GLOBAL_FIELDS) {
          await saveLandingGlobalAction(key, values[key] ?? "");
        }
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Configurações globais</h3>
        <SaveButton state={pending ? "saving" : state} onClick={save} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {GLOBAL_FIELDS.map(({ key, label }) => (
          <label key={key} className="grid gap-1.5">
            <span className="text-xs font-semibold text-slate-600">{label}</span>
            <input
              value={values[key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: LandingSection }) {
  const keys = React.useMemo(() => Object.keys(section.texts), [section.texts]);
  const [texts, setTexts] = React.useState<Record<string, string>>(() => ({ ...section.texts }));
  const [state, setState] = React.useState<SaveState>("idle");
  const [pending, start] = React.useTransition();

  function save() {
    setState("saving");
    start(async () => {
      try {
        await saveLandingSectionAction(section.sectionId, texts);
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  return (
    <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5">
        <span className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
          <span className="text-sm font-bold text-slate-800">{section.name || section.sectionId}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {keys.length} campos
          </span>
        </span>
        <span className="text-[10px] font-mono text-slate-400">{section.sectionId}</span>
      </summary>
      <div className="space-y-4 border-t border-slate-100 px-5 py-4">
        {keys.length === 0 && <p className="text-xs text-slate-400">Sem textos editáveis.</p>}
        {keys.map((k) => (
          <label key={k} className="grid gap-1.5">
            <span className="font-mono text-[11px] font-semibold text-slate-500">{k}</span>
            <textarea
              value={texts[k] ?? ""}
              onChange={(e) => setTexts((t) => ({ ...t, [k]: e.target.value }))}
              rows={(texts[k]?.length ?? 0) > 90 ? 3 : 1}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        ))}
        <div className="flex justify-end pt-1">
          <SaveButton state={pending ? "saving" : state} onClick={save} />
        </div>
      </div>
    </details>
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
