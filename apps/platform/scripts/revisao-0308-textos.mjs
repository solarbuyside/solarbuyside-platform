#!/usr/bin/env node
/**
 * Textos da revisão "V1 REVISÃO A" do Francis (03/08/2026) que são CONTEÚDO,
 * não código. Cada um foi ditado por ele num slide:
 *
 *  - slide 1  `pricing.card1Desc` apagado ("eliminar frase") e `card3Desc`
 *             trocado pela frase curta. As duas capas ficam com a descrição
 *             que ele escreveu, e o campo apagado agora SOME da página de
 *             verdade (era o bug do `||`, corrigido em df00257).
 *  - slide 2  `apoiadores.bandTitle` (a frase acima dos logos) e a nova letra
 *             miúda `bandDisclaimer`, logo abaixo do carrossel.
 *  - slide 4  `context.closing`: o parágrafo da janela de 90 dias, abaixo dos
 *             três itens do Panorama.
 *  - slide 6  `authority.story1` com a frase-chave em negrito ("frase chave:
 *             para destacar no texto em negrito").
 *
 * Regras da casa aplicadas na copy: sem travessão em texto visível, e o
 * negrito/destaque vai como `<span class="cms-bold">`, que é o que o
 * <CMSText> da landing aceita.
 *
 * Grava nas colunas publicado E rascunho: o editor lê o rascunho e "Publicar"
 * copia rascunho -> publicado; gravar só num lado se perde no primeiro
 * Publicar do cliente.
 *
 * Diferente dos scripts de exemplo (lista-manual-29-07), aqui o texto é
 * DITADO pelo cliente, então ele sobrescreve o que estiver lá. O valor
 * anterior vai para o backup em scripts/.backup-revisao-0308.json.
 *
 *   node apps/platform/scripts/revisao-0308-textos.mjs --dry
 *   node apps/platform/scripts/revisao-0308-textos.mjs
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

/* A frase-chave do slide 6, em negrito dentro do parágrafo. O resto do
   story1 fica igual ao que já está publicado. */
const STORY1 =
  "Durante anos, acompanhamos de perto como compradores de sistemas fotovoltaicos avaliam, " +
  "comparam e decidem um investimento. " +
  '<span class="cms-bold">E percebemos algo que a maioria dos treinamentos ignora: ' +
  "eles ensinam a vender, mas não ensinam a entender como o cliente compra.</span>";

/* Tabela do slide 17: o kit custa o mesmo R$ 797, mas a Licenca Coletiva vale
   para ate 10 vendedores, entao o custo por pessoa cai de 399 para 72. Os
   valores sao os que ELE escreveu, nao calculados: o arredondamento dele nao
   e uniforme (79,70 virou 80; 265,67 virou 265). */
const EQUIPE = [
  ["Integrador + 1 vendedor", "R$ 399"],
  ["Integrador + 2 vendedores", "R$ 265"],
  ["Integrador + 3 vendedores", "R$ 199"],
  ["Integrador + 4 vendedores", "R$ 159"],
  ["Integrador + 5 vendedores", "R$ 133"],
  ["Integrador + 6 vendedores", "R$ 114"],
  ["Integrador + 7 vendedores", "R$ 99"],
  ["Integrador + 8 vendedores", "R$ 88"],
  ["Integrador + 9 vendedores", "R$ 80"],
  ["Integrador + 10 vendedores", "R$ 72"],
];
const LINHAS_EQUIPE = Object.fromEntries(
  EQUIPE.flatMap(([equipe, valor], i) => [
    [`teamRow${i + 1}Label`, equipe],
    [`teamRow${i + 1}Value`, valor],
  ]),
);

