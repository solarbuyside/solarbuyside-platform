"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, CheckCircle2, Bookmark } from "lucide-react";

import { readManualProgress, progressPercent } from "@/app/(app)/manual/reading-progress";

type Chapter = { title: string; page: number };

/**
 * Card do Manual no dashboard: mostra onde o usuário parou (página + capítulo)
 * e o progresso (% lido), levando-o a continuar de onde parou. O progresso vem
 * do localStorage, lido no cliente após a montagem (evita mismatch de hidratação).
 */
export function ManualHomeCard({
  numPages,
  chapters,
}: {
  numPages: number;
  chapters: Chapter[];
}) {
  const [state, setState] = React.useState<{
    pct: number;
    resumePage: number;
    chapter: string | null;
  } | null>(null);

  React.useEffect(() => {
    queueMicrotask(() => {
      const p = readManualProgress();
      // "Continuar" leva à página mais avançada já alcançada (maxPage).
      const resumePage = p.maxPage;
      // Capítulo correspondente: o de maior página <= página de retomada.
      let chapter: string | null = null;
      let best = 0;
      for (const ch of chapters) {
        if (ch.page <= resumePage && ch.page >= best) {
          best = ch.page;
          chapter = ch.title;
        }
      }
      setState({
        pct: progressPercent(p.maxPage, numPages),
        resumePage,
        chapter,
      });
    });
  }, [numPages, chapters]);

  const pct = state?.pct ?? 0;
  const resumePage = state?.resumePage ?? 1;
  const started = resumePage > 1;
  const finished = pct >= 100;
  const href = started ? `/manual?page=${resumePage}` : "/manual";

  // Formata título do capítulo (Title Case suave se vier em CAIXA ALTA longa).
  const chapterLabel = state?.chapter
    ? state.chapter.length > 4 && state.chapter === state.chapter.toUpperCase()
      ? state.chapter.charAt(0) + state.chapter.slice(1).toLowerCase()
      : state.chapter
    : null;

  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)]"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900">Manual Solar Buy-Side</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-slate-500">
            O guia completo para comprar seu sistema solar com segurança e critério.
          </p>
        </div>
      </div>

      {/* Onde parou */}
      {started && !finished && (
        <div className="relative mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
          <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Você parou na página {resumePage}
            </p>
            {chapterLabel && (
              <p className="line-clamp-1 text-[13px] font-bold text-slate-700">{chapterLabel}</p>
            )}
          </div>
        </div>
      )}

      {/* Progresso */}
      <div className="relative mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">
            {finished ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Você concluiu a leitura
              </span>
            ) : started ? (
              `${resumePage} de ${numPages} páginas`
            ) : (
              "Comece a ler"
            )}
          </span>
          <span className="font-bold tabular-nums text-primary">{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
          {started && !finished ? "Continuar de onde parou" : finished ? "Reabrir manual" : "Abrir manual"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
