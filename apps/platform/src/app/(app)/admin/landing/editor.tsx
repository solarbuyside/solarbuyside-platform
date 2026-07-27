"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  Rocket,
  Archive,
  ChevronDown,
  GalleryHorizontalEnd,
  Tag,
  ListOrdered,
  Pilcrow,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection, LandingGlobals } from "@/lib/landing/content-admin";
import {
  buildSectionGroups,
  isComposite,
  composeComposite,
  decomposeComposite,
  type FieldDef,
  type CompositeFieldDef,
} from "@/lib/landing/field-schema";
import { saveLandingSectionAction, saveLandingGlobalAction, publishLandingAction } from "./actions";
import { TestimonialsEditor } from "./testimonials-editor";
import { LogosEditor, categoriasDe, type LogosView } from "./logos-editor";
import { RichTextEditor } from "./rich-text";
import { ImageField } from "./image-field";
import { ListEditor, type ListGroup } from "./list-editor";

const TESTIMONIALS_VIEW = "__testimonials__";
/** Logos: "__logos__" = todos; "__logos__:<categoria>" = uma categoria. */
const LOGOS_VIEW = "__logos__";
const LOGOS_CAT_PREFIX = "__logos__:";
/** Escolha de quem sobe para a faixa do topo (vive junto do Hero na lista). */
const BAND_VIEW = "__faixa__";
/** Blocos repetíveis com editor próprio (adicionar/remover/reordenar). */
const FAQ_VIEW = "__faq__";
const CODE_PARAGRAFOS_VIEW = "__code-paragrafos__";

// A LP oficial é o v4 "Solar Dawn" e hoje vive na RAIZ. (/v4 ainda cai no mesmo
// render por causa do default do roteador, mas apontar pra raiz é o correto.)
const LP_URL = "https://solarbuyside.com.br/";

// section_id -> âncora (id) na landing, para o scroll do preview.
// Espelha os `<div id="...">` de apps/landing/src/v4/AppV4.tsx.
const SECTION_ANCHOR: Record<string, string> = {
  hero: "hero",
  authority: "authority",
  context: "contexto",
  // O vídeo é renderizado DENTRO do Panorama (ContextV4), não tem âncora própria.
  video: "contexto",
  "testimonial-lucas": "depoimento-lucas",
  transformacao: "transformacao",
  audience: "audiencia",
  "manual-strategic": "manual-strategic",
  testimonials: "depoimentos",
  plataforma: "plataforma",
  apoiadores: "apoiadores",
  pricing: "oferta",
  faq: "faq",
};

// Nas seções buyer-wave os campos testimonial* são editados na aba "Depoimentos".
const isTestimonialKey = (k: string) => /^testimonial\d+/.test(k);

type SaveState = "idle" | "saving" | "saved" | "error";
type Draft = { texts: Record<string, string>; images: Record<string, string> };
type Mode = "edit" | "preview";
type Device = "default" | "mobile" | "desktop";

const GLOBAL_FIELDS: {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: boolean;
}[] = [
  { key: "purchaseLink", label: "Link da venda (checkout Greenn)", icon: Link2 },
  { key: "whatsappNumber", label: "WhatsApp", icon: MessageCircle },
  { key: "logo", label: "Logo", icon: ImageIcon, image: true },
  { key: "favicon", label: "Favicon (ícone da aba)", icon: ImageIcon, image: true },
];

/** FAQ: um par pergunta/resposta por item. Teto espelha MAX_FAQ na landing. */
const FAQ_GROUPS: ListGroup[] = [
  {
    prefix: "faq",
    label: "Perguntas",
    itemLabel: "Pergunta",
    max: 20,
    fields: [
      { suffix: "Question", label: "Pergunta", kind: "text" },
      { suffix: "Answer", label: "Resposta", kind: "area" },
    ],
  },
];

/**
 * Parágrafos do bloco "Código do Vendedor", em dois grupos: a lista "O que você
 * leva" fica ENTRE eles, então não dá para ser uma lista só.
 * `legacyKeys` traz o texto publicado hoje (codeDesc1-4) na primeira abertura.
 */
