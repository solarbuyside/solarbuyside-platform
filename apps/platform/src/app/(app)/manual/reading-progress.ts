"use client";

/**
 * Progresso de leitura do Manual, por dispositivo (localStorage). Guarda a
 * página atual e a página máxima já alcançada — a % "lida" usa a máxima.
 */
const KEY = "sbs.manual.progress.v1";

export type ManualProgress = {
  lastPage: number;
  maxPage: number;
};

export function readManualProgress(): ManualProgress {
  if (typeof window === "undefined") return { lastPage: 1, maxPage: 1 };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { lastPage: 1, maxPage: 1 };
    const parsed = JSON.parse(raw) as Partial<ManualProgress>;
    const lastPage = Math.max(1, Number(parsed.lastPage) || 1);
    const maxPage = Math.max(lastPage, Number(parsed.maxPage) || 1);
    return { lastPage, maxPage };
  } catch {
    return { lastPage: 1, maxPage: 1 };
  }
}

export function writeManualProgress(page: number): void {
  if (typeof window === "undefined") return;
  try {
    const prev = readManualProgress();
    const next: ManualProgress = {
      lastPage: page,
      maxPage: Math.max(prev.maxPage, page),
    };
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* localStorage indisponível — ignora */
  }
}

export function progressPercent(maxPage: number, numPages: number): number {
  if (numPages <= 0) return 0;
  return Math.min(100, Math.round((maxPage / numPages) * 100));
}
