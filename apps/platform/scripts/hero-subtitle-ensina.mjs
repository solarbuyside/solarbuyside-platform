#!/usr/bin/env node
/**
 * Correção de português na subfrase do Hero (Gabriel, 09/08).
 *
 *   antes:  "O método que APRENDE você a vender pela perspectiva do comprador"
 *   depois: "O método que ENSINA você a vender pela perspectiva do comprador"
 *
 * Quem aprende é o leitor; quem ensina é o método. Do jeito que estava, a
 * frase dizia que o método é o aluno.
 *
 * É CONTEÚDO, não código: a frase vive em `landing_sections.hero.subtitle` e o
 * padrão no arquivo (`HeroV4.tsx` / `HeroVariantesV4.tsx`) só entra quando o
 * banco está vazio. Editar o padrão não mudaria nada no ar, por isso o acerto
 * é aqui. Aparece nas três variantes do Hero, porque as três leem a mesma
 * chave.
 *
 * Grava nas colunas publicado E rascunho, como manda a casa: o editor lê o
 * rascunho e "Publicar" copia rascunho -> publicado; gravar só num lado se
 * perde no primeiro Publicar do cliente.
 *
 * Só troca se o texto atual for exatamente o esperado. Se o Francis tiver
 * reescrito a frase pelo admin no meio do caminho, o script para e não
 * atropela o texto dele.
 *
 * O HTML da LP é congelado no build, então isto só aparece no ar depois de
 * um Publicar (que dispara o deploy hook).
 *
 *   node apps/platform/scripts/hero-subtitle-ensina.mjs --dry
 *   node apps/platform/scripts/hero-subtitle-ensina.mjs
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

const envPath = [".env.local", ".env"].map((f) => resolve(platformRoot, f)).find((p) => existsSync(p));
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

const CHAVE = "subtitle";
const DE = "O método que aprende você a vender pela perspectiva do comprador";
const PARA = "O método que ensina você a vender pela perspectiva do comprador";

async function main() {
  const res = await fetch(
    `${URL_BASE}/rest/v1/landing_sections?section_id=eq.hero&select=section_id,texts,texts_draft`,
    { headers: H },
  );
  const secoes = await res.json();
  if (!Array.isArray(secoes) || secoes.length === 0) {
    console.error(`GET landing_sections: ${JSON.stringify(secoes)}`);
    process.exit(1);
  }
  const sec = secoes[0];
  const draftAtual = sec.texts_draft ?? sec.texts;

  const pub = sec.texts?.[CHAVE];
  const dra = draftAtual?.[CHAVE];

  console.log(DRY ? "=== DRY RUN (não grava) ===\n" : "=== APLICANDO ===\n");
  console.log(`publicado: ${JSON.stringify(pub)}`);
  console.log(`rascunho : ${JSON.stringify(dra)}\n`);

  if (pub === PARA && dra === PARA) {
    console.log("Nada a fazer: o banco já está com a frase corrigida.");
    return;
  }

  /* Guarda de segurança: só mexe no que eu sei que está lá. Qualquer outra
     coisa é texto que alguém escreveu depois, e sobrescrever seria apagar
     trabalho do cliente sem ele pedir. */
  const inesperado = [pub, dra].filter((v) => v !== undefined && v !== DE && v !== PARA);
  if (inesperado.length > 0) {
    console.error("A frase no banco não é a esperada. Nada foi gravado.");
    console.error(`  esperado: ${JSON.stringify(DE)}`);
    for (const v of inesperado) console.error(`  achado  : ${JSON.stringify(v)}`);
    process.exit(1);
  }

  console.log(`~ hero.${CHAVE}: ${JSON.stringify(DE)}\n            -> ${JSON.stringify(PARA)}\n`);
  if (DRY) {
    console.log("(nada foi gravado)");
    return;
  }

  const arquivo = resolve(platformRoot, "scripts/.backup-hero-subtitle-ensina.json");
  writeFileSync(arquivo, `${JSON.stringify({ hero: sec }, null, 2)}\n`, "utf8");
  console.log(`backup -> ${arquivo}\n`);

  const r = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.hero`, {
    method: "PATCH",
    headers: H,
    body: JSON.stringify({
      texts: { ...sec.texts, [CHAVE]: PARA },
      texts_draft: { ...draftAtual, [CHAVE]: PARA },
    }),
  });
  if (!r.ok) {
    console.error(`PATCH hero: ${r.status} ${await r.text()}`);
    process.exit(1);
  }
  console.log("hero.subtitle atualizado (publicado + rascunho).");
  console.log("Lembrete: a LP é pré-renderizada. Só vai ao ar no próximo Publicar.");
}

await main();
