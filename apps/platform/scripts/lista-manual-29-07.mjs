#!/usr/bin/env node
/**
 * Semeia a lista numerada do bloco MANUAL (seção `manual-strategic`), pedida
 * pelo Francis em 29/07: "acrescentar para a seção MANUAL, abaixo dos 3
 * parágrafos, 5 linhas para inserir alguns dados (da mesma forma do que para o
 * código) + um subtítulo".
 *
 * As chaves são `manualListTitle` + `manualItem1..6`, lidas pela landing em
 * `apps/landing/src/v4/ManualStrategicV4.tsx` e editáveis em
 * "/admin/landing > Manual estratégico > Manual — lista numerada".
 *
 * O texto aqui é EXEMPLO para o Francis revisar: descreve o caminho que o
 * comprador percorre no Manual (critérios, comparação, pontuação por peso,
 * viabilidade, finalistas), espelhando o que a plataforma realmente faz.
 *
 * Grava nas colunas publicado E rascunho: o editor lê o rascunho e "Publicar"
 * copia rascunho -> publicado, então gravar só num lado se perde no primeiro
 * Publicar do cliente.
 *
 * Não sobrescreve chave que já tenha conteúdo — rodar duas vezes é inofensivo,
 * e um texto já revisado pelo cliente não volta para o exemplo.
 *
 *   node apps/platform/scripts/lista-manual-29-07.mjs --dry
 *   node apps/platform/scripts/lista-manual-29-07.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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

// A máquina do Gabriel tem `.env` (sem o `.local` que os scripts antigos
// assumiam). Aceita os dois, na ordem de preferência.
const envPath = [".env.local", ".env"]
  .map((f) => resolve(platformRoot, f))
  .find((p) => existsSync(p));
if (!envPath) {
  console.error("Nenhum .env.local / .env em apps/platform/");
  process.exit(1);
}
const env = loadEnv(envPath);
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error(`Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em ${envPath}`);
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

/* Copy de exemplo. Sem travessão em texto visível (regra da LP). */
const EXEMPLO = {
  manualListTitle: "O caminho que o comprador percorre antes de escolher uma proposta:",
  manualItem1: "Critérios de Avaliação da Integradora",
  manualItem2: "Comparação Técnica das Propostas",
  manualItem3: "Pontuação por Peso de Cada Critério",
  manualItem4: "Análise de Viabilidade Financeira",
  manualItem5: "Escolha dos Finalistas e Decisão",
  manualItem6: "",
};

console.log(DRY ? "=== DRY RUN (não grava) ===\n" : "=== APLICANDO ===\n");

/* Tudo o que fala com a rede vive aqui dentro: `process.exit` com socket do
   undici ainda aberto derruba o Node no Windows com assert do libuv
   (UV_HANDLE_CLOSING). Sai por `return` + exitCode. */
async function main() {
  const res = await fetch(
    `${URL_BASE}/rest/v1/landing_sections?section_id=eq.manual-strategic&select=texts,texts_draft`,
    { headers: H },
  );
  const [sec] = await res.json();
  if (!sec) {
    console.error("Seção manual-strategic não encontrada.");
    process.exitCode = 1;
    return;
  }

  const draftAtual = sec.texts_draft ?? sec.texts;
  const novos = {};
  for (const [k, v] of Object.entries(EXEMPLO)) {
    const jaTem = (sec.texts[k] ?? "").trim() || (draftAtual[k] ?? "").trim();
    if (jaTem) {
      console.log(`   (mantém) ${k}: ${jaTem.slice(0, 60)}`);
      continue;
    }
    novos[k] = v;
    console.log(`   ${v ? "+" : "="} ${k}: ${v || "(vazio, slot livre no editor)"}`);
  }

  if (Object.keys(novos).length === 0) {
    console.log("\nNada a fazer: todas as chaves já existem com conteúdo.");
    return;
  }

  if (DRY) {
    console.log("\n(nada foi gravado)");
    return;
  }

  const backup = resolve(platformRoot, "scripts/.backup-lista-manual-29-07.json");
  writeFileSync(backup, `${JSON.stringify(sec, null, 2)}\n`, "utf8");
  console.log(`\nbackup -> ${backup}`);

  const patch = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.manual-strategic`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({
      texts: { ...sec.texts, ...novos },
      texts_draft: { ...draftAtual, ...novos },
    }),
  });
  if (!patch.ok) {
    console.error(`PATCH landing_sections: ${patch.status} ${await patch.text()}`);
    process.exitCode = 1;
    return;
  }

  console.log("OK — lista do Manual semeada (publicado + rascunho).");
  console.log("A LP é pré-renderizada no build: precisa de deploy (push ou Publicar no /admin).");
}

await main();
