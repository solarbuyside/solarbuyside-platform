import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { uploadLandingImage, MAX_IMAGE_BYTES } from "@/lib/landing/images";

/**
 * Upload de imagem da landing pelo /admin.
 *
 * Route handler (não server action) porque o corpo é multipart e as server
 * actions do Next têm um teto de body bem menor que os 5 MB do bucket.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máximo 5 MB)." }, { status: 413 });
  }

  // Pasta = seção da landing, só pra organizar o bucket. Sanitizada em images.ts.
  const folder = typeof form.get("folder") === "string" ? String(form.get("folder")) : "geral";

  try {
    const { url } = await uploadLandingImage(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao enviar a imagem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
