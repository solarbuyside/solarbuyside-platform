#!/usr/bin/env node
/**
 * Textos da revisão do Francis de 09/08/2026 que são CONTEÚDO, não código.
 *
 *  - `plataforma.tableCaption`  ele reescreveu a legenda da tabela: o que era
 *    "reputação da integradora e em tecnologia proposta" virou "confiabilidade
 *    da integradora e em reputação da tecnologia proposta". Ele anotou também
 *    "não encontrei no ADM como alterar a frase": o campo EXISTE (seção
 *    Plataforma > "Legenda da tabela de exemplo"), mas estava vazio no banco e
 *    a página mostrava o padrão do código — campo em branco no editor não
 *    parece o texto que está no ar. Gravar aqui resolve os dois: entra a frase
 *    nova e ela passa a aparecer no editor.
 *
 *  - `context.closingTitle` + `context.closing`  ele pediu para "transformar a
 *    frase em subtítulo do bloco Panorama com um espaço do texto abaixo". A
 *    frase estava DENTRO do parágrafo, como um <span> azul em negrito seguido
 *    de <br>. Aqui ela sai do parágrafo e vai para o campo próprio que a
 *    ContextV4 passou a ler.
 *
 *  - `pricing.heroKitNote`  "+ Licença de uso até 10 vendedores" no rótulo do
 *    kit, no Hero. O valor no banco ainda era a frase longa de antes de 06/08,
 *    que o código tratava como legado; agora o texto fica gravado de verdade.
 *
 * REGRA DA CASA aplicada na copy: sem travessão em texto visível. O original
 * dele usa "—" em três lugares; viraram vírgulas.
 *
 * Grava nas colunas publicado E rascunho: o editor lê o rascunho e "Publicar"
 * copia rascunho -> publicado; gravar só num lado se perde no primeiro
 * Publicar do cliente.
 *
 *   node apps/platform/scripts/revisao-0908-textos.mjs --dry
 *   node apps/platform/scripts/revisao-0908-textos.mjs
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

/* A legenda dele, com os destaques que a tabela já usava: o valor em negrito e
   o índice em laranja. O ponto solto do fim do original ("proposta. .") saiu. */
const LEGENDA =
  "Seis propostas para o mesmo cliente. Venceu a de " +
  '<span class="cms-bold">R$ 16.342,80</span>, nem a mais cara, nem a mais barata, ' +
  "porque teve o maior Índice de Confiabilidade: " +
  '<span class="cms-orange">79,2 de 100</span>, com a melhor pontuação em confiabilidade ' +
  "da integradora e em reputação da tecnologia proposta.";

const MUDANCAS = {
  plataforma: {
    tableCaption: LEGENDA,
  },
  context: {
    closingTitle: "Uma janela de 90 dias para sair na frente",
    /* Sem o título e sem o travessão de "quem vende — para que". O <br><br>
       entre os dois parágrafos é preservado: são duas ideias. */
    closing:
      "O lançamento oficial do Método Solar Buy-Side abre 90 dias dedicados a quem vende: " +
      "o tempo para dominar o método antes do lançamento nacional do Manual e da Plataforma " +
      "para o consumidor final.<br><br>" +
      "É por isso que equipamos primeiro quem vende, para que, quando o comprador chegar mais " +
      "preparado, você já esteja pronto para conduzir a conversa com segurança.",
  },
  pricing: {
    heroKitNote: "Kit Completo: 2 Ebooks + Plataforma + Licença de uso até 10 vendedores",
  },
};

console.log(DRY ? "=== DRY RUN (não grava) ===\n" : "=== APLICANDO ===\n");

async function main() {
  const ids = Object.keys(MUDANCAS);
  const res = await fetch(
    `${URL_BASE}/rest/v1/landing_sections?section_id=in.(${ids.join(",")})&select=section_id,texts,texts_draft`,
    { headers: H },
  );
  const secoes = await res.json();
  if (!Array.isArray(secoes)) {
    console.error(`GET landing_sections: ${JSON.stringify(secoes)}`);
    process.exit(1);
  }

  const backup = {};
  const patches = [];

  for (const id of ids) {
    const sec = secoes.find((s) => s.section_id === id);
    if (!sec) {
      console.error(`Seção ${id} não encontrada.`);
      process.exit(1);
    }
    backup[id] = sec;
    const draftAtual = sec.texts_draft ?? sec.texts;
    const novos = MUDANCAS[id];

    console.log(`## ${id}`);
    let mudou = false;
    for (const [k, v] of Object.entries(novos)) {
      const antes = sec.texts[k];
      if (antes === v) {
        console.log(`   (igual)  ${k}`);
        continue;
      }
      mudou = true;
      const de = antes === undefined ? "(inexistente)" : JSON.stringify(antes.slice(0, 60));
      console.log(`   ~ ${k}`);
      console.log(`       de   ${de}`);
      console.log(`       para ${JSON.stringify(v.slice(0, 60))}`);
    }
    if (mudou) patches.push({ id, texts: { ...sec.texts, ...novos }, draft: { ...draftAtual, ...novos } });
    console.log("");
  }

  if (patches.length === 0) {
    console.log("Nada a fazer: o banco já está com todos os textos da revisão.");
    return;
  }
  if (DRY) {
    console.log("(nada foi gravado)");
    return;
  }

  const arquivo = resolve(platformRoot, "scripts/.backup-revisao-0908.json");
  writeFileSync(arquivo, `${JSON.stringify(backup, null, 2)}\n`, "utf8");
  console.log(`backup -> ${arquivo}\n`);

  for (const p of patches) {
    const r = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.${p.id}`, {
      method: "PATCH",
      headers: H,
      body: JSON.stringify({ texts: p.texts, texts_draft: p.draft }),
    });
    if (!r.ok) {
      console.error(`PATCH ${p.id}: ${r.status} ${await r.text()}`);
      process.exit(1);
    }
    console.log(`  ${p.id} atualizado (publicado + rascunho)`);
  }
  console.log("\nLembrete: a LP é pré-renderizada. Só vai ao ar no próximo deploy/Publicar.");
}

await main();
