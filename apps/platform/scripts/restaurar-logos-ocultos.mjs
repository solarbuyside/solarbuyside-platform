#!/usr/bin/env node
/**
 * Repõe no banco o catálogo completo de apoiadores, tudo OCULTO.
 *
 * O banco tem hoje só os 5 logos que o Francis deixou ativos, mais 25 chaves
 * `logoNSrc: ""` sobrando. Os outros 12 logos que ele curou (e o Stäubli)
 * existem como arquivo em `apps/landing/public/assets/apoiadores/` e no
 * ContentData, mas não no banco — e o editor só lista o que está no banco.
 * Resultado: para reativar qualquer um deles ele teria que recadastrar à mão.
 *
 * Este script acrescenta os que faltam com `logoNHidden = "1"`, ou seja,
 * guardados no editor e fora da página. **A LP não muda em nada**: a landing
 * pula os ocultos (ver useApoiadores em ApoiadoresV4.tsx). O que muda é que o
 * Francis passa a ligar/desligar cada um por um clique.
 *
 * Os 5 ativos dele são copiados VERBATIM, na mesma ordem e visíveis.
 * A ordem importa: ela define a ordem das categorias na página.
 *
 * Grava nas quatro colunas (publicado + rascunho). Gravar só no publicado faz
 * o conteúdo sumir no primeiro "Publicar" do cliente — já aconteceu uma vez.
 *
 *   node apps/platform/scripts/restaurar-logos-ocultos.mjs --dry
 *   node apps/platform/scripts/restaurar-logos-ocultos.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const platformRoot = resolve(here, "..");
const DRY = process.argv.includes("--dry");

/** Catálogo curado pelo Francis (mesma fonte do seed de 22-23/07 + Stäubli). */
const CATALOGO = [
  ["belenergy", "BelEnergy", "Distribuidora Âncora Solar Buy-Side", "Distribuidora de equipamentos fotovoltaicos e parceira âncora do movimento Solar Buy-Side."],
  ["solis", "Solis", "Fabricantes", "Fabricante global de inversores solares."],
  ["hoymiles", "Hoymiles", "Fabricantes", "Fabricante de microinversores e otimizadores para geração distribuída."],
  ["huawei", "Huawei", "Fabricantes", "Fabricante global de inversores e soluções de energia inteligente."],
  ["longi", "LONGi Solar", "Fabricantes", "Um dos maiores fabricantes mundiais de módulos fotovoltaicos."],
  ["unipower", "Unipower", "Fabricantes", "Marca UCB Power, fabricante de baterias e soluções de energia."],
  ["clamper", "Clamper", "Fabricantes", "Fabricante brasileira de dispositivos de proteção contra surtos elétricos."],
  ["sil", "Sil", "Fabricantes", "Fabricante brasileira de fios e cabos elétricos."],
  ["proauto", "Proauto Electric Solar", "Fabricantes", "Fabricante de componentes elétricos para sistemas solares."],
  ["fluke", "Fluke", "Fabricantes", "Fabricante global de instrumentos de medição e diagnóstico elétrico."],
  ["staubli", "Stäubli", "Fabricantes", "Fabricante suíça de conectores fotovoltaicos e soluções de conexão elétrica."],
  ["pvclean", "pvClean", "Tecnologia, Serviços e Seguros", "Tecnologia e serviços de limpeza e manutenção de usinas fotovoltaicas."],
  ["solarview", "SolarView", "Tecnologia, Serviços e Seguros", "Plataforma de monitoramento de sistemas fotovoltaicos."],
  ["solergo", "SOLergo", "Tecnologia, Serviços e Seguros", "Software de projeto e dimensionamento de sistemas fotovoltaicos."],
  ["eletron-seguro-solar", "Elétron Seguro Solar", "Tecnologia, Serviços e Seguros", "Seguros especializados para sistemas de energia solar."],
  ["santander", "Santander", "Financiamento Solar", "Financiamento para projetos de energia solar."],
  ["energy-channel", "Energy Channel", "Mídia Solar", "Canal de mídia e conteúdo especializado no setor de energia solar."],
];

const MAX_LOGOS = 30;

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

const res = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.apoiadores&select=*`, { headers: H });
if (!res.ok) {
  console.error(`GET apoiadores: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const [row] = await res.json();
if (!row) {
  console.error("Seção 'apoiadores' não existe no banco.");
  process.exit(1);
}

const isLogoKey = (k) => /^logo\d+/.test(k);

/** Lê os logos existentes de um par (texts, images), na ordem dos índices. */
function lerLogos(texts, images) {
  const out = [];
  for (let i = 1; i <= MAX_LOGOS; i++) {
    const src = (images[`logo${i}Src`] ?? "").trim();
    const name = (texts[`logo${i}Name`] ?? "").trim();
    if (!src && !name) continue;
    out.push({
      src,
      name,
      cat: texts[`logo${i}Cat`] ?? "",
      desc: texts[`logo${i}Desc`] ?? "",
      url: texts[`logo${i}Url`] ?? "",
      hidden: texts[`logo${i}Hidden`] === "1",
    });
  }
  return out;
}

