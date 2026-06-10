"use client";

import * as React from "react";
import {
  Check,
  Loader2,
  CircleAlert,
  Save,
  Image as ImageIcon,
  Type,
  Link2,
  MessageCircle,
  Pencil,
  Eye,
  RotateCw,
  Monitor,
  Smartphone,
  Maximize2,
  X,
  Quote,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection, LandingGlobals } from "@/lib/landing/content-admin";
import { saveLandingSectionAction, saveLandingGlobalAction } from "./actions";
import { TestimonialsEditor } from "./testimonials-editor";

const TESTIMONIALS_VIEW = "__testimonials__";

const LP_URL = "https://solarbuyside.com.br";

// Ordem em que as seções aparecem na landing page.
const LP_ORDER = [
  "hero",
  "context",
  "video",
  "audience",
  "manual-strategic",
  "testimonials",
  "story-bridge",
  "seller-code",
  "pricing",
  "buyer-wave",
  "authority",
  "lead-magnet",
  "faq",
  "newsletter",
  "contact",
  "terms-of-use",
  "privacy-policy",
  "antipiracy",
];

// section_id -> âncora (id) na landing, para o scroll do preview.
const SECTION_ANCHOR: Record<string, string> = {
  context: "contexto",
  video: "video-section",
  audience: "audiencia",
  testimonials: "depoimentos",
  pricing: "oferta",
};

function orderOf(id: string) {
  const i = LP_ORDER.indexOf(id);
  return i === -1 ? 999 : i;
}

type SaveState = "idle" | "saving" | "saved" | "error";
type Draft = { texts: Record<string, string>; images: Record<string, string> };
type Mode = "edit" | "preview";
type Device = "default" | "mobile" | "desktop";

const GLOBAL_FIELDS: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "purchaseLink", label: "Link da venda (checkout Greenn)", icon: Link2 },
  { key: "whatsappNumber", label: "WhatsApp", icon: MessageCircle },
  { key: "logo", label: "Logo (URL)", icon: ImageIcon },
  { key: "favicon", label: "Favicon (URL)", icon: ImageIcon },
];

