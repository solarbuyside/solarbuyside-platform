#!/usr/bin/env node
/**
 * Preenche `story1` e `story2` da seção Autoridade com um texto de PARTIDA,
 * para o Gabriel e o Francis verem a seção montada em vez de imaginar.
 *
 * É rascunho editorial, não conteúdo final: o Francis reescreve por cima em
 * "Autoridade > História" no /admin.
 *
 * Só estas duas chaves são tocadas, nas colunas publicado E rascunho (o editor
 * lê o rascunho e "Publicar" copia rascunho -> publicado; gravar num lado só se
 * perde no primeiro Publicar).
 *
 *   node apps/platform/scripts/historia-autoridade-exemplo.mjs --dry
 *   node apps/platform/scripts/historia-autoridade-exemplo.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const platformRoot = resolve(here, "..");
const DRY = process.argv.includes("--dry");

const STORY1 =
  'O Movimento Solar Buy-Side nasceu de uma constatação incômoda: <span class="cms-bold">a maior parte das decisões de compra em energia solar é tomada no escuro.</span> De um lado, compradores sem critério para julgar uma proposta técnica. Do outro, vendedores treinados apenas para defender preço.';
const STORY2 =
  'Foi olhando para os dois lados dessa mesa que o método tomou forma — primeiro como um manual para quem compra, depois como um código para quem vende. Não é sobre nós: é sobre a conversa que precisa mudar.';

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = loadEnv(resolve(platformRoot, ".env.local"));
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em apps/platform/.env.local");
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const url = `${URL_BASE}/rest/v1/landing_sections?section_id=eq.authority`;

const [sec] = await (await fetch(`${url}&select=texts,texts_draft`, { headers: H })).json();
if (!sec) {
  console.error("Seção authority não encontrada.");
  process.exit(1);
}

const novas = { story1: STORY1, story2: STORY2 };
console.log(DRY ? "=== DRY RUN (não grava) ===\n" : "=== APLICANDO ===\n");
console.log(`chaves tocadas: ${Object.keys(novas).join(", ")}`);
for (const [k, v] of Object.entries(novas)) {
  const jaTinha = sec.texts[k] !== undefined;
  console.log(`  ${k} (${jaTinha ? "SOBRESCREVE" : "nova"}): ${v.replace(/<[^>]+>/g, "").slice(0, 80)}…`);
}
console.log(`\nnenhuma outra chave é alterada (a seção tem ${Object.keys(sec.texts).length} chaves)`);

if (DRY) {
  console.log("\n(nada foi gravado)");
  process.exit(0);
}

const backup = resolve(platformRoot, "scripts/.backup-authority.json");
writeFileSync(backup, `${JSON.stringify(sec, null, 2)}\n`, "utf8");

const r = await fetch(url, {
  method: "PATCH",
  headers: H,
  body: JSON.stringify({
    texts: { ...sec.texts, ...novas },
    texts_draft: { ...(sec.texts_draft ?? sec.texts), ...novas },
  }),
});
if (!r.ok) {
  console.error(`PATCH: ${r.status} ${await r.text()}`);
  process.exit(1);
}
console.log(`\nOK — gravado (publicado + rascunho). backup -> ${backup}`);