/** Monta a lista final: os atuais (verbatim) + o que falta do catálogo, oculto. */
function montar(atuais) {
  const usados = new Set(atuais.map((l) => l.src));
  const novos = CATALOGO.filter(([slug]) => !usados.has(`/assets/apoiadores/${slug}.png`)).map(
    ([slug, name, cat, desc]) => ({
      src: `/assets/apoiadores/${slug}.png`,
      name,
      cat,
      desc,
      url: "",
      hidden: true,
    }),
  );
  return { final: [...atuais, ...novos], novos };
}

/**
 * ESTRITAMENTE ADITIVO: só escreve nos slots que hoje estão vazios.
 *
 * Nada do que já existe é alterado nem removido. Os logos ativos do Francis não
 * são tocados (nem para acrescentar a chave `Hidden` — a landing e o editor
 * tratam ausente como visível). Os slots vazios que sobrarem depois dos novos
 * continuam onde estão: são inofensivos e apagá-los seria mexer no que não foi
 * pedido.
 */
function aplicar(texts, images, novos, primeiroSlot) {
  const t = { ...texts };
  const im = { ...images };
  novos.forEach((l, idx) => {
    const i = primeiroSlot + idx;
    im[`logo${i}Src`] = l.src;
    t[`logo${i}Name`] = l.name;
    t[`logo${i}Cat`] = l.cat;
    t[`logo${i}Desc`] = l.desc;
    t[`logo${i}Url`] = l.url;
    t[`logo${i}Hidden`] = "1"; // entram guardados, fora da página
  });
  return { texts: t, images: im };
}

/** Primeiro slot livre (sem imagem e sem nome) a partir de 1. */
function primeiroSlotLivre(texts, images) {
  for (let i = 1; i <= MAX_LOGOS; i++) {
    const src = (images[`logo${i}Src`] ?? "").trim();
    const name = (texts[`logo${i}Name`] ?? "").trim();
    if (!src && !name) return i;
  }
  return MAX_LOGOS + 1;
}

const pubAtuais = lerLogos(row.texts ?? {}, row.images ?? {});
const draftAtuais = lerLogos(row.texts_draft ?? row.texts ?? {}, row.images_draft ?? row.images ?? {});

const pub = montar(pubAtuais);
const draft = montar(draftAtuais);

const slotPub = primeiroSlotLivre(row.texts ?? {}, row.images ?? {});
const slotDraft = primeiroSlotLivre(row.texts_draft ?? row.texts ?? {}, row.images_draft ?? row.images ?? {});

console.log(DRY ? "=== DRY RUN (não grava) ===\n" : "=== APLICANDO ===\n");
console.log("INTOCADOS (nenhuma chave alterada ou removida):");
for (const [i, l] of pubAtuais.entries()) {
  console.log(`  ${String(i + 1).padStart(2)} ${l.name.padEnd(24)} ${l.cat}`);
}
console.log(`\nACRESCENTADOS a partir do slot ${slotPub}, todos ocultos:`);
for (const [i, l] of pub.novos.entries()) {
  console.log(`  ${String(slotPub + i).padStart(2)} ${l.name.padEnd(24)} ${l.cat}`);
}
console.log(
  `\nNa página continuam ${pubAtuais.filter((l) => !l.hidden).length} logos — a LP não muda.` +
    `\nChaves de texto: ${Object.keys(row.texts ?? {}).length} -> ${Object.keys(row.texts ?? {}).length + pub.novos.length * 5} (nenhuma removida).`,
);

if (DRY) {
  console.log("\n(nada foi gravado)");
  process.exit(0);
}

// Backup da linha inteira antes de tocar nela. Reverter = PATCH com este JSON.
const backup = resolve(platformRoot, "scripts/.backup-apoiadores.json");
writeFileSync(backup, `${JSON.stringify(row, null, 2)}\n`, "utf8");
console.log(`\nbackup da linha atual -> ${backup}`);

const a = aplicar(row.texts ?? {}, row.images ?? {}, pub.novos, slotPub);
const b = aplicar(row.texts_draft ?? row.texts ?? {}, row.images_draft ?? row.images ?? {}, draft.novos, slotDraft);

const patch = await fetch(`${URL_BASE}/rest/v1/landing_sections?section_id=eq.apoiadores`, {
  method: "PATCH",
  headers: { ...H, Prefer: "return=representation" },
  body: JSON.stringify({
    texts: a.texts,
    images: a.images,
    texts_draft: b.texts,
    images_draft: b.images,
  }),
});
if (!patch.ok) {
  console.error(`PATCH: ${patch.status} ${await patch.text()}`);
  process.exit(1);
}
console.log("\nOK — gravado nas quatro colunas (publicado + rascunho).");
