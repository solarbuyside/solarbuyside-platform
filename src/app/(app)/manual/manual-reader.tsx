"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  ListTree,
  Loader2,
  X,
  BookOpen,
  Maximize2,
} from "lucide-react";

import { cn } from "@/lib/utils";
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

type SearchHit = { page: number; snippet: string; title?: string };

// Remove acentos e baixa caixa para uma busca tolerante.
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Achata o outline mantendo só os títulos de navegação úteis. Filtra ruído
// (rodapés de copyright, "FASE N" solto, fragmentos de parágrafo) e limita a
// profundidade para a árvore ficar legível. Deduplica páginas repetidas.
function flattenOutline(
  items: ManualOutlineItem[],
  depth = 0,
  seen: Set<string> = new Set(),
): Array<ManualOutlineItem & { depth: number }> {
  const out: Array<ManualOutlineItem & { depth: number }> = [];
  for (const it of items) {
    const title = it.title.trim();
    // Mantém apenas o que parece um título de seção real: cabeçalhos numerados
    // (ex.: "2.0", "3.2"), títulos em CAIXA ALTA, ou fases/módulos nomeados.
    const looksLikeHeading =
      /^\d+(\.\d+)*[\s.—-]/.test(title) || // 2.0 / 3.2 / 4.1 —
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
    if (!isNoise && !seen.has(key)) {
      seen.add(key);
      out.push({ ...it, depth });
    }
    if (it.children?.length) out.push(...flattenOutline(it.children, depth + 1, seen));
  }
  return out;
}

export function ManualReader({ index, pdfUrl }: { index: ManualIndex; pdfUrl: string }) {
  const [doc, setDoc] = React.useState<PdfDoc | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [scale, setScale] = React.useState(1.3);
  const [rendering, setRendering] = React.useState(false);
  const [panel, setPanel] = React.useState<"outline" | "search">("outline");
  const [query, setQuery] = React.useState("");

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderTaskRef = React.useRef<{ cancel: () => void } | null>(null);
  const pageInputRef = React.useRef<HTMLInputElement>(null);

  const outlineFlat = React.useMemo(() => flattenOutline(index.outline), [index.outline]);

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
        const loadingTask = pdfjs.getDocument({ url: pdfUrl });
        const loaded = await loadingTask.promise;
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

  const goTo = React.useCallback(
    (n: number) => {
      const clamped = Math.min(index.numPages, Math.max(1, n));
      setPage(clamped);
      // Volta o scroll do visualizador ao topo da página.
      document.getElementById("manual-canvas-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [index.numPages],
  );

  // Busca instantânea no texto pré-extraído + títulos do índice.
  const results = React.useMemo<SearchHit[]>(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return [];
    const titleByPage = new Map<number, string>();
    for (const it of outlineFlat) if (it.page) titleByPage.set(it.page, it.title);

    const hits: SearchHit[] = [];
    for (const p of index.pages) {
      const norm = normalize(p.text);
      const at = norm.indexOf(q);
      if (at === -1) continue;
      const start = Math.max(0, at - 50);
      const end = Math.min(p.text.length, at + q.length + 90);
      const snippet = (start > 0 ? "…" : "") + p.text.slice(start, end).trim() + (end < p.text.length ? "…" : "");
      hits.push({ page: p.page, snippet, title: titleByPage.get(p.page) });
      if (hits.length >= 80) break;
    }
    return hits;
  }, [query, index.pages, outlineFlat]);

  function highlight(text: string) {
    const q = query.trim();
    if (!q) return text;
    const nText = normalize(text);
    const nq = normalize(q);
    const i = nText.indexOf(nq);
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="rounded bg-primary/20 px-0.5 text-primary">{text.slice(i, i + q.length)}</mark>
        {text.slice(i + q.length)}
      </>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Manual Solar Buy-Side</h1>
            <p className="text-xs text-slate-500">{index.numPages} páginas · índice e busca interativos</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Painel lateral: índice + busca */}
        <aside className="hidden w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:flex">
          <div className="flex border-b border-slate-100 p-1.5">
            <button
              onClick={() => setPanel("outline")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                panel === "outline" ? "bg-primary/10 text-primary" : "text-slate-500 hover:text-slate-700",
              )}
            >
              <ListTree className="h-3.5 w-3.5" /> Índice
            </button>
            <button
              onClick={() => setPanel("search")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                panel === "search" ? "bg-primary/10 text-primary" : "text-slate-500 hover:text-slate-700",
              )}
            >
              <Search className="h-3.5 w-3.5" /> Buscar
            </button>
          </div>

          {panel === "search" && (
            <div className="border-b border-slate-100 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar no manual…"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {query.trim().length >= 2 && (
                <p className="mt-2 text-[11px] font-medium text-slate-400">
                  {results.length} resultado{results.length === 1 ? "" : "s"}
                </p>
              )}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {panel === "outline" &&
              outlineFlat.map((it, i) => (
                <button
                  key={`${it.title}-${i}`}
                  onClick={() => it.page && goTo(it.page)}
                  disabled={!it.page}
                  style={{ paddingLeft: `${8 + it.depth * 12}px` }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md py-1.5 pr-2 text-left text-[13px] transition-colors hover:bg-slate-100",
                    it.page === page ? "bg-primary/10 font-semibold text-primary" : "text-slate-600",
                    it.depth === 0 && "font-semibold",
                  )}
                >
                  <span className="line-clamp-2">{it.title}</span>
                  {it.page && <span className="shrink-0 text-[10px] text-slate-400">{it.page}</span>}
                </button>
              ))}

            {panel === "search" && query.trim().length < 2 && (
              <p className="px-2 py-6 text-center text-xs text-slate-400">
                Digite ao menos 2 caracteres para buscar por título ou conteúdo.
              </p>
            )}

            {panel === "search" &&
              results.map((hit, i) => (
                <button
                  key={`${hit.page}-${i}`}
                  onClick={() => goTo(hit.page)}
                  className="mb-1 flex w-full flex-col gap-1 rounded-md p-2.5 text-left transition-colors hover:bg-slate-100"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-xs font-bold text-slate-700">
                      {hit.title ?? `Página ${hit.page}`}
                    </span>
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      p. {hit.page}
                    </span>
                  </span>
                  <span className="line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                    {highlight(hit.snippet)}
                  </span>
                </button>
              ))}
          </div>
        </aside>

        {/* Visualizador */}
        <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30"
                title="Página anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <input
                  ref={pageInputRef}
                  defaultValue={page}
                  key={page}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = Number((e.target as HTMLInputElement).value);
                      if (Number.isFinite(v)) goTo(v);
                    }
                  }}
                  className="h-9 w-12 rounded-lg border border-slate-200 text-center text-sm outline-none focus:border-primary"
                />
                <span className="text-slate-400">/ {index.numPages}</span>
              </div>
              <button
                onClick={() => goTo(page + 1)}
                disabled={page >= index.numPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30"
                title="Próxima página"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
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
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
                title="Abrir em tela cheia"
              >
                <Maximize2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Canvas */}
          <div
            id="manual-canvas-scroll"
            className="relative flex-1 overflow-auto bg-slate-100 p-4"
          >
            {!doc && !loadError && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-sm font-medium">Carregando o manual…</p>
              </div>
            )}
            {loadError && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-500">
                <p className="text-sm font-semibold text-destructive">Não foi possível abrir o manual.</p>
                <p className="max-w-xs text-xs">{loadError}</p>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary underline">
                  Abrir o PDF diretamente
                </a>
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
          </div>
        </div>
      </div>
    </div>
  );
}
