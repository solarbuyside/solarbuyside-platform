import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Upload de imagens da landing para o bucket `landing-images` (Supabase
 * Storage). Server-only — usa o service role, então quem chama TEM que ter
 * validado que o usuário é admin antes (ver a rota /api/admin/landing/upload).
 *
 * Antes disto, campo de imagem no admin era um input de texto: imagem nova
 * exigia commitar o arquivo e fazer deploy. Ver migration
 * 0021_landing_images_bucket.sql.
 */

export const LANDING_IMAGES_BUCKET = "landing-images";

/** Espelha o allowed_mime_types do bucket (migration 0021). */
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB, igual ao bucket

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

/**
 * Nome de arquivo previsível e seguro: pasta por seção + slug do nome original
 * + sufixo aleatório. O sufixo evita que dois uploads com o mesmo nome se
 * sobrescrevam (o cliente manda "logo.png" o tempo todo) e serve de
 * cache-busting — a URL do Storage é servida com cache longo.
 */
function buildPath(folder: string, originalName: string, mime: string): string {
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "geral";
  const base =
    originalName
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 48) || "imagem";
  const rand = Math.random().toString(36).slice(2, 8);
  const ext = EXT_BY_TYPE[mime] ?? "bin";
  return `${safeFolder}/${base}-${rand}.${ext}`;
}

export type UploadResult = { url: string; path: string };

export async function uploadLandingImage(file: File, folder: string): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Formato não aceito. Use PNG, JPG, WEBP, GIF ou SVG.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagem muito grande (máximo 5 MB).");
  }

  const admin = createAdminClient();
  const path = buildPath(folder, file.name, file.type);

  const { error } = await admin.storage.from(LANDING_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    // Erro mais comum em produção: a migration 0021 ainda não foi aplicada.
    if (/bucket not found/i.test(error.message)) {
      throw new Error(
        "O armazenamento de imagens ainda não foi criado no Supabase (migration 0021_landing_images_bucket.sql).",
      );
    }
    throw new Error(error.message);
  }

  const { data } = admin.storage.from(LANDING_IMAGES_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
