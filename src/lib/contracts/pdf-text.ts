"use client";

/**
 * Extrai o texto de um PDF no navegador usando pdfjs-dist. Roda 100% no cliente
 * (o arquivo não é enviado a servidor nenhum), e devolve o texto concatenado
 * para alimentar o analisador de contratos.
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Aponta o worker para o arquivo da própria versão instalada da lib.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const parts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(pageText);
  }
  return parts.join("\n").replace(/\s+\n/g, "\n").trim();
}