const CODE_GROUPS: ListGroup[] = [
  {
    prefix: "codeTop",
    label: "Antes da lista “O que você leva”",
    itemLabel: "Parágrafo",
    max: 8,
    legacyKeys: ["codeDesc1", "codeDesc2"],
    fields: [{ suffix: "", label: "Texto", kind: "rich" }],
  },
  {
    prefix: "codeBottom",
    label: "Depois da lista",
    itemLabel: "Parágrafo",
    max: 8,
    legacyKeys: ["codeDesc3", "codeDesc4"],
    fields: [{ suffix: "", label: "Texto", kind: "rich" }],
  },
];

export function LandingEditor({
  sections: rawSections,
  globals,
  globalsPending,
}: {
  sections: LandingSection[];
  globals: LandingGlobals;
  globalsPending: boolean;
}) {
  const router = useRouter();
  // Metadados (rótulo humano + ordem na LP) por seção, vindos do manifesto.
  const meta = React.useMemo(() => {
    const map = new Map<string, { label: string; order: number; mapped: boolean; onlyOnV1: boolean }>();
    for (const s of rawSections) {
      const b = buildSectionGroups(s.sectionId, Object.keys(s.texts), Object.keys(s.images));
      map.set(s.sectionId, { label: b.label, order: b.order, mapped: b.mapped, onlyOnV1: b.onlyOnV1 });
    }
    return map;
  }, [rawSections]);

  const sections = React.useMemo(
    () =>
      [...rawSections].sort(
        (a, b) => (meta.get(a.sectionId)?.order ?? 999) - (meta.get(b.sectionId)?.order ?? 999),
      ),
    [rawSections, meta],
  );
  // A lista principal mostra só o que a LP realmente renderiza, na ordem em que
  // aparece na página. As arquivadas (que não estão em nenhuma página desde que
  // a /1 virou snapshot congelado) vão pra uma gaveta fechada no fim.
  const liveSections = React.useMemo(
    () => sections.filter((s) => !meta.get(s.sectionId)?.onlyOnV1),
    [sections, meta],
  );
  const archivedSections = React.useMemo(
    () => sections.filter((s) => meta.get(s.sectionId)?.onlyOnV1),
    [sections, meta],
  );
  const [showArchived, setShowArchived] = React.useState(false);
  const buyerWave = rawSections.find((s) => s.sectionId === "buyer-wave");
  const apoiadores = rawSections.find((s) => s.sectionId === "apoiadores");
  const faqSection = rawSections.find((s) => s.sectionId === "faq");
  const manualSection = rawSections.find((s) => s.sectionId === "manual-strategic");
  // Categorias dos apoiadores saem dos próprios dados, na ordem da página.
  const categoriasApoiadores = React.useMemo(
    () => (apoiadores ? categoriasDe(apoiadores) : []),
    [apoiadores],
  );

  const [drafts, setDrafts] = React.useState<Record<string, Draft>>(() =>
    Object.fromEntries(sections.map((s) => [s.sectionId, { texts: { ...s.texts }, images: { ...s.images } }])),
  );
  const [selectedId, setSelectedId] = React.useState(sections[0]?.sectionId ?? "");
  const [mode, setMode] = React.useState<Mode>("edit");
  const [device, setDevice] = React.useState<Device>("default");
  const [iframeKey, setIframeKey] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const modalIframeRef = React.useRef<HTMLIFrameElement>(null);

  /** Qual visão do editor de logos está aberta (null = nenhuma). */
  const logosView: LogosView | null = React.useMemo(() => {
    if (selectedId === BAND_VIEW) return { kind: "band" };
    if (selectedId === LOGOS_VIEW) return { kind: "cat", cat: null };
    if (selectedId.startsWith(LOGOS_CAT_PREFIX)) {
      return { kind: "cat", cat: selectedId.slice(LOGOS_CAT_PREFIX.length) };
    }
    return null;
  }, [selectedId]);

  const selected = sections.find((s) => s.sectionId === selectedId);
  const draft = React.useMemo(
    () => drafts[selectedId] ?? { texts: {}, images: {} },
    [drafts, selectedId],
  );

  // Snapshot original p/ detectar alterações não salvas.
  const originals = React.useMemo(
    () => JSON.stringify(Object.fromEntries(sections.map((s) => [s.sectionId, { texts: s.texts, images: s.images }]))),
    [sections],
  );
  const dirty = React.useMemo(() => JSON.stringify(drafts) !== originals, [drafts, originals]);

  React.useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const [state, setState] = React.useState<SaveState>("idle");
  const [pending, start] = React.useTransition();

  // Rascunho/Publicar: quais seções têm rascunho não publicado.
  const [localPending, setLocalPending] = React.useState<Set<string>>(
    () => new Set(rawSections.filter((s) => s.hasUnpublishedChanges).map((s) => s.sectionId)),
  );
  const [globalsDirty, setGlobalsDirty] = React.useState(globalsPending);
  const [publishState, setPublishState] = React.useState<SaveState>("idle");
  const [publishPending, startPublish] = React.useTransition();
  const pendingTotal = localPending.size + (globalsDirty ? 1 : 0);

  function publish() {
    if (!window.confirm("Publicar as alterações na landing page ao vivo?")) return;
    setPublishState("saving");
    startPublish(async () => {
      try {
        await publishLandingAction();
        setLocalPending(new Set());
        setGlobalsDirty(false);
        setPublishState("saved");
        setTimeout(() => setPublishState("idle"), 1500);
        router.refresh();
      } catch {
        setPublishState("error");
      }
    });
  }

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

  // Chaves que o usuário realmente mexeu nesta sessão. Ver pruneUntouched: é o
  // que distingue "campo que ele esvaziou de propósito" de "campo que nasceu
  // vazio porque o manifesto declara e o banco nunca teve".
  const [touched, setTouched] = React.useState<Set<string>>(() => new Set());
  const markTouched = (k: string) => setTouched((t) => (t.has(k) ? t : new Set(t).add(k)));

  function setText(k: string, v: string) {
    markTouched(k);
    setDrafts((d) => ({ ...d, [selectedId]: { ...d[selectedId], texts: { ...d[selectedId].texts, [k]: v } } }));
  }
  function setImage(k: string, v: string) {
    markTouched(k);
    setDrafts((d) => ({ ...d, [selectedId]: { ...d[selectedId], images: { ...d[selectedId].images, [k]: v } } }));
  }
  /**
   * Grava só o que existe no banco ou o que ele realmente mexeu.
   *
   * O manifesto mostra campos que a LP lê mas que nunca foram gravados (a capa
   * do manual, o liga/desliga da promo). Se o primeiro "Salvar" escrevesse ""
   * em todos, o banco passaria a vencer o ContentData da landing com vazio e o
   * conteúdo sumiria da página sem ninguém ter pedido.
   *
   * O critério é INTENÇÃO, não "está vazio": um campo que ele abriu, digitou e
   * depois limpou precisa ir para o banco como "" — é assim que se desliga o
   * bloco da promo Belenergy, cuja chave ainda não existe lá.
   */
  function pruneUntouched(next: Record<string, string>, original: Record<string, string>) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(next)) {
      if (!(k in original) && !touched.has(k)) continue;
      out[k] = v;
    }
    return out;
  }

  function saveSection() {
    setState("saving");
    start(async () => {
      try {
        await saveLandingSectionAction(
          selectedId,
          pruneUntouched(draft.texts, selected?.texts ?? {}),
          pruneUntouched(draft.images, selected?.images ?? {}),
        );
        setLocalPending((p) => new Set(p).add(selectedId));
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  // No buyer-wave, os campos testimonial* são editados na aba "Depoimentos".
  const hideTestimonial = selectedId === "buyer-wave";
  const groups = React.useMemo(() => {
    const tKeys = Object.keys(draft.texts).filter((k) => !(hideTestimonial && isTestimonialKey(k)));
    const iKeys = Object.keys(draft.images).filter((k) => !(hideTestimonial && isTestimonialKey(k)));
    return buildSectionGroups(selectedId, tKeys, iKeys).groups;
  }, [selectedId, draft, hideTestimonial]);
  const hasFields = groups.some((g) => g.fields.length > 0);
  const selectedLabel = meta.get(selectedId)?.label ?? selected?.name ?? selectedId;

  return (
    <div className="space-y-5">
      {/* BARRA DE PUBLICAÇÃO */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          {pendingTotal > 0 ? (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="font-semibold text-slate-700">
                {pendingTotal} {pendingTotal === 1 ? "alteração não publicada" : "alterações não publicadas"}
              </span>
              <span className="text-slate-400">— rascunho salvo, ainda não está no ar.</span>
            </>
          ) : (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-600">Tudo publicado.</span>
            </>
          )}
        </div>
        <PublishButton
          state={publishPending ? "saving" : publishState}
          disabled={pendingTotal === 0}
          onClick={publish}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ESQUERDA — globais + lista de seções (ordem da LP) */}
      <div className="space-y-4 lg:col-span-1">
        <GlobalsCard globals={globals} onSaved={() => setGlobalsDirty(true)} />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-sm font-bold text-slate-800">Seções da landing</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
              Na mesma ordem em que aparecem no site, de cima para baixo.
            </p>
          </div>
          <div className="max-h-[460px] overflow-y-auto p-2">
            {liveSections.map((s, i) => (
              <SectionRow
                key={s.sectionId}
                index={i + 1}
                sectionId={s.sectionId}
                label={meta.get(s.sectionId)?.label ?? s.name ?? s.sectionId}
                fieldCount={Object.keys(drafts[s.sectionId]?.texts ?? {}).length}
                active={s.sectionId === selectedId}
                pending={localPending.has(s.sectionId)}
                onSelect={() => setSelectedId(s.sectionId)}
              >
                {/* A faixa de logos é renderizada logo abaixo do Hero, então a
                    escolha de quem sobe para ela mora aqui em cima, junto do
                    Hero — e não lá na posição 11, onde ninguém a encontrava. */}
                {s.sectionId === "hero" && apoiadores ? (
                  <SubRow
                    icon={GalleryHorizontalEnd}
                    label="Faixa de apoiadores (rolagem)"
                    active={selectedId === BAND_VIEW}
                    onSelect={() => setSelectedId(BAND_VIEW)}
                  />
                ) : null}
                {/* O FAQ deixou de ser 7 perguntas fixas: pergunta, resposta,
                    adicionar, remover e reordenar (Francis, 27/07). */}
                {s.sectionId === "faq" && faqSection ? (
                  <SubRow
                    icon={ListOrdered}
                    label="Perguntas e respostas"
                    active={selectedId === FAQ_VIEW}
                    onSelect={() => setSelectedId(FAQ_VIEW)}
                  />
                ) : null}
                {/* Parágrafos do bloco "Código do Vendedor", que antes eram 4
                    slots fixos — não havia como quebrar um em dois. */}
                {s.sectionId === "manual-strategic" && manualSection ? (
                  <SubRow
                    icon={Pilcrow}
                    label="Parágrafos do Código"
                    active={selectedId === CODE_PARAGRAFOS_VIEW}
                    onSelect={() => setSelectedId(CODE_PARAGRAFOS_VIEW)}
                  />
                ) : null}
                {/* Cadastro dos logos, um subitem por categoria. As categorias
                    saem dos próprios dados: criar uma nova é digitar o nome no
                    campo "Categoria" de um logo. */}
                {s.sectionId === "apoiadores" && apoiadores ? (
                  <>
                    <SubRow
                      icon={ImageIcon}
                      label="Todos os logos"
                      active={selectedId === LOGOS_VIEW}
                      onSelect={() => setSelectedId(LOGOS_VIEW)}
                    />
                    {categoriasApoiadores.map((c) => (
                      <SubRow
                        key={c}
                        icon={Tag}
                        label={c}
                        indent
                        active={selectedId === LOGOS_CAT_PREFIX + c}
                        onSelect={() => setSelectedId(LOGOS_CAT_PREFIX + c)}
                      />
                    ))}
                  </>
                ) : null}
              </SectionRow>
            ))}

            {/* GAVETA — seções arquivadas. Não são renderizadas em página
                nenhuma desde que a /1 virou snapshot congelado (ver onlyOnV1).
                Ficam guardadas caso alguma volte pra LP. */}
            {archivedSections.length > 0 && (
              <div className="mt-2 border-t border-slate-100 pt-2">
                <button
                  onClick={() => setShowArchived((v) => !v)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                  <Archive className="h-3.5 w-3.5 shrink-0" />
                  Arquivadas ({archivedSections.length})
                  <ChevronDown
                    className={cn("ml-auto h-3.5 w-3.5 transition-transform", showArchived && "rotate-180")}
                  />
                </button>
                {showArchived && (
                  <>
                    <p className="px-3 pb-1 pt-1 text-[11px] leading-snug text-slate-400">
                      Não aparecem no site. Ficam guardadas caso queira trazer de volta —
                      editar aqui não muda nada na landing.
                    </p>
                    {archivedSections.map((s) => (
                      <SectionRow
                        key={s.sectionId}
                        sectionId={s.sectionId}
                        label={meta.get(s.sectionId)?.label ?? s.name ?? s.sectionId}
                        fieldCount={Object.keys(drafts[s.sectionId]?.texts ?? {}).length}
                        active={s.sectionId === selectedId}
                        pending={localPending.has(s.sectionId)}
                        muted
                        onSelect={() => setSelectedId(s.sectionId)}
                      >
                        {/* Os cards do carrossel de depoimentos vivem na
                            buyer-wave, que está arquivada junto. */}
                        {s.sectionId === "buyer-wave" && buyerWave ? (
                          <SubRow
                            icon={Quote}
                            label="Depoimentos (cards)"
                            active={selectedId === TESTIMONIALS_VIEW}
                            muted
                            onSelect={() => setSelectedId(TESTIMONIALS_VIEW)}
                          />
                        ) : null}
                      </SectionRow>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIREITA — editor / preview / depoimentos */}
      <div className="lg:col-span-2">
        {selectedId === TESTIMONIALS_VIEW && buyerWave ? (
          <TestimonialsEditor
            section={buyerWave}
            onSaved={() => setLocalPending((p) => new Set(p).add("buyer-wave"))}
          />
        ) : selectedId === FAQ_VIEW && faqSection ? (
          <ListEditor
            section={faqSection}
            title="Perguntas e respostas"
            icon={ListOrdered}
            groups={FAQ_GROUPS}
            onSaved={() => setLocalPending((p) => new Set(p).add("faq"))}
          />
        ) : selectedId === CODE_PARAGRAFOS_VIEW && manualSection ? (
          <ListEditor
            section={manualSection}
            title="Parágrafos do Código do Vendedor"
            icon={Pilcrow}
            groups={CODE_GROUPS}
            onSaved={() => setLocalPending((p) => new Set(p).add("manual-strategic"))}
          />
        ) : logosView && apoiadores ? (
          // Mesma posição na árvore para todas as visões: trocar de categoria
          // (ou ir para a faixa) não remonta o editor, então edição ainda não
          // salva numa categoria não se perde ao olhar outra.
          <LogosEditor
            section={apoiadores}
            view={logosView}
            onSaved={() => setLocalPending((p) => new Set(p).add("apoiadores"))}
          />
        ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900">{selectedLabel}</h3>
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
            <div className="space-y-7 p-6">
              {meta.get(selectedId)?.onlyOnV1 && (
                <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-[13px] leading-snug text-amber-900">
                  <Archive className="mt-px h-4 w-4 shrink-0" />
                  <p>
                    <span className="font-bold">Seção arquivada.</span> Ela não aparece na
                    landing — foi removida da página e está guardada aqui só para o caso de
                    voltar. Alterações neste painel não mudam nada no site.
                  </p>
                </div>
              )}
              {!hasFields && (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-400">
                  Sem campos editáveis nesta seção (o texto é fixo no código da landing).
                </p>
              )}
              {groups.map((group) => (
                <div key={group.label} className="space-y-4">
                  <p className="flex items-center gap-1.5 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Type className="h-3.5 w-3.5" /> {group.label}
                  </p>
                  {group.fields.map((field) =>
                    isComposite(field) ? (
                      <CompositeField key={field.key} field={field} texts={draft.texts} setText={setText} />
                    ) : (
                      <FieldInput
                        key={field.key}
                        field={field}
                        folder={selectedId}
                        value={(field.type === "image" ? draft.images[field.key] : draft.texts[field.key]) ?? ""}
                        onChange={(v) => (field.type === "image" ? setImage(field.key, v) : setText(field.key, v))}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
      </div>
    </div>
  );
}

/**
 * Linha da lista de seções. O número à esquerda é a posição na página — é o que
 * liga "o que estou editando" ao "onde isso aparece no site" sem precisar abrir
 * a preview. Seções arquivadas vêm sem número e apagadas (`muted`).
 */
function SectionRow({
  index,
  label,
  fieldCount,
  active,
  pending,
  muted,
  onSelect,
  children,
}: {
  index?: number;
  sectionId: string;
  label: string;
  fieldCount: number;
  active: boolean;
  pending: boolean;
  muted?: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}) {
  return (
    <>
      <button
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
          active
            ? "bg-primary/10 font-bold text-primary"
            : muted
              ? "text-slate-400 hover:bg-slate-50"
              : "text-slate-700 hover:bg-slate-50",
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {pending && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" title="Rascunho não publicado" />
          )}
          {index != null && (
            <span className="w-4 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-300">
              {index}
            </span>
          )}
          <span className="truncate">{label}</span>
        </span>
        <span className="ml-2 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          {fieldCount}
        </span>
      </button>
      {children}
    </>
  );
}

/** Editor dedicado aninhado sob uma seção (logos, cards de depoimento). */
function SubRow({
  icon: Icon,
  label,
  active,
  muted,
  indent,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  muted?: boolean;
  /** Segundo nível: categoria dentro do editor de logos. */
  indent?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-left text-[13px] transition-colors",
        indent ? "pl-14" : "pl-9",
        active
          ? "bg-primary/10 font-bold text-primary"
          : muted
            ? "text-slate-400 hover:bg-slate-50"
            : "text-slate-600 hover:bg-slate-50",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

function CompositeField({
  field,
  texts,
  setText,
}: {
  field: CompositeFieldDef;
  texts: Record<string, string>;
  setText: (k: string, v: string) => void;
}) {
  // Compõe a frase uma vez (a caixa é uncontrolled — não recompõe a cada tecla).
  const initial = React.useMemo(() => composeComposite(field, texts), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-1.5">
      <span className="text-[13px] font-semibold text-slate-700">{field.label}</span>
      {field.help && <span className="text-[11px] leading-snug text-slate-400">{field.help}</span>}
      <RichTextEditor
        value={initial}
        simpleHighlightClass={field.hlClass}
        onChange={(html) => {
          const parts = decomposeComposite(field, html);
          for (const [k, v] of Object.entries(parts)) setText(k, v);
        }}
      />
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  folder,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
  /** Pasta no bucket de imagens (= section_id). Só usada em type "image". */
  folder: string;
}) {
  const len = value.length;
  const over = field.maxLength != null && len > field.maxLength;
  const inputCls =
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:ring-2 " +
    (over
      ? "border-amber-400 focus:border-amber-400 focus:ring-amber-400/15"
      : "border-slate-200 focus:border-primary focus:ring-primary/15");

  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-slate-700">{field.label}</span>
        {field.maxLength != null && (
          <span className={cn("text-[11px] tabular-nums", over ? "font-bold text-amber-600" : "text-slate-400")}>
            {len}/{field.maxLength}
          </span>
        )}
      </div>
      {field.help && <span className="text-[11px] leading-snug text-slate-400">{field.help}</span>}

      {field.type === "image" ? (
        <ImageField value={value} onChange={onChange} folder={folder} />
      ) : field.type === "rich" ? (
        <RichTextEditor value={value} onChange={onChange} />
      ) : field.type === "multiline" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.min(5, Math.max(2, Math.ceil((value.length || 1) / 60)))}
          className={inputCls}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={field.type === "url" ? "url" : undefined}
          className={cn(inputCls, "h-10 py-0")}
        />
      )}

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

function GlobalsCard({ globals, onSaved }: { globals: LandingGlobals; onSaved: () => void }) {
  const [values, setValues] = React.useState<Record<string, string>>(() => ({ ...globals }));
  const [state, setState] = React.useState<SaveState>("idle");
  const [pending, start] = React.useTransition();

  function save() {
    setState("saving");
    start(async () => {
      try {
        for (const { key } of GLOBAL_FIELDS) await saveLandingGlobalAction(key, values[key] ?? "");
        onSaved();
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  // Fechado por padrão: são 4 campos que quase nunca mudam (checkout, WhatsApp,
  // logo, favicon) e, abertos, empurravam a lista de seções para baixo da
  // dobra — que é o que ele usa o tempo todo.
  const [open, setOpen] = React.useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-sm font-bold text-slate-800 transition-colors hover:text-primary"
        >
          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
          <span className="truncate">Configurações globais</span>
          {!open && (
            <span className="shrink-0 text-[11px] font-normal text-slate-400">
              checkout, WhatsApp, logo
            </span>
          )}
        </button>
        {open && <SaveButton state={pending ? "saving" : state} onClick={save} />}
      </div>
      <div className={cn("space-y-3", open ? "mt-3" : "hidden")}>
        {GLOBAL_FIELDS.map(({ key, label, icon: Icon, image }) => (
          <label key={key} className="grid gap-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
            {image ? (
              <ImageField
                value={values[key] ?? ""}
                onChange={(v) => setValues((s) => ({ ...s, [key]: v }))}
                folder="globais"
                compact
              />
            ) : (
              <input
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
  const map = {
    idle: { icon: <Save className="h-3.5 w-3.5" />, label: "Salvar rascunho", cls: "bg-primary text-white hover:bg-primary/95" },
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: "Salvando…", cls: "bg-primary/70 text-white" },
    saved: { icon: <Check className="h-3.5 w-3.5" />, label: "Rascunho salvo", cls: "bg-emerald-500 text-white" },
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

function PublishButton({
  state,
  disabled,
  onClick,
}: {
  state: SaveState;
  disabled: boolean;
  onClick: () => void;
}) {
  const map = {
    idle: { icon: <Rocket className="h-4 w-4" />, label: "Publicar na LP", cls: "bg-slate-900 text-white hover:bg-slate-800" },
    saving: { icon: <Loader2 className="h-4 w-4 animate-spin" />, label: "Publicando…", cls: "bg-slate-700 text-white" },
    saved: { icon: <Check className="h-4 w-4" />, label: "Publicado", cls: "bg-emerald-500 text-white" },
    error: { icon: <CircleAlert className="h-4 w-4" />, label: "Erro ao publicar", cls: "bg-destructive text-white" },
  }[state];
  const isDisabled = disabled || state === "saving";
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-5 text-sm font-bold transition-all active:scale-[0.98]",
        isDisabled && state !== "saving" ? "cursor-not-allowed bg-slate-200 text-slate-400" : map.cls,
      )}
    >
      {map.icon}
      {map.label}
    </button>
  );
}
