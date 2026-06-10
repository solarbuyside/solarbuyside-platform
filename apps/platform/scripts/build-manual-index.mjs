/**
 * Gera o índice do Manual Solar Buy-Side a partir do PDF em /public.
 *
 * Saída: public/manual/manual-index.json com:
 *   - numPages
 *   - outline: árvore de bookmarks (categorias/índice) com a página de destino
 *   - pages: [{ page, text }] texto por página (para busca instantânea no cliente)
 *
 * Roda em build-time (Node), não no navegador. Reexecutar quando o PDF mudar:
 *   node scripts/build-manual-index.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");

// Descobre o PDF do manual em /public (nome pode mudar de data).
const pdfName = readdirSync(publicDir).find(
  (f) => /manual/i.test(f) && f.toLowerCase().endsWith(".pdf"),
);
if (!pdfName) {
  console.error("Nenhum PDF de manual encontrado em /public.");
  process.exit(1);
}
const pdfPath = resolve(publicDir, pdfName);
console.log("Manual:", pdfName);

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

const data = new Uint8Array(readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
console.log("Páginas:", doc.numPages);

// Mapeia destino (ref/explícito) -> número da página (1-based).
async function destToPage(dest) {
  try {
    let explicit = dest;
    if (typeof dest === "string") explicit = await doc.getDestination(dest);
    if (!explicit) return null;
    const ref = explicit[0];
    if (ref == null) return null;
    const idx = await doc.getPageIndex(ref);
    return idx + 1;
  } catch {
    return null;
  }
}

// Outline (bookmarks) -> árvore com páginas.
async function mapOutline(items) {
  if (!items) return [];
  const out = [];
  for (const it of items) {
    const page = await destToPage(it.dest);
    out.push({
      title: it.title?.trim() ?? "",
      page,
      children: await mapOutline(it.items),
    });
  }
  return out;
}

const rawOutline = await doc.getOutline();
const outline = await mapOutline(rawOutline);

// Texto por página.
const pages = [];
for (let n = 1; n <= doc.numPages; n += 1) {
  const page = await doc.getPage(n);
  const content = await page.getTextContent();
  const text = content.items
    .map((i) => ("str" in i ? i.str : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  pages.push({ page: n, text });
  if (n % 25 === 0) console.log(`  ...${n}/${doc.numPages}`);
}

const outDir = resolve(publicDir, "manual");
mkdirSync(outDir, { recursive: true });
const result = { pdf: pdfName, numPages: doc.numPages, outline, pages };
writeFileSync(resolve(outDir, "manual-index.json"), JSON.stringify(result));
console.log(
  `OK: manual-index.json (${outline.length} itens de índice, ${pages.length} páginas).`,
);
