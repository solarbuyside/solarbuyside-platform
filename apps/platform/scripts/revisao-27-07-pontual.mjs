#!/usr/bin/env node
/**
 * Duas correções PONTUAIS pedidas pelo Francis em 27/07, autorizadas uma a uma
 * pelo Gabriel. Nada além destas chaves é tocado.
 *
 * 1) legal_docs (scope=landing, slug=antipirataria)
 *    "CLÁUSULA DE PROPRIEDADE E CONFIDENCIALIDADE" -> "CLÁUSULA DE PROPRIEDADE"
 *
 *    Está no BANCO, não no código: a página legal da landing lê
 *    `legal_docs` e só usa legalContent.tsx como fallback. Editar o arquivo
 *    não surtia efeito nenhum.
 *
 * 2) landing_sections (manual-strategic): o primeiro parágrafo do bloco
 *    "Código do Vendedor" vira dois.
 *
 *    O texto já vinha com a quebra marcada por linhas em branco dentro de
 *    codeDesc1 — o cliente colou os dois parágrafos numa caixa só porque não
 *    existia campo para o segundo. Agora existe: codeTop1/2/3, lidos pela
 *    landing e editáveis em "Manual estratégico > Parágrafos do Código".
 *
 *    codeDesc1/codeDesc2 continuam no banco, inertes (a landing prefere
 *    codeTop*), para não apagar nada que não foi pedido.
 *
 * Grava nas colunas publicado E rascunho: o editor lê o rascunho e "Publicar"
 * copia rascunho -> publicado, então gravar só num lado se perde no primeiro
 * Publicar do cliente.
 *
 *   node apps/platform/scripts/revisao-27-07-pontual.mjs --dry
 *   node apps/platform/scripts/revisao-27-07-pontual.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const platformRoot = resolve(here, "..");
const DRY = process.argv.includes("--dry");

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

const DE = "CLÁUSULA DE PROPRIEDADE E CONFIDENCIALIDADE";
const PARA = "CLÁUSULA DE PROPRIEDADE";

console.log(DRY ? "=== DRY RUN (não grava) ===\n" : "=== APLICANDO ===\n");

/* ── 1) heading da Antipirataria ─────────────────────────────────────────── */
const legalRes = await fetch(
  `${URL_BASE}/rest/v1/legal_docs?scope=eq.landing&slug=eq.antipirataria&select=blocks`,
  { headers: H },
);
const [legal] = await legalRes.json();
if (!legal) {
  console.error("legal_docs (landing/antipirataria) não encontrado.");
  process.exit(1);
}
const blocosNovos = legal.blocks.map((b) => (b.text === DE ? { ...b, text: PARA } : b));
const alterados = blocosNovos.filter((b, i) => b.text !== legal.blocks[i].text);
console.log(`[legal_docs landing/antipirataria] blocos alterados: ${alterados.length}`);
for (const b of alterados) console.log(`   "${DE}" -> "${b.text}"`);

/* ── 2) parágrafos do Código ─────────────────────────────────────────────── */
const secRes = await fetch(
  `${URL_BASE}/rest/v1/landing_sections?section_id=eq.manual-strategic&select=texts,texts_draft,images,images_draft`,
  { headers: H },
);
const [sec] = await secRes.json();
if (!sec) {
  console.error("Seção manual-strategic não encontrada.");
  process.exit(1);
}

// A quebra já está no conteúdo: o cliente separou os parágrafos com linhas em
// branco dentro do mesmo campo. Só o que estiver separado por linha em branco
// vira parágrafo próprio — não inventamos corte no meio de frase.
const partes = (sec.texts.codeDesc1 ?? "")
  .split(/\n\s*\n/)
  .map((x) => x.trim())
  .filter(Boolean);
const terceiro = (sec.texts.codeDesc2 ?? "").trim();

if (partes.length < 2) {
  console.error(`codeDesc1 não tem duas partes separadas por linha em branco (achei ${partes.length}). Abortando.`);
  process.exit(1);
}

const novosParagrafos = { codeTop1: partes[0], codeTop2: partes[1], codeTop3: terceiro };
console.log(`\n[manual-strategic] parágrafos do Código: 2 -> ${Object.keys(novosParagrafos).length}`);
for (const [k, v] of Object.entries(novosParagrafos)) {
  console.log(`   ${k}: ${v.slice(0, 76).replace(/\s+/g, " ")}…`);
}
console.log("   (codeDesc1/codeDesc2 ficam no banco, inertes — a landing prefere codeTop*)");

if (DRY) {
  console.log("\n(nada foi gravado)");
  process.exit(0);
}

const backup = resolve(platformRoot, "scripts/.backup-revisao-27-07.json");
writeFileSync(backup, `${JSON.stringify({ legal, sec }, null, 2)}\n`, "utf8");
console.log(`\nbackup -> ${backup}`);

const r1 = await fetch(`${URL_BASE}/rest/v1/legal_docs?scope=eq.landing&slug=eq.antipirataria`, {
  method: "PATCH",
  headers: H,
  body: JSON.stringify({ blocks: blocosNovos }),
});
if (!r1.ok) {
  console.error(`PATCH legal_docs: ${r1.status} ${await r1.text()}`);
  process.exit(1);
}

const r2 = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.manual-strategic`, {
  method: "PATCH",
  headers: H,
  body: JSON.stringify({
    texts: { ...sec.texts, ...novosParagrafos },
    texts_draft: { ...(sec.texts_draft ?? sec.texts), ...novosParagrafos },
  }),
});
if (!r2.ok) {
  console.error(`PATCH landing_sections: ${r2.status} ${await r2.text()}`);
  process.exit(1);
}

console.log("OK — as duas correções aplicadas (publicado + rascunho).");