export function LandingEditor({
  sections: rawSections,
  globals,
}: {
  sections: LandingSection[];
  globals: LandingGlobals;
}) {
  const sections = React.useMemo(
    () => [...rawSections].sort((a, b) => orderOf(a.sectionId) - orderOf(b.sectionId)),
    [rawSections],
  );
  const buyerWave = rawSections.find((s) => s.sectionId === "buyer-wave");

  const [drafts, setDrafts] = React.useState<Record<string, Draft>>(() =>
    Object.fromEntries(sections.map((s) => [s.sectionId, { texts: { ...s.texts }, images: { ...s.images } }])),
  );
  const [selectedId, setSelectedId] = React.useState(sections[0]?.sectionId ?? "");
  const [mode, setMode] = React.useState<Mode>("edit");
  const [device, setDevice] = React.useState<Device>("default");
  const [iframeKey, setIframeKey] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const modalIframeRef = React.useRef<HTMLIFrameElement>(null);

  const selected = sections.find((s) => s.sectionId === selectedId);
  const draft = drafts[selectedId] ?? { texts: {}, images: {} };

  const [state, setState] = React.useState<SaveState>("idle");
  const [pending, start] = React.useTransition();

  // No preview, ao trocar de seção, manda o iframe rolar até a âncora.
  React.useEffect(() => {
    if (mode !== "preview") return;
    const hash = SECTION_ANCHOR[selectedId] ?? selectedId;
    const id = window.setTimeout(() => {
      const msg = { type: "scrollToSection", hash };
      iframeRef.current?.contentWindow?.postMessage(msg, "*");
      modalIframeRef.current?.contentWindow?.postMessage(msg, "*");
    }, 400);
    return () => window.clearTimeout(id);
  }, [mode, selectedId, iframeKey, device]);

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

  // No buyer-wave, os campos testimonial* são editados na aba "Depoimentos".
  const hideTestimonial = selectedId === "buyer-wave";
  const textKeys = Object.keys(draft.texts).filter((k) => !(hideTestimonial && /^testimonial\d+/.test(k)));
  const imageKeys = Object.keys(draft.images).filter((k) => !(hideTestimonial && /^testimonial\d+/.test(k)));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ESQUERDA — globais + lista de seções (ordem da LP) */}
      <div className="space-y-4 lg:col-span-1">
        <GlobalsCard globals={globals} />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-800">
            Seções ({sections.length})
          </div>
          <div className="max-h-[460px] overflow-y-auto p-2">
            {buyerWave && (
              <button
                onClick={() => setSelectedId(TESTIMONIALS_VIEW)}
                className={cn(
                  "mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  selectedId === TESTIMONIALS_VIEW ? "bg-primary/10 font-bold text-primary" : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <Quote className="h-3.5 w-3.5 shrink-0" />
                Depoimentos (cards)
              </button>
            )}
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
                  <span className="ml-2 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DIREITA — editor / preview / depoimentos */}
      <div className="lg:col-span-2">
        {selectedId === TESTIMONIALS_VIEW && buyerWave ? (
          <TestimonialsEditor section={buyerWave} />
        ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900">{selected?.name || selectedId}</h3>
              <span className="font-mono text-[11px] text-slate-400">{selectedId}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <ToggleBtn active={mode === "edit"} onClick={() => setMode("edit")} icon={Pencil} label="Editar" />
                <ToggleBtn active={mode === "preview"} onClick={() => setMode("preview")} icon={Eye} label="Preview" />
              </div>
              {mode === "preview" ? (
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:border-primary/40 hover:text-primary"
                  title="Recarregar preview (para ver alterações salvas)"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  Recarregar
                </button>
              ) : (
                <SaveButton state={pending ? "saving" : state} onClick={saveSection} />
              )}
            </div>
          </div>

          {mode === "preview" ? (
            <div className="p-3">
              {/* seletor de dispositivo */}
              <div className="mb-3 flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <DeviceBtn active={device === "default"} onClick={() => setDevice("default")} icon={Monitor} label="Padrão" />
                  <DeviceBtn active={device === "mobile"} onClick={() => setDevice("mobile")} icon={Smartphone} label="Celular" />
                  <DeviceBtn active={device === "desktop"} onClick={() => setDevice("desktop")} icon={Maximize2} label="Desktop (tela cheia)" />
                </div>
              </div>
              <div className={device === "mobile" ? "mx-auto w-[390px]" : "w-full"}>
                <iframe
                  key={`inline-${iframeKey}`}
                  ref={iframeRef}
                  src={LP_URL}
                  title="Preview da landing"
                  className={cn("rounded-lg border border-slate-200", device === "mobile" ? "h-[78vh] w-[390px]" : "h-[70vh] w-full")}
                />
              </div>
              <p className="px-2 pt-2 text-[11px] text-slate-400">
                Após salvar, clique em “Recarregar” para ver as alterações na preview.
              </p>

              {/* modal desktop (tela cheia) */}
              {device === "desktop" && (
                <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Preview — Desktop</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIframeKey((k) => k + 1)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold text-white hover:bg-white/20"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        Recarregar
                      </button>
                      <button
                        onClick={() => setDevice("default")}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-slate-800 hover:bg-slate-100"
                      >
                        <X className="h-3.5 w-3.5" />
                        Fechar
                      </button>
                    </div>
                  </div>
                  <iframe
                    key={`modal-${iframeKey}`}
                    ref={modalIframeRef}
                    src={LP_URL}
                    title="Preview desktop"
                    className="w-full flex-1 rounded-lg border border-white/20 bg-white"
                  />
                </div>
              )}
            </div>
          ) : (
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
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all",
        active ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function DeviceBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all",
        active ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
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