const MUDANCAS = {
  pricing: {
    // Slide 1: frases curtas das quatro capas no topo da pagina, a linha de
    // resumo e o botao. Sao chaves proprias do Hero; as descricoes longas da
    // secao de oferta continuam intactas ("SEM ALTERACAO", slide 18).
    heroKit1Desc: "130 páginas e 160 tópicos",
    heroKit2Desc: "Método de venda consultiva",
    heroKit3Desc: "Teste a sua proposta antes de enviar",
    heroKit4Desc: "Licença de uso para até 10 vendedores",
    heroKitNote:
      "Kit Completo para integradoras e vendedores: 2 Ebooks + acesso à Plataforma de Avaliação de propostas",
    heroKitCta: "Quero o Kit Completo Agora",
    // Slide 17.
    teamTitle: "Capacite todo o seu time comercial por um investimento surpreendentemente baixo",
    teamLead:
      'Kit Solar Buy-Side com <span class="cms-bold">Licença de Uso Coletiva</span>: até 10 vendedores treinados no mesmo método de vendas consultivas.',
    teamColTeam: "Composição da equipe",
    teamColValue: "Investimento por pessoa",
    ...LINHAS_EQUIPE,
    // Slide 1, "Eliminar frase": some da página (o campo existe e está vazio).
    card1Desc: "",
    // Slide 1, "Texto novo" na capa da Licença de Uso Coletiva.
    card3Desc: "Licença de uso para até 10 vendedores",
  },
  apoiadores: {
    // Slide 2, o bloco "novo texto abaixo do carrossel". Sem travessao no
    // item 3 (o original dele tinha um).
    purposeKicker: "O que você leva",
    purposeTitle: "Para que servem o Manual, o Código e a Plataforma de Avaliação?",
    purpose1:
      "Você entende exatamente como o comprador avalia integradora, tecnologia, viabilidade e risco antes de fechar negócio.",
    purpose2:
      "Aplica esses mesmos critérios para revisar sua proposta e neutralizar objeções antes que elas apareçam.",
    purpose3:
      "Vende como consultor, defendendo o valor da sua proposta com dados e evidências, não com desconto.",
    // Slide 2, "Nova frase" acima dos logos.
    bandTitle: "Empresas referência que apoiam o Solar Buy-Side na profissionalização do mercado",
    // Slide 2, "Nova frase em letra miúda". Ela SUBSTITUI a contagem de
    // apoiadores que ocupava esta linha ("+15 empresas apoiadoras em 5
    // segmentos..."), no mesmo lugar e no mesmo corpo. O original dele usava
    // travessão.
    bandSubtitle:
      "Elas não vendem os materiais nem participam da sua receita. O conteúdo é de responsabilidade exclusiva da Buy-Side Soluções.",
    // Chave da tentativa anterior (uma linha A MAIS embaixo da contagem).
    // Vazia para o campo sumir de instalações que já a receberam.
    bandDisclaimer: "",
  },
  context: {
    // Slide 4, "No ADM: inserir este texto". Ponto final acrescentado.
    closing:
      "Antes disso, abrimos uma janela exclusiva de 90 dias para vender e capacitar integradoras " +
      'e vendedores em primeira mão. É a sua chance de dominar o método <span class="cms-bold">Solar Buy-Side</span>, ' +
      "alinhar uma venda verdadeiramente consultiva e preparar sua equipe antes que o novo padrão " +
      "chegue aos consumidores.",
  },
  authority: {
    story1: STORY1,
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
    process.exitCode = 1;
    return;
  }

  const backup = {};
  const patches = [];

  for (const id of ids) {
    const sec = secoes.find((s) => s.section_id === id);
    if (!sec) {
      console.error(`Seção ${id} não encontrada.`);
      process.exitCode = 1;
      return;
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
      const de = antes === undefined ? "(inexistente)" : JSON.stringify(antes.slice(0, 50));
      console.log(`   ${v === "" ? "-" : "~"} ${k}: ${de} -> ${JSON.stringify(v.slice(0, 50))}`);
    }
    if (mudou) {
      patches.push({ id, texts: { ...sec.texts, ...novos }, draft: { ...draftAtual, ...novos } });
    }
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

  const arquivo = resolve(platformRoot, "scripts/.backup-revisao-0308.json");
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
      process.exitCode = 1;
      return;
    }
    console.log(`OK ${p.id}`);
  }

  console.log("\nA LP é pré-renderizada no build: precisa de deploy (push ou Publicar no /admin).");
}

await main();
