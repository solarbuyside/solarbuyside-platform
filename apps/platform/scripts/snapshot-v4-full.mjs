#!/usr/bin/env node
/**
 * Congela o conteúdo da /1 (src/v4-full) num JSON estático.
 *
 * A /1 é a cópia-salvaguarda da LP completa. Até aqui ela lia as MESMAS linhas
 * de `landing_sections` que a LP oficial — ou seja, estava congelada no código
 * mas não no conteúdo: toda edição do admin na oficial mudava a /1 junto.
 *
 * Este script tira um retrato do conteúdo PUBLICADO (colunas `texts`/`images`,
 * não o rascunho) das seções que a /1 renderiza e grava em
 * `apps/landing/src/v4-full/content-snapshot.json`. A partir daí a /1 lê o
 * arquivo e nunca mais toca no Supabase.
 *
 * Rodar de novo só se quiser re-sincronizar a salvaguarda de propósito.
 *
 *   node apps/platform/scripts/snapshot-v4-full.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

// Seções que src/v4-full/ realmente lê (getSection('...')).
const V4_FULL_SECTIONS = [
  "hero",
  "context",
  "video",
  "audience",
  "manual-strategic",
  "plataforma",
  "testimonials",
  "story-bridge",
  "seller-code",
  "authority",
  "pricing",
  "buyer-wave",
  "lead-magnet",
  "faq",
  "newsletter",
  "contact",
];

function loadEnv(path) {
  const out = {};
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = loadEnv(resolve(repoRoot, "apps/platform/.env.local"));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em apps/platform/.env.local");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };

const res = await fetch(`${url}/rest/v1/landing_sections?select=section_id,name,texts,images`, { headers });
if (!res.ok) {
  console.error(`Supabase ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const rows = await res.json();
const byId = new Map(rows.map((r) => [r.section_id, r]));

const sections = [];
const missing = [];
for (const id of V4_FULL_SECTIONS) {
  const row = byId.get(id);
  if (!row) {
    missing.push(id);
    continue;
  }
  sections.push({
    id: row.section_id,
    name: row.name ?? "",
    texts: row.texts && typeof row.texts === "object" ? row.texts : {},
    images: row.images && typeof row.images === "object" ? row.images : {},
  });
}

const globRes = await fetch(`${url}/rest/v1/landing_globals?select=key,value`, { headers });
const globals = {};
if (globRes.ok) {
  for (const g of await globRes.json()) if (g.value != null) globals[g.key] = g.value;
}

const out = {
  // Retrato do conteúdo publicado no momento do congelamento. Não editar à mão
  // pelo admin — a /1 é salvaguarda; o admin edita só a LP oficial.
  frozenAt: new Date().toISOString().slice(0, 10),
  globals,
  sections,
};

const dest = resolve(repoRoot, "apps/landing/src/v4-full/content-snapshot.json");
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`, "utf8");

const keyCount = sections.reduce(
  (n, s) => n + Object.keys(s.texts).length + Object.keys(s.images).length,
  0,
);
console.log(`OK  ${sections.length} seções, ${keyCount} chaves, ${Object.keys(globals).length} globais`);
console.log(`    -> ${dest}`);
if (missing.length) console.log(`    (sem linha no banco, cai no ContentData: ${missing.join(", ")})`);
