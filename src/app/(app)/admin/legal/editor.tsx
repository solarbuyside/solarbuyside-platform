"use client";

import * as React from "react";
import { Check, Loader2, CircleAlert, Save, Plus, Trash2, ChevronUp, ChevronDown, Heading, Pilcrow } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LegalDocDb, LegalBlockDb } from "@/lib/legal/admin";
import { saveLegalDocAction } from "./actions";

type SaveState = "idle" | "saving" | "saved" | "error";
const SCOPE_LABEL: Record<string, string> = { landing: "Landing Page", platform: "Plataforma" };

export function LegalEditor({ docs }: { docs: LegalDocDb[] }) {
  const [selected, setSelected] = React.useState(docs[0] ? `${docs[0].scope}/${docs[0].slug}` : "");
  const [drafts, setDrafts] = React.useState<Record<string, { title: string; blocks: LegalBlockDb[] }>>(() =>
    Object.fromEntries(docs.map((d) => [`${d.scope}/${d.slug}`, { title: d.title ?? "", blocks: [...d.blocks] }])),
  );
  const [state, setState] = React.useState<SaveState>("idle");
  const [pending, start] = React.useTransition();

  const doc = docs.find((d) => `${d.scope}/${d.slug}` === selected);
  const draft = drafts[selected] ?? { title: "", blocks: [] };

  const setDraft = (fn: (d: { title: string; blocks: LegalBlockDb[] }) => { title: string; blocks: LegalBlockDb[] }) =>
    setDrafts((all) => ({ ...all, [selected]: fn(all[selected]) }));

  function updateBlock(i: number, patch: Partial<LegalBlockDb>) {
    setDraft((d) => ({ ...d, blocks: d.blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }));
  }
  function addBlock(type: "heading" | "p") {
    setDraft((d) => ({ ...d, blocks: [...d.blocks, { type, text: "" }] }));
  }
  function removeBlock(i: number) {
    setDraft((d) => ({ ...d, blocks: d.blocks.filter((_, idx) => idx !== i) }));
  }
  function move(i: number, dir: -1 | 1) {
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.blocks.length) return d;
      const b = [...d.blocks];
      [b[i], b[j]] = [b[j], b[i]];
      return { ...d, blocks: b };
    });
  }
  function save() {
    if (!doc) return;
    setState("saving");
    start(async () => {
      try {
        await saveLegalDocAction(doc.scope, doc.slug, draft.title, draft.blocks);
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  const grouped = React.useMemo(() => {
    const m: Record<string, LegalDocDb[]> = {};
    for (const d of docs) (m[d.scope] ??= []).push(d);
    return m;
  }, [docs]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* lista de docs */}
      <div className="space-y-4 lg:col-span-1">
        {Object.entries(grouped).map(([scope, list]) => (
          <div key={scope} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-800">
              {SCOPE_LABEL[scope] ?? scope}
            </div>
            <div className="p-2">
              {list.map((d) => {
                const id = `${d.scope}/${d.slug}`;
                return (
                  <button
                    key={id}
                    onClick={() => setSelected(id)}
                    className={cn(
                      "block w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      selected === id ? "bg-primary/10 font-bold text-primary" : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {d.title || d.slug}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* editor de blocos */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div className="min-w-0 flex-1">
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="w-full rounded-lg border border-transparent bg-transparent text-lg font-bold text-slate-900 outline-none hover:border-slate-200 focus:border-primary focus:px-2"
              />
              <span className="font-mono text-[11px] text-slate-400">{selected}</span>
            </div>
            <SaveButton state={pending ? "saving" : state} onClick={save} />
          </div>
          <div className="space-y-3 p-6">
            {draft.blocks.map((b, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
                    <TypeBtn active={b.type === "heading"} onClick={() => updateBlock(i, { type: "heading" })} icon={Heading} label="Título" />
                    <TypeBtn active={b.type === "p"} onClick={() => updateBlock(i, { type: "p" })} icon={Pilcrow} label="Parágrafo" />
                  </div>
                  <div className="flex items-center gap-1">
                    <IconBtn onClick={() => move(i, -1)} icon={ChevronUp} />
                    <IconBtn onClick={() => move(i, 1)} icon={ChevronDown} />
                    <IconBtn onClick={() => removeBlock(i)} icon={Trash2} danger />
                  </div>
                </div>
                <textarea
                  value={b.text}
                  onChange={(e) => updateBlock(i, { text: e.target.value })}
                  rows={b.type === "heading" ? 1 : 3}
                  className={cn(
                    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15",
                    b.type === "heading" ? "font-bold text-slate-900" : "text-slate-700",
                  )}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => addBlock("heading")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-primary/40 hover:text-primary">
                <Plus className="h-3.5 w-3.5" /> Título
              </button>
              <button onClick={() => addBlock("p")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-primary/40 hover:text-primary">
                <Plus className="h-3.5 w-3.5" /> Parágrafo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold transition-all", active ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-600")}>
      <Icon className="h-3 w-3" /> {label}
    </button>
  );
}
function IconBtn({ onClick, icon: Icon, danger }: { onClick: () => void; icon: React.ComponentType<{ className?: string }>; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-colors", danger ? "text-slate-400 hover:bg-destructive/10 hover:text-destructive" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700")}>
      <Icon className="h-3.5 w-3.5" />
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
    <button onClick={onClick} disabled={state === "saving"} className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-4 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-80", map.cls)}>
      {map.icon}
      {map.label}
    </button>
  );
}
