"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  ListTree,
  Loader2,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { writeManualProgress } from "./reading-progress";
import type { ManualIndex, ManualOutlineItem } from "./types";

// Tipos mínimos do pdf.js que usamos (evita depender dos tipos do pacote).
type PdfPage = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void>; cancel: () => void };
};
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<PdfPage> };

type Chapter = { title: string; page: number };
type Section = { title: string; page: number; children: Chapter[] };

// Achata o outline mantendo só títulos de navegação úteis (cabeçalhos numerados,
// CAIXA ALTA ou fases/módulos). Filtra rodapés, fragmentos e duplicatas.
function flattenOutline(
  items: ManualOutlineItem[],
  depth = 0,
  seen: Set<string> = new Set(),
): Chapter[] {
  const out: Chapter[] = [];
  for (const it of items) {
    const title = it.title.trim();
    const looksLikeHeading =
      /^\d+(\.\d+)*[\s.—-]/.test(title) ||
      /^(fase|módulo|capítulo|parte|anexo|apêndice)\b/i.test(title) ||
      (title.length >= 6 && title === title.toUpperCase());
    const isNoise =
      !title ||
      depth > 1 ||
      title.length > 70 ||
      /copyright/i.test(title) ||
      /^manual de compra/i.test(title) ||
      /^fase\s*\d+$/i.test(title) ||
      !looksLikeHeading;
    const key = `${title}|${it.page}`;
    if (!isNoise && it.page != null && !seen.has(key)) {
      seen.add(key);
      out.push({ title, page: it.page });
    }
    if (it.children?.length) out.push(...flattenOutline(it.children, depth + 1, seen));
  }
  return out;
}

// Títulos genéricos que NÃO devem virar seção (agrupam como subitem).
const GENERIC_TITLES = new Set([
  "ASSUNTOS",
  "RESPOSTAS",
  "DICA 1:",
  "GUIA INFORMATIVO:",
  "TÜV NORD",
]);

// É uma "seção principal"? Capítulos numerados com .0, ETAPA/FASE, divisores
// conhecidos ou cabeçalhos longos em CAIXA ALTA (não genéricos).
function isMajorSection(title: string): boolean {
  const t = title.trim();
  if (GENERIC_TITLES.has(t)) return false;
  if (/^\d+\.0\b/.test(t)) return true; // 2.0, 24.0
  if (/^\d+\.\s/.test(t)) return true; // "17. 4"
  if (/^(etapa|fase)\b/i.test(t)) return true;
  if (/^(preliminares|conhecimento|preparação|análise|decisão final|anexos|linha de chegada)\b/i.test(t))
    return true;
  if (t.length >= 12 && t === t.toUpperCase() && !/^\d/.test(t)) return true;
  return false;
}

// Agrupa os capítulos achatados em seções principais com subtópicos recolhíveis.
// Cada seção acumula tudo até a próxima seção principal.
function buildSections(chapters: Chapter[]): Section[] {
  const sections: Section[] = [];
  for (const ch of chapters) {
    if (isMajorSection(ch.title) || sections.length === 0) {
      sections.push({ title: ch.title, page: ch.page, children: [] });
    } else {
      sections[sections.length - 1].children.push(ch);
    }
  }
  return sections;
}

