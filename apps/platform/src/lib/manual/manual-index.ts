import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ManualIndex } from "@/app/(app)/manual/types";
import { flattenTocForSearch } from "./manual-toc";

export type ManualChapter = { title: string; page: number };

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
 * Capítulos do Manual para a busca global e o card "continue lendo".
 * Fonte: índice curado (tópicos + subtópicos), não os bookmarks do PDF — assim a
 * busca cobre todo o índice detalhado e segue a numeração correta.
 */
export async function loadManualChapters(): Promise<ManualChapter[]> {
  return flattenTocForSearch();
}

// Fold acento→base preservando o comprimento (1:1 por caractere), para que o
// índice do match no texto normalizado coincida com o texto original e o trecho
// (snippet) saia legível, com acentos. NFD removeria marcas e desalinharia.
const FOLD: Record<string, string> = {
  á: "a", à: "a", ã: "a", â: "a", ä: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", õ: "o", ô: "o", ö: "o",
  ú: "u", ù: "u", û: "u", ü: "u",
  ç: "c", ñ: "n",
};
function fold(s: string): string {
  let out = "";
  for (const ch of s) {
    const lower = ch.toLowerCase();
    out += FOLD[lower] ?? lower;
  }
  return out;
}

export type ManualPageHit = { page: number; snippet: string };

function makeSnippet(text: string, at: number, qlen: number): string {
  const before = 60;
  const after = 130;
  let start = Math.max(0, at - before);
  let end = Math.min(text.length, at + qlen + after);
  // Não cortar no meio de palavras nas bordas.
  if (start > 0) {
    const sp = text.indexOf(" ", start);
    if (sp !== -1 && sp < at) start = sp + 1;
  }
  if (end < text.length) {
    const sp = text.lastIndexOf(" ", end);
    if (sp > at + qlen) end = sp;
  }
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = "… " + snippet;
  if (end < text.length) snippet = snippet + " …";
  return snippet;
}

/**
 * Busca em texto completo nas 161 páginas do Manual (acento-insensível). Retorna
 * página + trecho com o termo destacável. Roda no servidor (texto fica em
 * public/manual/manual-index.json, cacheado) e é exposta via /api/manual/search.
 */
export async function searchManualFullText(query: string, limit = 8): Promise<ManualPageHit[]> {
  const q = fold(query.trim());
  if (q.length < 2) return [];
  const index = await loadManualIndex();
  if (!index?.pages?.length) return [];

  const hits: ManualPageHit[] = [];
  for (const p of index.pages) {
    if (!p.text) continue;
    const at = fold(p.text).indexOf(q);
    if (at === -1) continue;
    hits.push({ page: p.page, snippet: makeSnippet(p.text, at, q.length) });
    if (hits.length >= limit) break;
  }
  return hits;
}
