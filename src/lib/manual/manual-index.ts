import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ManualIndex, ManualOutlineItem } from "@/app/(app)/manual/types";

export type ManualChapter = { title: string; page: number; depth: number };

let cached: ManualIndex | null | undefined;

/** Carrega o índice do Manual de public/manual/manual-index.json (cacheado). */
export async function loadManualIndex(): Promise<ManualIndex | null> {
  if (cached !== undefined) return cached;
  try {
    const file = join(process.cwd(), "public", "manual", "manual-index.json");
    cached = JSON.parse(await readFile(file, "utf-8")) as ManualIndex;
  } catch {
    cached = null;
  }
  return cached;
}

/**
 * Achata o outline mantendo só títulos de navegação úteis (cabeçalhos numerados,
 * CAIXA ALTA ou fases/módulos). Filtra rodapés, fragmentos e duplicatas.
 * Compartilhado entre a busca global e o leitor do Manual.
 */
export function flattenManualOutline(
  items: ManualOutlineItem[],
  depth = 0,
  seen: Set<string> = new Set(),
): ManualChapter[] {
  const out: ManualChapter[] = [];
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
      out.push({ title, page: it.page, depth });
    }
    if (it.children?.length) out.push(...flattenManualOutline(it.children, depth + 1, seen));
  }
  return out;
}

/** Capítulos do Manual prontos para a busca global (título + página). */
export async function loadManualChapters(): Promise<ManualChapter[]> {
  const index = await loadManualIndex();
  if (!index) return [];
  return flattenManualOutline(index.outline);
}