export function ManualReader({
  index,
  pdfUrl,
  initialPage = 1,
}: {
  index: ManualIndex;
  pdfUrl: string;
  initialPage?: number;
}) {
  const searchParams = useSearchParams();
  const [doc, setDoc] = React.useState<PdfDoc | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(initialPage);
  const [scale, setScale] = React.useState(1.3);
  const [rendering, setRendering] = React.useState(false);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderTaskRef = React.useRef<{ cancel: () => void } | null>(null);
  const activeChapterRef = React.useRef<HTMLButtonElement>(null);
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Tela cheia REAL dentro da plataforma (Fullscreen API) — sem abrir o PDF.
  function toggleFullscreen() {
    const el = viewerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }

  React.useEffect(() => {
    function onFs() {
      const fs = Boolean(document.fullscreenElement);
      setIsFullscreen(fs);
      if (!fs) setDrawerOpen(false); // sai da tela cheia → fecha o drawer
    }
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const chapters = React.useMemo(() => flattenOutline(index.outline), [index.outline]);
  const sections = React.useMemo(() => buildSections(chapters), [chapters]);

  // Índice da seção ATIVA (a última cujo início <= página atual). Um único ativo.
  const activeSectionIndex = React.useMemo(() => {
    let idx = 0;
    for (let i = 0; i < sections.length; i += 1) {
      if (sections[i].page <= page) idx = i;
      else break;
    }
    return idx;
  }, [sections, page]);

  // Seção aberta no acordeão: por padrão segue a ativa; quando o usuário
  // alterna manualmente, guardamos o override (e -1 = fechou tudo).
  const [openOverride, setOpenOverride] = React.useState<{ forPage: number; value: number | null } | null>(
    null,
  );
  const openSection =
    openOverride && openOverride.forPage === page ? openOverride.value : activeSectionIndex;
  function toggleSection(si: number) {
    setOpenOverride({ forPage: page, value: openSection === si ? null : si });
  }

  const goTo = React.useCallback(
    (n: number) => {
      const clamped = Math.min(index.numPages, Math.max(1, n));
      setPage(clamped);
      document.getElementById("manual-canvas-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [index.numPages],
  );

  // Reage a ?page= (ex.: usuário busca um capítulo já estando no /manual).
  const lastParamPage = React.useRef<string | null>(null);
  const paramPage = searchParams.get("page");
  React.useEffect(() => {
    if (paramPage === lastParamPage.current) return;
    lastParamPage.current = paramPage;
    const p = Number(paramPage);
    if (Number.isFinite(p) && p >= 1 && p <= index.numPages) {
      // Fora do corpo síncrono do efeito (evita cascata de render).
      queueMicrotask(() => goTo(p));
    }
  }, [paramPage, index.numPages, goTo]);

  // Mantém o capítulo ativo visível no painel.
  React.useEffect(() => {
    activeChapterRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeSectionIndex]);

  // Registra o progresso de leitura (página atual + máxima alcançada).
  React.useEffect(() => {
    writeManualProgress(page);
  }, [page]);

  // Carrega o documento PDF uma única vez (streaming por range requests).
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const loaded = await pdfjs.getDocument({ url: pdfUrl }).promise;
        if (!cancelled) setDoc(loaded as unknown as PdfDoc);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Falha ao abrir o manual.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  // Renderiza a página atual sempre que muda página/zoom/documento.
  React.useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    (async () => {
      setRendering(true);
      try {
        const pdfPage = await doc.getPage(page);
        if (cancelled) return;
        const viewport = pdfPage.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        renderTaskRef.current?.cancel();
        const task = pdfPage.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch {
        /* render cancelado ao trocar de página — ok */
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [doc, page, scale]);

  // Navegação por teclado (setas).
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return setDrawerOpen(false);
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") goTo(page + 1);
      if (e.key === "ArrowLeft") goTo(page - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, goTo]);

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div className="flex min-h-0 flex-1 gap-5">
        {/* Painel do índice — seções agrupadas e recolhíveis */}
        <aside className="hidden w-[310px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <ListTree className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-800">Índice</h2>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {sections.length} seções
            </span>
          </div>
          <IndexList
            sections={sections}
            page={page}
            activeSectionIndex={activeSectionIndex}
            openSection={openSection}
            onToggleSection={toggleSection}
            onGo={goTo}
            activeRef={activeChapterRef}
          />
        </aside>

        {/* Visualizador */}
        <div
          ref={viewerRef}
          className={cn(
            "relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
            isFullscreen && "rounded-none",
          )}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              {/* Botão de índice — só na tela cheia (no modo compacto o painel
                  lateral fixo já mostra o índice). */}
              {isFullscreen && (
                <button
                  onClick={() => setDrawerOpen((o) => !o)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors",
                    drawerOpen
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary",
                  )}
                  title="Mostrar índice"
                >
                  <ListTree className="h-4 w-4" />
                  Índice
                </button>
              )}
              <PageInput page={page} numPages={index.numPages} onGo={goTo} />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setScale((s) => Math.max(0.6, Math.round((s - 0.2) * 10) / 10))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
                title="Diminuir zoom"
              >
                <ZoomOut className="h-4.5 w-4.5" />
              </button>
              <span className="w-12 text-center text-xs font-semibold text-slate-500">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(3, Math.round((s + 0.2) * 10) / 10))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
                title="Aumentar zoom"
              >
                <ZoomIn className="h-4.5 w-4.5" />
              </button>
              {isFullscreen ? (
                <button
                  onClick={toggleFullscreen}
                  className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:border-primary/40 hover:text-primary"
                  title="Sair da tela cheia"
                >
                  <Minimize2 className="h-4 w-4" />
                  Sair
                </button>
              ) : (
                <button
                  onClick={toggleFullscreen}
                  className="ml-1 inline-flex h-9 items-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.06] px-3.5 text-xs font-bold text-primary transition-all hover:-translate-y-[1px] hover:bg-primary/10 active:scale-[0.98]"
                  title="Abrir em tela cheia para uma leitura imersiva"
                >
                  <Maximize2 className="h-4 w-4" />
                  Modo leitura
                </button>
              )}
            </div>
          </div>

          {/* Canvas + setas flutuantes */}
          <div id="manual-canvas-scroll" className="relative flex-1 overflow-auto bg-slate-100/80 p-5">
            {!doc && !loadError && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-sm font-medium">Carregando o manual…</p>
              </div>
            )}
            {loadError && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-500">
                <p className="text-sm font-semibold text-destructive">Não foi possível abrir o manual.</p>
                <p className="max-w-xs text-xs">Recarregue a página para tentar novamente.</p>
              </div>
            )}
            {doc && (
              <div className="mx-auto w-fit">
                <div className="relative shadow-lg">
                  {rendering && (
                    <div className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 shadow">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                  <canvas ref={canvasRef} className="block rounded-sm bg-white" />
                </div>
              </div>
            )}

            {/* Setas flutuantes — só na tela cheia (no modo normal a navegação
                fica nos botões grandes da barra inferior). */}
            {doc && isFullscreen && (
              <>
                <FloatingArrow side="left" disabled={page <= 1} onClick={() => goTo(page - 1)} />
                <FloatingArrow side="right" disabled={page >= index.numPages} onClick={() => goTo(page + 1)} />
              </>
            )}
          </div>

          {/* Índice flutuante (drawer) — sobrepõe o leitor, útil na tela cheia. */}
          {drawerOpen && (
            <>
              <div
                className="absolute inset-0 z-30 bg-slate-900/30 backdrop-blur-[1px]"
                onClick={() => setDrawerOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 z-40 flex w-[320px] max-w-[85%] flex-col border-r border-slate-200 bg-white shadow-2xl animate-in slide-in-from-left duration-200">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                  <ListTree className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-slate-800">Índice</h2>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {sections.length} seções
                  </span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                    title="Fechar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <IndexList
                  sections={sections}
                  page={page}
                  activeSectionIndex={activeSectionIndex}
                  openSection={openSection}
                  onToggleSection={toggleSection}
                  onGo={(n) => {
                    goTo(n);
                    setDrawerOpen(false);
                  }}
                />
              </div>
            </>
          )}

          {/* Barra inferior de navegação — botões grandes e fáceis */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all hover:border-primary/40 hover:text-primary active:scale-[0.98] disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </button>
            <div className="text-xs font-semibold text-slate-400">
              Página {page} de {index.numPages}
            </div>
            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= index.numPages}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.25)] transition-all hover:-translate-y-[1px] hover:bg-primary/90 active:scale-[0.98] disabled:opacity-30 disabled:shadow-none"
            >
              Próxima
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Índice agrupado e recolhível — reutilizado no painel fixo e no drawer. */
function IndexList({
  sections,
  page,
  activeSectionIndex,
  openSection,
  onToggleSection,
  onGo,
  activeRef,
}: {
  sections: Section[];
  page: number;
  activeSectionIndex: number;
  openSection: number | null;
  onToggleSection: (si: number) => void;
  onGo: (n: number) => void;
  activeRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2.5 py-3">
      {sections.map((section, si) => {
        const isActive = si === activeSectionIndex;
        const isOpen = openSection === si;
        const hasChildren = section.children.length > 0;
        return (
          <div key={`${section.title}-${si}`}>
            <button
              ref={isActive ? activeRef : undefined}
              onClick={() => {
                onGo(section.page);
                if (hasChildren) onToggleSection(si);
              }}
              className={cn(
                "relative flex w-full items-center gap-2 rounded-xl py-2.5 pl-3.5 pr-2.5 text-left transition-all",
                isActive ? "bg-primary/[0.07] text-primary" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <span
                className={cn(
                  "line-clamp-2 flex-1 text-[13px] font-semibold leading-snug",
                  isActive && "font-bold",
                )}
              >
                {section.title}
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  isActive ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-400",
                )}
              >
                {section.page}
              </span>
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              )}
            </button>

            {hasChildren && isOpen && (
              <div className="mb-1 ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                {section.children.map((ch, ci) => {
                  const isCurrent = ch.page === page;
                  return (
                    <button
                      key={`${ch.title}-${ci}`}
                      onClick={() => onGo(ch.page)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg py-1.5 pl-2.5 pr-2 text-left transition-colors",
                        isCurrent ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100",
                      )}
                    >
                      <span className="line-clamp-2 flex-1 text-[12px] leading-snug">{ch.title}</span>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] font-semibold tabular-nums",
                          isCurrent ? "text-primary/70" : "text-slate-400",
                        )}
                      >
                        {ch.page}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function PageInput({
  page,
  numPages,
  onGo,
}: {
  page: number;
  numPages: number;
  onGo: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-600">
      <span className="text-xs font-medium text-slate-400">Ir para</span>
      <input
        key={page}
        defaultValue={page}
        inputMode="numeric"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const v = Number((e.target as HTMLInputElement).value);
            if (Number.isFinite(v)) onGo(v);
          }
        }}
        className="h-9 w-14 rounded-lg border border-slate-200 text-center text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      <span className="text-slate-400">/ {numPages}</span>
    </div>
  );
}

function FloatingArrow({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={side === "left" ? "Página anterior" : "Próxima página"}
      className={cn(
        "fixed top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-xl backdrop-blur transition-all hover:scale-105 hover:bg-white hover:text-primary active:scale-95 disabled:pointer-events-none disabled:opacity-0",
        side === "left" ? "left-6" : "right-6",
      )}
    >
      {side === "left" ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
    </button>
  );
}
