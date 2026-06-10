import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Leitura/escrita do conteúdo da landing (tabelas landing_sections /
 * landing_globals). Server-only — usa o admin client (service role). É a fonte
 * da verdade que a landing lê (anon) e que o /admin edita.
 */

export type LandingSection = {
  sectionId: string;
  name: string | null;
  texts: Record<string, string>;
  images: Record<string, string>;
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

export async function listLandingSections(): Promise<LandingSection[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("landing_sections")
    .select("section_id,name,texts,images")
    .order("section_id");
  if (error || !data) return [];
  return data.map((r) => ({
    sectionId: r.section_id,
    name: r.name,
    texts: asStringMap(r.texts),
    images: asStringMap(r.images),
  }));
}

export async function getLandingGlobals(): Promise<LandingGlobals> {
  const admin = createAdminClient();
  const { data } = await admin.from("landing_globals").select("key,value");
  const out: LandingGlobals = {};
  for (const r of data ?? []) if (r.value != null) out[r.key] = r.value;
  return out;
}

export async function saveLandingSection(
  sectionId: string,
  texts: Record<string, string>,
  images: Record<string, string>,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("landing_sections")
    .update({ texts, images, updated_at: new Date().toISOString() })
    .eq("section_id", sectionId);
  if (error) throw new Error(error.message);
}

export async function saveLandingGlobalValue(key: string, value: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("landing_globals")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
