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
import type { ManualIndex } from "./types";
import { MANUAL_TOC, MANUAL_TOPIC_COUNT } from "@/lib/manual/manual-toc";

// Tipos mínimos do pdf.js que usamos (evita depender dos tipos do pacote).
type PdfPage = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void>; cancel: () => void };
};
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<PdfPage> };

// Chave única de um tópico no índice: "parteIdx-topicoIdx".
type TopicKey = string;

// Tópicos achatados na ordem do índice, para descobrir o tópico ATIVO pela
// página atual (as páginas crescem monotonicamente ao longo do manual).
const FLAT_TOPICS: { key: TopicKey; page: number }[] = MANUAL_TOC.flatMap((part, pi) =>
  part.topics.map((topic, ti) => ({ key: `${pi}-${ti}`, page: topic.page })),
);

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
  // Só ajustamos a escala ao tamanho da tela uma vez (não sobrescreve o zoom
  // manual do usuário depois).
  const didFitRef = React.useRef(false);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderTaskRef = React.useRef<{ cancel: () => void } | null>(null);
  const activeChapterRef = React.useRef<HTMLButtonElement>(null);
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [showReadingHint, setShowReadingHint] = React.useState(false);

  // Dica do "Modo leitura": aparece sozinha por alguns segundos (1x por
  // dispositivo) quando o leitor abre, sugerindo a leitura em tela cheia.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem("sbs.manual.readingHint") === "1";
    } catch {
      /* ignora */
    }
    if (dismissed) return;
    const showT = window.setTimeout(() => setShowReadingHint(true), 800);
    const hideT = window.setTimeout(() => setShowReadingHint(false), 7000);
    return () => {
      window.clearTimeout(showT);
      window.clearTimeout(hideT);
    };
  }, []);

  function dismissReadingHint() {
    setShowReadingHint(false);
    try {
      window.localStorage.setItem("sbs.manual.readingHint", "1");
    } catch {
      /* ignora */
    }
  }

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
      // A largura disponível muda ao entrar/sair da tela cheia — refaz o
      // ajuste de zoom para a página caber na nova largura.
      didFitRef.current = false;
    }
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Tópico ATIVO: o último cujo início <= página atual.
  const activeKey = React.useMemo<TopicKey | null>(() => {
    let key: TopicKey | null = null;
    for (const tp of FLAT_TOPICS) {
      if (tp.page <= page) key = tp.key;
      else break;
    }
    return key;
  }, [page]);

  // Tópico expandido no acordeão: por padrão segue o ativo; quando o usuário
  // alterna manualmente, guardamos o override por página (null = recolhido).
  const [openOverride, setOpenOverride] = React.useState<{ forPage: number; value: TopicKey | null } | null>(
    null,
  );
  const openKey = openOverride && openOverride.forPage === page ? openOverride.value : activeKey;
  function toggleTopic(key: TopicKey) {
    setOpenOverride({ forPage: page, value: openKey === key ? null : key });
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

  // Mantém o tópico ativo visível no painel.
  React.useEffect(() => {
    activeChapterRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeKey]);

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
        // disableAutoFetch + range requests: o pdf.js busca só os bytes da
        // página atual em vez de baixar os 61MB inteiros — abre muito mais
        // rápido. rangeChunkSize maior reduz o nº de requisições.
        const loaded = await pdfjs.getDocument({
          url: pdfUrl,
          disableAutoFetch: true,
          disableStream: false,
          rangeChunkSize: 262144,
        }).promise;
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

        // Na primeira renderização, ajusta a escala para a página caber na
        // largura do visualizador (essencial no mobile, onde 130% estoura).
        if (!didFitRef.current) {
          didFitRef.current = true;
          const container = document.getElementById("manual-canvas-scroll");
          // Na tela cheia usamos menos margem (a página fica um pouco maior).
          const margin = document.fullscreenElement ? 12 : 40;
          const avail = (container?.clientWidth ?? 0) - margin;
          const base = pdfPage.getViewport({ scale: 1 });
          if (avail > 0 && base.width > 0) {
            const fit = avail / base.width;
            // Limita entre 0.5 e 1.6 para não ficar minúsculo nem gigante.
            const fitScale = Math.max(0.5, Math.min(1.6, Math.round(fit * 100) / 100));
            if (Math.abs(fitScale - scale) > 0.01) {
              setScale(fitScale);
              setRendering(false);
              return; // re-renderiza com a nova escala
            }
          }
        }

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

  // Prefetch inteligente: aquece a janela vizinha (2 atrás, 3 à frente) em
  // segundo plano. Com disableAutoFetch, cada getPage baixa só os bytes daquela
  // página; o pdf.js cacheia, então ao navegar para perto a renderização é
  // instantânea — sem baixar o documento inteiro.
  React.useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    const lo = Math.max(1, page - 2);
    const hi = Math.min(index.numPages, page + 3);
    (async () => {
      for (let p = lo; p <= hi && !cancelled; p++) {
        if (p === page) continue;
        try {
          await doc.getPage(p);
        } catch {
          /* ignora — só pré-aquecimento */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, page, index.numPages]);

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
    <div className="flex h-[calc(100vh-10.5rem)] flex-col md:h-[calc(100vh-9rem)]">
      <div className="flex min-h-0 flex-1 gap-5">
        {/* Painel do índice — seções agrupadas e recolhíveis */}
        <aside className="hidden w-[310px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <ListTree className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-800">Índice</h2>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {MANUAL_TOPIC_COUNT} tópicos
            </span>
          </div>
          <IndexList
            page={page}
            activeKey={activeKey}
            openKey={openKey}
            onToggleTopic={toggleTopic}
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
              {/* Botão de índice — aparece no mobile (painel lateral some) e na
                  tela cheia. Some no desktop normal, onde o painel fixo já mostra
                  o índice. */}
              <button
                onClick={() => setDrawerOpen((o) => !o)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-colors sm:px-3",
                  drawerOpen
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary",
                  !isFullscreen && "lg:hidden",
                )}
                title="Mostrar índice"
              >
                <ListTree className="h-4 w-4" />
                <span className="hidden sm:inline">Índice</span>
              </button>
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
              <span className="hidden w-12 text-center text-xs font-semibold text-slate-500 sm:block">
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
                <div className="relative ml-1">
                  <button
                    onClick={() => {
                      dismissReadingHint();
                      toggleFullscreen();
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 transition-colors hover:border-primary/40 hover:text-primary sm:w-auto sm:px-3"
                    title="Abrir em tela cheia para uma leitura imersiva"
                  >
                    <Maximize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Modo leitura</span>
                  </button>

                  {/* Balãozinho de dica — sutil, com seta e botão de fechar. */}
                  {showReadingHint && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-60 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 rounded-[2px] bg-slate-900" />
                      <div className="relative flex items-start gap-2 rounded-xl bg-slate-900 px-3.5 py-3 text-white shadow-xl">
                        <Maximize2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="flex-1 text-[12px] leading-snug">
                          Clique aqui para uma leitura mais confortável, em tela cheia.
                        </p>
                        <button
                          onClick={dismissReadingHint}
                          className="-mr-1 -mt-1 shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:text-white"
                          title="Fechar"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                    {MANUAL_TOPIC_COUNT} tópicos
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
                  page={page}
                  activeKey={activeKey}
                  openKey={openKey}
                  onToggleTopic={toggleTopic}
                  expandOnly
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

/**
 * Índice detalhado: Parte (Fase/Anexo) → Tópico (X.0, número em negrito) →
 * Subtópicos recolhíveis. Espelha o índice impresso do manual. Reutilizado no
 * painel fixo (desktop) e no drawer (mobile / tela cheia).
 */
function IndexList({
  page,
  activeKey,
  openKey,
  onToggleTopic,
  onGo,
  activeRef,
  expandOnly,
}: {
  page: number;
  activeKey: TopicKey | null;
  openKey: TopicKey | null;
  onToggleTopic: (key: TopicKey) => void;
  onGo: (n: number) => void;
  activeRef?: React.Ref<HTMLButtonElement>;
  /** Quando true (drawer), clicar num tópico COM subtópicos só os expande (não
      navega nem fecha) — o usuário escolhe a página nos subitens. */
  expandOnly?: boolean;
}) {
  return (
    <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
      {MANUAL_TOC.map((part, pi) => (
        <div key={`${part.title}-${pi}`} className={pi > 0 ? "mt-4" : undefined}>
          {/* Cabeçalho da parte — navega para a página divisória da fase/anexo. */}
          <button
            onClick={() => onGo(part.page)}
            className="group flex w-full items-baseline gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-slate-50"
          >
            {part.kicker && (
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary">
                {part.kicker}
              </span>
            )}
            <span className="flex-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 group-hover:text-slate-700">
              {part.title}
            </span>
            <span className="shrink-0 text-[10px] font-semibold tabular-nums text-slate-300">
              {part.page}
            </span>
          </button>
          {part.subtitle && (
            <p className="px-2.5 pb-1.5 pt-0.5 text-[11px] leading-snug text-slate-400">{part.subtitle}</p>
          )}

          <div className="space-y-0.5">
            {part.topics.map((topic, ti) => {
              const key: TopicKey = `${pi}-${ti}`;
              const isActive = key === activeKey;
              const isOpen = key === openKey;
              const hasSubs = topic.subtopics.length > 0;
              return (
                <div key={key}>
                  <button
                    ref={isActive ? activeRef : undefined}
                    onClick={() => {
                      if (hasSubs) {
                        onToggleTopic(key);
                        if (!expandOnly) onGo(topic.page);
                      } else {
                        onGo(topic.page);
                      }
                    }}
                    className={cn(
                      "relative flex w-full items-center gap-2 rounded-xl py-2 pl-3 pr-2 text-left transition-all",
                      isActive ? "bg-primary/[0.07]" : "hover:bg-slate-100",
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    {topic.n && (
                      <span
                        className={cn(
                          "shrink-0 text-[12px] font-bold tabular-nums",
                          isActive ? "text-primary" : "text-slate-800",
                        )}
                      >
                        {topic.n}
                      </span>
                    )}
                    <span
                      className={cn(
                        "line-clamp-2 flex-1 text-[12.5px] leading-snug",
                        isActive ? "font-semibold text-primary" : "font-medium text-slate-700",
                      )}
                    >
                      {topic.title}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                        isActive ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {topic.page}
                    </span>
                    {hasSubs && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    )}
                  </button>

                  {hasSubs && isOpen && (
                    <div className="mb-1 ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                      {topic.subtopics.map((sub) => {
                        const isCurrent = sub.page === page;
                        return (
                          <button
                            key={sub.n}
                            onClick={() => onGo(sub.page)}
                            className={cn(
                              "flex w-full items-start gap-1.5 rounded-lg py-1.5 pl-2.5 pr-2 text-left transition-colors",
                              isCurrent ? "bg-primary/10" : "hover:bg-slate-100",
                            )}
                          >
                            <span
                              className={cn(
                                "shrink-0 text-[10.5px] font-semibold tabular-nums",
                                isCurrent ? "text-primary" : "text-slate-400",
                              )}
                            >
                              {sub.n}
                            </span>
                            <span
                              className={cn(
                                "line-clamp-2 flex-1 text-[12px] leading-snug",
                                isCurrent ? "text-primary" : "text-slate-500",
                              )}
                            >
                              {sub.title}
                            </span>
                            <span
                              className={cn(
                                "shrink-0 text-[10px] font-semibold tabular-nums",
                                isCurrent ? "text-primary/70" : "text-slate-400",
                              )}
                            >
                              {sub.page}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
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
      <span className="hidden text-xs font-medium text-slate-400 sm:inline">Ir para</span>
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
        className="h-9 w-12 rounded-lg border border-slate-200 text-center text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-14"
      />
      <span className="text-xs text-slate-400 sm:text-sm">/ {numPages}</span>
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
        // Escondida no mobile (só Anterior/Próxima na barra inferior); aparece
        // a partir de md (desktop em tela cheia).
        "fixed top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-xl backdrop-blur transition-all hover:scale-105 hover:bg-white hover:text-primary active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:flex",
        side === "left" ? "left-6" : "right-6",
      )}
    >
      {side === "left" ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
    </button>
  );
}
