import { createAdminClient } from "@/lib/supabase/admin";

/** CRUD dos documentos legais no banco (scope: landing | platform). Server-only. */

export type LegalBlockDb = { type: "heading" | "p"; text: string };
export type LegalDocDb = {
  scope: string;
  slug: string;
  title: string | null;
  subtitle: string | null;
  blocks: LegalBlockDb[];
};

function asBlocks(value: unknown): LegalBlockDb[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((b): b is { type: string; text: string } => !!b && typeof b === "object" && "text" in b)
    .map((b) => ({ type: b.type === "heading" ? "heading" : "p", text: String(b.text ?? "") }));
}

export async function listLegalDocs(): Promise<LegalDocDb[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("legal_docs")
    .select("scope,slug,title,subtitle,blocks")
    .order("scope")
    .order("slug");
  return (data ?? []).map((d) => ({
    scope: d.scope,
    slug: d.slug,
    title: d.title,
    subtitle: d.subtitle,
    blocks: asBlocks(d.blocks),
  }));
}

export async function getLegalDocDb(scope: string, slug: string): Promise<LegalDocDb | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("legal_docs")
    .select("scope,slug,title,subtitle,blocks")
    .eq("scope", scope)
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return { scope: data.scope, slug: data.slug, title: data.title, subtitle: data.subtitle, blocks: asBlocks(data.blocks) };
}

export async function saveLegalDocBlocks(
  scope: string,
  slug: string,
  title: string,
  blocks: LegalBlockDb[],
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("legal_docs")
    .update({ title, blocks, updated_at: new Date().toISOString() })
    .eq("scope", scope)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
}
