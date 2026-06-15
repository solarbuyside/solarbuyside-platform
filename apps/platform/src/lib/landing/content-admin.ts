import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Leitura/escrita do conteúdo da landing (tabelas landing_sections /
 * landing_globals). Server-only — usa o admin client (service role). É a fonte
 * da verdade que a landing lê (anon) e que o /admin edita.
 *
 * Modelo rascunho/publicar: o editor lê e grava nas colunas *_draft; a landing
 * lê as colunas publicadas (texts/images/value). `publishLanding` copia
 * rascunho -> publicado. Ver migration 0019_landing_draft.sql.
 */

export type LandingSection = {
  sectionId: string;
  name: string | null;
  texts: Record<string, string>;
  images: Record<string, string>;
  /** Rascunho difere do publicado? (há mudança não publicada nesta seção) */
  hasUnpublishedChanges: boolean;
};

export type LandingGlobals = Record<string, string>;

function asStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

const sameMap = (a: Record<string, string>, b: Record<string, string>) =>
  JSON.stringify(a) === JSON.stringify(b);

export async function listLandingSections(): Promise<LandingSection[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("landing_sections")
    .select("section_id,name,texts,images,texts_draft,images_draft")
    .order("section_id");
  // Fallback: migration 0019 (colunas *_draft) ainda não aplicada — lê só o publicado.
  if (error) {
    const pub = await admin
      .from("landing_sections")
      .select("section_id,name,texts,images")
      .order("section_id");
    if (pub.error || !pub.data) return [];
    return pub.data.map((r) => ({
      sectionId: r.section_id,
      name: r.name,
      texts: asStringMap(r.texts),
      images: asStringMap(r.images),
      hasUnpublishedChanges: false,
    }));
  }
  if (!data) return [];
  return data.map((r) => {
    const pubTexts = asStringMap(r.texts);
    const pubImages = asStringMap(r.images);
    // Rascunho (editável). Se a coluna draft estiver nula, usa o publicado.
    const draftTexts = r.texts_draft == null ? pubTexts : asStringMap(r.texts_draft);
    const draftImages = r.images_draft == null ? pubImages : asStringMap(r.images_draft);
    return {
      sectionId: r.section_id,
      name: r.name,
      texts: draftTexts,
      images: draftImages,
      hasUnpublishedChanges: !sameMap(draftTexts, pubTexts) || !sameMap(draftImages, pubImages),
    };
  });
}

export async function getLandingGlobals(): Promise<{
  values: LandingGlobals;
  hasUnpublishedChanges: boolean;
}> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("landing_globals").select("key,value,value_draft");
  const values: LandingGlobals = {};
  let hasUnpublishedChanges = false;
  // Fallback: migration 0019 (value_draft) ainda não aplicada — lê só o publicado.
  if (error) {
    const pub = await admin.from("landing_globals").select("key,value");
    for (const r of pub.data ?? []) if (r.value != null) values[r.key] = r.value;
    return { values, hasUnpublishedChanges: false };
  }
  for (const r of data ?? []) {
    const pub = r.value ?? "";
    const draft = r.value_draft == null ? pub : r.value_draft;
    values[r.key] = draft;
    if (draft !== pub) hasUnpublishedChanges = true;
  }
  return { values, hasUnpublishedChanges };
}

/** Salva no RASCUNHO da seção (não publica). */
export async function saveLandingSection(
  sectionId: string,
  texts: Record<string, string>,
  images: Record<string, string>,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("landing_sections")
    .update({ texts_draft: texts, images_draft: images, updated_at: new Date().toISOString() })
    .eq("section_id", sectionId);
  if (error) throw new Error(error.message);
}

/** Salva no RASCUNHO de um global (não publica). */
export async function saveLandingGlobalValue(key: string, value: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("landing_globals")
    .upsert({ key, value_draft: value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

/**
 * Publica: copia rascunho -> publicado em todas as seções e globais. A partir
 * daqui a landing (que lê as colunas publicadas) reflete as mudanças.
 */
export async function publishLanding(): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: secs, error: secErr } = await admin
    .from("landing_sections")
    .select("section_id,texts_draft,images_draft");
  if (secErr) throw new Error(secErr.message);

  const { data: globs, error: globErr } = await admin
    .from("landing_globals")
    .select("key,value_draft");
  if (globErr) throw new Error(globErr.message);

  await Promise.all([
    ...(secs ?? []).map((r) =>
      admin
        .from("landing_sections")
        .update({ texts: r.texts_draft ?? {}, images: r.images_draft ?? {}, updated_at: now })
        .eq("section_id", r.section_id),
    ),
    ...(globs ?? []).map((g) =>
      admin.from("landing_globals").update({ value: g.value_draft ?? "" }).eq("key", g.key),
    ),
  ]);
}
