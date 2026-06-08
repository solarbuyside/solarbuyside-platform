"use client";

import * as React from "react";
import { Check, Loader2, CircleAlert, Save, Image as ImageIcon, Type, Link2, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection, LandingGlobals } from "@/lib/landing/content-admin";
import { saveLandingSectionAction, saveLandingGlobalAction } from "./actions";

type SaveState = "idle" | "saving" | "saved" | "error";
type Draft = { texts: Record<string, string>; images: Record<string, string> };

const GLOBAL_FIELDS: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "purchaseLink", label: "Link da venda (checkout Greenn)", icon: Link2 },
  { key: "whatsappNumber", label: "WhatsApp", icon: MessageCircle },
  { key: "logo", label: "Logo (URL)", icon: ImageIcon },
  { key: "favicon", label: "Favicon (URL)", icon: ImageIcon },
];

export function LandingEditor({
  sections,
  globals,
}: {
  sections: LandingSection[];
  globals: LandingGlobals;
}) {
  const [drafts, setDrafts] = React.useState<Record<string, Draft>>(() =>
    Object.fromEntries(sections.map((s) => [s.sectionId, { texts: { ...s.texts }, images: { ...s.images } }])),
  );
  const [selectedId, setSelectedId] = React.useState(sections[0]?.sectionId ?? "");
  const selected = sections.find((s) => s.sectionId === selectedId);
  const draft = drafts[selectedId] ?? { texts: {}, images: {} };

  const [state, setState] = React.useState<SaveState>("idle");
  const [pending, start] = React.useTransition();

  function setText(k: string, v: string) {
    setDrafts((d) => ({ ...d, [selectedId]: { ...d[selectedId], texts: { ...d[selectedId].texts, [k]: v } } }));
  }
  function setImage(k: string, v: string) {
    setDrafts((d) => ({ ...d, [selectedId]: { ...d[selectedId], images: { ...d[selectedId].images, [k]: v } } }));
  }
  function saveSection() {
    setState("saving");
    start(async () => {
      try {
        await saveLandingSectionAction(selectedId, draft.texts, draft.images);
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  const textKeys = Object.keys(draft.texts);
  const imageKeys = Object.keys(draft.images);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ESQUERDA — globais + lista de seções */}
      <div className="space-y-4 lg:col-span-1">
        <GlobalsCard globals={globals} />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-800">
            Seções ({sections.length})
          </div>
          <div className="max-h-[460px] overflow-y-auto p-2">
            {sections.map((s) => {
              const count = Object.keys(drafts[s.sectionId]?.texts ?? {}).length;
              const active = s.sectionId === selectedId;
              return (
                <button
                  key={s.sectionId}
                  onClick={() => setSelectedId(s.sectionId)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    active ? "bg-primary/10 font-bold text-primary" : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span className="truncate">{s.name || s.sectionId}</span>
                  <span className={cn("ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", count ? "bg-slate-100 text-slate-500" : "bg-slate-100 text-slate-300")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DIREITA — edição da seção selecionada */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{selected?.name || selectedId}</h3>
              <span className="font-mono text-[11px] text-slate-400">{selectedId}</span>
            </div>
            <SaveButton state={pending ? "saving" : state} onClick={saveSection} />
          </div>
          <div className="space-y-6 p-6">
            {textKeys.length === 0 && imageKeys.length === 0 && (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-400">
                Sem campos editáveis nesta seção (o texto é fixo no código da landing).
              </p>
            )}
            {textKeys.length > 0 && (
              <div className="space-y-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Type className="h-3.5 w-3.5" /> Textos
                </p>
                {textKeys.map((k) => (
                  <label key={k} className="grid gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-slate-500">{k}</span>
                    <textarea
                      value={draft.texts[k] ?? ""}
                      onChange={(e) => setText(k, e.target.value)}
                      rows={(draft.texts[k]?.length ?? 0) > 90 ? 3 : 1}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                ))}
              </div>
            )}
            {imageKeys.length > 0 && (
              <div className="space-y-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <ImageIcon className="h-3.5 w-3.5" /> Imagens (URL)
                </p>
                {imageKeys.map((k) => (
                  <label key={k} className="grid gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-slate-500">{k}</span>
                    <input
                      value={draft.images[k] ?? ""}
                      onChange={(e) => setImage(k, e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
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
        for (const { key } of GLOBAL_FIELDS) await saveLandingGlobalAction(key, values[key] ?? "");
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">Configurações globais</h2>
        <SaveButton state={pending ? "saving" : state} onClick={save} />
      </div>
      <div className="space-y-3">
        {GLOBAL_FIELDS.map(({ key, label, icon: Icon }) => (
          <label key={key} className="grid gap-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
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
