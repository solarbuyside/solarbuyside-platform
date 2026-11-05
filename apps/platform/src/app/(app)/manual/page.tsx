import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { loadManualIndex } from "@/lib/manual/manual-index";
import { createAdminClient } from "@/lib/supabase/admin";
import { ManualReader } from "./manual-reader";

export const metadata = {
  title: "Manual Solar Buy-Side",
};

/**
 * O PDF é conteúdo pago: mora no bucket PRIVADO "manuais" do Supabase, nunca em
 * public/ (até 05/11/2026 ficava em public/ e qualquer pessoa baixava sem
 * login). Cada abertura gera um link assinado curto, só para quem está logado.
 */
const BUCKET = "manuais";
const ARQUIVO = "manual-solar-buy-side-2026-06-02.pdf";
const VALIDADE_DO_LINK_S = 4 * 60 * 60;

export default async function ManualPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const index = await loadManualIndex();
  if (!index) notFound();

  const { data: assinado, error } = await createAdminClient()
    .storage.from(BUCKET)
    .createSignedUrl(ARQUIVO, VALIDADE_DO_LINK_S);
  if (error || !assinado) throw new Error("Não foi possível abrir o manual agora.");

  // O tamanho vai junto porque o leitor pede o PDF em pedaços (Range) direto ao
  // Storage: o Supabase não expõe Accept-Ranges para outro domínio, então o
  // pdf.js não descobriria sozinho que pode pedir por partes.
  const cabeca = await fetch(assinado.signedUrl, { method: "HEAD", cache: "no-store" });
  const pdfBytes = Number(cabeca.headers.get("content-length") ?? 0);
  if (!pdfBytes) throw new Error("Não foi possível abrir o manual agora.");

  const { page } = await searchParams;
  const requested = Number(page);
  const initialPage =
    Number.isFinite(requested) && requested >= 1 && requested <= index.numPages
      ? requested
      : 1;

  // O leitor só precisa de numPages + pdf. O índice da barra lateral vem do TOC
  // curado (manual-toc.ts), e a busca de texto roda no servidor (/api/manual/
  // search), então NÃO enviamos `outline` nem `pages` ao cliente.
  const slimIndex = { pdf: index.pdf, numPages: index.numPages, outline: [], pages: [] };

  return (
    <ManualReader index={slimIndex} pdfUrl={assinado.signedUrl} pdfBytes={pdfBytes} initialPage={initialPage} />
  );
}
