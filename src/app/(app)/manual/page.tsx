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

export default async function ManualPage() {
  const index = await loadIndex();
  if (!index) notFound();

  // URL pública do PDF (o arquivo está em /public). Encoda espaços do nome.
  const pdfUrl = `/${encodeURIComponent(index.pdf)}`;

  return <ManualReader index={index} pdfUrl={pdfUrl} />;
}
