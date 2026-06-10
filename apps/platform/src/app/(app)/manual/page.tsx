import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";

import { ManualReader } from "./manual-reader";
import type { ManualIndex } from "./types";

export const metadata = {
  title: "Manual Solar Buy-Side",
};

async function loadIndex(): Promise<ManualIndex | null> {
  try {
    const file = join(process.cwd(), "public", "manual", "manual-index.json");
    const raw = await readFile(file, "utf-8");
    return JSON.parse(raw) as ManualIndex;
  } catch {
    return null;
  }
}

export default async function ManualPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const index = await loadIndex();
  if (!index) notFound();

  // URL pública do PDF (o arquivo está em /public). Encoda espaços do nome.
  const pdfUrl = `/${encodeURIComponent(index.pdf)}`;

  const { page } = await searchParams;
  const requested = Number(page);
  const initialPage =
    Number.isFinite(requested) && requested >= 1 && requested <= index.numPages
      ? requested
      : 1;

  // O leitor só precisa de outline + numPages + pdf. NÃO enviamos `pages` (o
  // texto de 161 páginas, ~240KB) ao cliente — a busca é feita no header.
  const slimIndex = { pdf: index.pdf, numPages: index.numPages, outline: index.outline, pages: [] };

  return <ManualReader index={slimIndex} pdfUrl={pdfUrl} initialPage={initialPage} />;
}
