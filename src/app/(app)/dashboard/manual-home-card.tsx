"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

import { readManualProgress, progressPercent } from "@/app/(app)/manual/reading-progress";

/**
 * Card do Manual no dashboard: mostra o progresso de leitura (% lido) e leva
 * o usuário a continuar de onde parou. O progresso vem do localStorage, então
 * é lido no cliente após a montagem (evita mismatch de hidratação).
 */
export function ManualHomeCard({ numPages }: { numPages: number }) {
  const [progress, setProgress] = React.useState<{ pct: number; lastPage: number; maxPage: number } | null>(
    null,
  );

  React.useEffect(() => {
    // Lê o progresso do localStorage após a montagem (evita mismatch de
    // hidratação). Fora do corpo síncrono do efeito p/ não cascatear render.
    queueMicrotask(() => {
      const p = readManualProgress();
      setProgress({
        pct: progressPercent(p.maxPage, numPages),
        lastPage: p.lastPage,
        maxPage: p.maxPage,
      });
    });
  }, [numPages]);

  const pct = progress?.pct ?? 0;
  const started = (progress?.maxPage ?? 1) > 1;
  const finished = pct >= 100;
  const href = started ? `/manual?page=${progress?.lastPage ?? 1}` : "/manual";

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

      {/* Progresso */}
      <div className="relative mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">
            {finished ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Concluído
              </span>
            ) : started ? (
              "Sua leitura"
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
          {started && !finished ? "Continuar leitura" : finished ? "Reabrir manual" : "Abrir manual"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
