import { describe, expect, it } from "vitest";

import { applyAutoScores, autoScoreFor } from "../auto-scoring";
import { calculateComparisonResult } from "../scoring";
import { scoreDefinitions } from "../score-definitions";
import type {
  CompanyEvaluation,
  ComparisonInput,
  ScoreCategory,
  TechnicalEvaluation,
} from "../types";
import type { ReputationRating } from "../reputation";

/**
 * CONFERÊNCIA LITERAL DO DOC "VERIFICAÇÃO DO SISTEMA DE ATRIBUIÇÃO DE PESO"
 * (Francis, 2026-06-12). Cada número aqui foi TRANSCRITO do doc ("deve ser") —
 * não derivado. Confere duas coisas:
 *   (1) o PESO de cada critério == o peso que o Francis declarou;
 *   (2) o valor PONDERADO exibido na célula == (nota/10)×peso == o "= X pts" do doc.
 * Falha se UM número divergir.
 */

const WEIGHT = new Map(scoreDefinitions.map((d) => [d.key, d.weight] as const));
const round1 = (n: number) => Math.round(n * 10) / 10;
const weighted = (nota: number | null, key: string): number | null =>
  nota == null ? null : round1((nota / 10) * (WEIGHT.get(key) ?? 0));

const co = (company: CompanyEvaluation = {}, technical: TechnicalEvaluation = {}) => ({
  company,
  technical,
  financial: {},
});
const raw = (key: string, cat: ScoreCategory, company: CompanyEvaluation, technical: TechnicalEvaluation) =>
  autoScoreFor(key, cat, co(company, technical));

// ---------------------------------------------------------------------------
// 0. PESOS declarados no doc (peso por critério)
// ---------------------------------------------------------------------------
describe("Doc Francis — PESO de cada critério citado", () => {
  const PESOS: Array<[string, number]> = [
    ["company.own_installation_team", 10], // "Com peso de 10"
    ["company.installation_deadline", 5], // "peso do critério 5"
    ["company.reclame_aqui", 3], // "Com peso 3"
    ["technical.module_brand", 10], // "10%"
    ["technical.module_defect_warranty", 10], // "Peso 10"
    ["technical.inverter_brand", 10], // "Peso 10"
    ["technical.inverter_defect_warranty", 10], // "Peso 10"
    ["technical.inverter_oversizing", 10], // "Peso 10"
    ["technical.reputation_distributor", 15], // "Com peso 15"
    ["technical.reputation_module_maker", 10], // "Com peso 10"
    ["technical.reputation_inverter_maker", 5], // "Com peso 5"
  ];
  it.each(PESOS)("%s tem peso %i", (key, peso) => {
    expect(WEIGHT.get(key)).toBe(peso);
  });
});

// ---------------------------------------------------------------------------
// 1. EMPRESA — Equipe de instalação (peso 10): própria 10, dúvida 7, terceir. 4
// ---------------------------------------------------------------------------
describe("Doc Francis — Equipe de instalação (peso 10)", () => {
  const K = "company.own_installation_team";
  const cases: Array<[CompanyEvaluation["ownInstallationTeam"], number]> = [
    ["own", 10],
    ["unknown", 7],
    ["outsourced", 4],
  ];
  it.each(cases)("%s → nota=ponderado=%i", (team, deveSer) => {
    const r = raw(K, "company", { ownInstallationTeam: team }, {});
    expect(r).toBe(deveSer);
    expect(weighted(r, K)).toBe(deveSer); // peso 10 → ponderado == nota
  });
});

// ---------------------------------------------------------------------------
// 2. EMPRESA — Prazo de instalação (peso 5): tabela dias→nota→Peso/pts do doc
// ---------------------------------------------------------------------------
describe("Doc Francis — Prazo de instalação (peso 5)", () => {
  const K = "company.installation_deadline";
  // [dias, nota, Peso/pts. exato do doc]
  const T: Array<[number, number, number]> = [
    [30, 0, 0.0], [35, 1, 0.5], [40, 2, 1.0], [80, 3, 1.5], [75, 4, 2.0], [70, 5, 2.5],
    [65, 6, 3.0], [60, 7, 3.5], [55, 8, 4.0], [50, 9, 4.5], [45, 10, 5.0],
  ];
  it.each(T)("%i dias → nota %i, ponderado %f", (dias, nota, pond) => {
    const r = raw(K, "company", { installationDeadlineDays: dias }, {});
    expect(r).toBe(nota);
    expect(weighted(r, K)).toBe(pond);
  });
});

// ---------------------------------------------------------------------------
// 3. EMPRESA — Reclame Aqui (peso 3): Ruim 0,6 … RA1000 3
// ---------------------------------------------------------------------------
describe("Doc Francis — RA empresa (peso 3)", () => {
  const K = "company.reclame_aqui";
  // [rating, nota, ponderado-deve-ser]
  const T: Array<[ReputationRating, number, number | null]> = [
    ["ra_1000", 10, 3], ["otimo", 8, 2.4], ["bom", 6, 1.8], ["regular", 4, 1.2], ["ruim", 2, 0.6],
    ["nao_recomendado", 0, 0], ["suspensa", 0, 0], ["em_analise", 0, 0], ["sem_reputacao", null as never, null],
  ];
  it.each(T)("%s → ponderado %s", (rating, nota, pond) => {
    const r = raw(K, "company", { reclameAquiScore: rating }, {});
    expect(r).toBe(nota === (null as never) ? null : nota);
    expect(weighted(r, K)).toBe(pond);
  });
});

// ---------------------------------------------------------------------------
// 4. TEC — Marca módulo (peso 10): grupo 10/8/6/5 com NOMES REAIS
// ---------------------------------------------------------------------------
describe("Doc Francis — Marca módulo (peso 10, nomes reais paramentados)", () => {
  const K = "technical.module_brand";
  const T: Array<[string, number]> = [
    ["Jinko Solar", 10], ["LONGI", 10], ["Canadian Solar", 10], ["AIKO", 10],
    ["Trina Solar", 8], ["QCELLS", 8], ["Yingli Solar", 8],
    ["JA Solar", 6], ["DMEGC", 6], ["TCL Solar", 6],
    ["Risen", 5], ["Sunova", 5], ["Marca Fora da Lista", 5],
  ];
  it.each(T)("%s → %i pts", (brand, deveSer) => {
    const r = raw(K, "technical", {}, { moduleBrand: brand });
    expect(r).toBe(deveSer);
    expect(weighted(r, K)).toBe(deveSer);
  });
});

// ---------------------------------------------------------------------------
// 5. TEC — Garantia módulo (peso 10): 10a=4, 12a=7, 15a=10
// ---------------------------------------------------------------------------
describe("Doc Francis — Garantia módulo (peso 10)", () => {
  const K = "technical.module_defect_warranty";
  const T: Array<[number, number]> = [[10, 4], [12, 7], [15, 10]];
  it.each(T)("%i anos → %i pts", (anos, deveSer) => {
    const r = raw(K, "technical", {}, { moduleDefectWarrantyYears: anos });
    expect(r).toBe(deveSer);
    expect(weighted(r, K)).toBe(deveSer);
  });
});

// ---------------------------------------------------------------------------
// 6. TEC — Marca inversor (peso 10): grupo 9/8/7/6 com NOMES REAIS
// ---------------------------------------------------------------------------
describe("Doc Francis — Marca inversor (peso 10, nomes reais paramentados)", () => {
  const K = "technical.inverter_brand";
  const T: Array<[string, number]> = [
    ["Huawei", 9], ["Sungrow", 9], ["Gridtech", 9],
    ["Fronius", 8], ["GoodWe", 8], ["Voltmax", 8], ["Core Energy", 8],
    ["FoxESS", 7], ["SAJ", 7], ["Ampere Electronics", 7],
    ["Tsuness", 6], ["Must", 6], ["Inverso Tecnologia", 6], ["Marca Fora", 6],
  ];
  it.each(T)("%s → %i pts", (brand, deveSer) => {
    const r = raw(K, "technical", {}, { inverterBrand: brand });
    expect(r).toBe(deveSer);
    expect(weighted(r, K)).toBe(deveSer);
  });
});

// ---------------------------------------------------------------------------
// 7. TEC — Garantia inversor (peso 10): <5=0,5-7=5,8-10=6,11-14=8,15-20=9
// ---------------------------------------------------------------------------
describe("Doc Francis — Garantia inversor (peso 10)", () => {
  const K = "technical.inverter_defect_warranty";
  const T: Array<[number, number]> = [
    [4, 0], [5, 5], [7, 5], [8, 6], [10, 6], [11, 8], [14, 8], [15, 9], [20, 9],
  ];
  it.each(T)("%i anos → %i pts", (anos, deveSer) => {
    const r = raw(K, "technical", {}, { inverterDefectWarrantyYears: anos });
    expect(r).toBe(deveSer);
    expect(weighted(r, K)).toBe(deveSer);
  });
});

// ---------------------------------------------------------------------------
// 8. TEC — Sobrecarga DC/AC (peso 10): escala completa do doc (pico 1,30-1,34=9)
// ---------------------------------------------------------------------------
describe("Doc Francis — Sobrecarga DC/AC (peso 10)", () => {
  const K = "technical.inverter_oversizing";
  const T: Array<[number, number]> = [
    [1.0, 0], [1.01, 1], [1.04, 1], [1.05, 2], [1.09, 2], [1.1, 3], [1.14, 3],
    [1.15, 4], [1.19, 4], [1.2, 5], [1.24, 5], [1.25, 8], [1.29, 8], [1.3, 9],
    [1.34, 9], [1.35, 8], [1.39, 8], [1.4, 5], [1.44, 5], [1.45, 4], [1.49, 4],
    [1.5, 3], [1.54, 3], [1.55, 2], [1.59, 2], [1.6, 0],
  ];
  it.each(T)("ratio %f → %i pts", (ratio, deveSer) => {
    const r = raw(K, "technical", {}, { inverterOversizingRatio: ratio });
    expect(r).toBe(deveSer);
    expect(weighted(r, K)).toBe(deveSer);
  });
});

// ---------------------------------------------------------------------------
// 9-11. TEC — Reclame Aqui distribuidora(15) / fab.módulo(10) / fab.inversor(5)
// ---------------------------------------------------------------------------
type RepRow = [ReputationRating, number, number, number, number | null];
// [rating, nota, pond@15, pond@10, pond@5]  (— = null para sem_reputacao)
const REP: RepRow[] = [
  ["ra_1000", 10, 15, 10, 5],
  ["otimo", 8, 12, 8, 4],
  ["bom", 6, 9, 6, 3],
  ["regular", 4, 6, 4, 2],
  ["ruim", 2, 3.0, 2.0, 1.0],
  ["nao_recomendado", 0, 0, 0, 0],
  ["suspensa", 0, 0, 0, 0],
  ["em_analise", 0, 0, 0, 0],
  ["sem_reputacao", null as never, null as never, null as never, null],
];

describe("Doc Francis — RA distribuidora (peso 15)", () => {
  const K = "technical.reputation_distributor";
  it.each(REP)("%s → ponderado %s", (rating, _nota, p15) => {
    const r = raw(K, "technical", {}, { distributorScore: rating });
    expect(weighted(r, K)).toBe(rating === "sem_reputacao" ? null : p15);
  });
});
describe("Doc Francis — RA fabricante módulo (peso 10)", () => {
  const K = "technical.reputation_module_maker";
  it.each(REP)("%s → ponderado %s", (rating, _n, _p15, p10) => {
    const r = raw(K, "technical", {}, { moduleMakerScore: rating });
    expect(weighted(r, K)).toBe(rating === "sem_reputacao" ? null : p10);
  });
});
describe("Doc Francis — RA fabricante inversor (peso 5)", () => {
  const K = "technical.reputation_inverter_maker";
  it.each(REP)("%s → ponderado %s", (rating, _n, _p15, _p10, p5) => {
    const r = raw(K, "technical", {}, { inverterMakerScore: rating });
    expect(weighted(r, K)).toBe(rating === "sem_reputacao" ? null : p5);
  });
});

// ---------------------------------------------------------------------------
// MATRIZ IMPRESSA — o que o SISTEMA calcula (ponderado) vs o doc, lado a lado
// ---------------------------------------------------------------------------
describe("Doc Francis — matriz reputação ponderada (sistema vs doc)", () => {
  it("imprime e confere a matriz inteira", () => {
    const head =
      "rating".padEnd(16) +
      "Empresa(3)".padStart(12) +
      "Distrib(15)".padStart(13) +
      "FabMód(10)".padStart(12) +
      "FabInv(5)".padStart(11);
    const lines = [head, "-".repeat(head.length)];
    const cell = (key: string, set: TechnicalEvaluation, company: CompanyEvaluation = {}) =>
      String(weighted(raw(key, key.startsWith("company") ? "company" : "technical", company, set), key));
    for (const [rating, , p15, p10, p5] of REP) {
      const emp = weighted(raw("company.reclame_aqui", "company", { reclameAquiScore: rating }, {}), "company.reclame_aqui");
      const dis = weighted(raw("technical.reputation_distributor", "technical", {}, { distributorScore: rating }), "technical.reputation_distributor");
      const fmo = weighted(raw("technical.reputation_module_maker", "technical", {}, { moduleMakerScore: rating }), "technical.reputation_module_maker");
      const fin = weighted(raw("technical.reputation_inverter_maker", "technical", {}, { inverterMakerScore: rating }), "technical.reputation_inverter_maker");
      // empresa peso 3 (doc): RA1000=3, Ótimo=2.4, Bom=1.8, Regular=1.2, Ruim=0.6
      const empDoc = rating === "sem_reputacao" ? null : round1((p15 / 15) * 3);
      lines.push(
        rating.padEnd(16) +
          String(emp).padStart(12) +
          String(dis).padStart(13) +
          String(fmo).padStart(12) +
          String(fin).padStart(11),
      );
      expect(emp, `empresa ${rating}`).toBe(empDoc);
      expect(dis, `distrib ${rating}`).toBe(rating === "sem_reputacao" ? null : p15);
      expect(fmo, `fab.mód ${rating}`).toBe(rating === "sem_reputacao" ? null : p10);
      expect(fin, `fab.inv ${rating}`).toBe(rating === "sem_reputacao" ? null : p5);
      void cell;
    }
    // eslint-disable-next-line no-console
    console.log(`\n=== REPUTAÇÃO PONDERADA — SISTEMA (deve bater 100% com o doc) ===\n${lines.join("\n")}`);
  });
});

// ---------------------------------------------------------------------------
// MOMENTO DO CÁLCULO AUTOMÁTICO — auto preenche ao vivo só onde há dado, a
// célula mostra o ponderado, e a SOMA das células ponderadas = o Índice.
// Replica a mesma fórmula da UI (score-cell.tsx weightedOf) e o motor real.
// ---------------------------------------------------------------------------
const uuid = (n: number) => `${String(n).repeat(8)}-${String(n).repeat(4)}-4${String(n).repeat(3)}-8${String(n).repeat(3)}-${String(n).repeat(12)}`.slice(0, 36);
// Idêntica a score-cell.tsx:8 (o que a célula EXIBE em modo auto).
const weightedOfCell = (value: number | null, weight: number): number | null =>
  value == null ? null : Math.round((value / 10) * weight * 10) / 10;

function build(technical: TechnicalEvaluation, scoringMode: "auto" | "manual" = "auto"): ComparisonInput {
  return {
    id: uuid(1),
    title: "momento auto",
    status: "draft",
    scoringMode,
    selectedFinalistIds: [],
    competitors: [{ id: uuid(2), position: 1, companyName: "X", company: {}, technical, financial: {} }],
    scoreEntries: [],
    scoreSettings: [],
  };
}

describe("Momento do cálculo automático — célula ao vivo + soma = Índice", () => {
  it("auto preenche cada critério com dado e a soma das células ponderadas = pontos do Índice", () => {
    const technical: TechnicalEvaluation = {
      annualConsumptionKwh: 1000, annualGenerationKwh: 1050, // +5% → 10
      moduleBrand: "Jinko Solar", // 10
      moduleDefectWarrantyYears: 10, // 4
      moduleEfficiencyWarrantyYears: 30, // 10
      inverterBrand: "Huawei", // 9
      inverterDefectWarrantyYears: 12, // 8
      inverterOversizingRatio: 1.3, // 9
      distributorScore: "bom", // 6 (w15)
      moduleMakerScore: "ra_1000", // 10 (w10)
      inverterMakerScore: "ruim", // 2 (w5)
    };
    const comp = build(technical);
    const resolved = applyAutoScores(comp); // <- o "momento": auto preenche os nulls

    // 1) cada critério técnico com dado foi preenchido AO VIVO pela auto
    const techDefs = scoreDefinitions.filter((d) => d.category === "technical");
    let somaCelulas = 0;
    for (const d of techDefs) {
      const live = autoScoreFor(d.key, "technical", comp.competitors[0]);
      const entry = resolved.scoreEntries.find((e) => e.competitorId === uuid(2) && e.criterionKey === d.key);
      expect(entry?.score, `auto preencheu ${d.key}`).toBe(live);
      const cell = weightedOfCell(live, d.weight);
      if (cell != null) somaCelulas += cell;
    }

    // 2) a soma das células ponderadas = pontos/10 do motor (cells ↔ Índice)
    const tech = calculateComparisonResult(resolved).competitors[0].technicalScore;
    expect(Math.round(somaCelulas * 10) / 10).toBe(Math.round((tech.points / 10) * 10) / 10);
    // pontos esperados: 100+40+100+90+80+90+90(=6×15)+100+10(=2×5)+100 = 800 → índice 80
    expect(tech.points).toBe(800);
    expect(tech.index100).toBe(80);
    expect(tech.enabledCriteria).toBe(10);
  });

  it("critério SEM dado não pontua no momento auto (aparece '—', fora do Índice)", () => {
    // só distribuidora preenchida; resto null → célula "—" e renormaliza
    const tech = calculateComparisonResult(applyAutoScores(build({ distributorScore: "bom" }))).competitors[0].technicalScore;
    expect(tech.enabledCriteria).toBe(1); // só 1 critério com dado entrou
    expect(tech.index100).toBe(60); // (6/10)×100, renormalizado só sobre ele
    // os demais critérios técnicos: autoScoreFor = null (mostram "—")
    const semDado = autoScoreFor("technical.module_brand", "technical", { company: {}, technical: { distributorScore: "bom" }, financial: {} });
    expect(semDado).toBeNull();
  });

  it("override manual em modo auto troca só aquela célula; resto segue automático", () => {
    const comp = build({ moduleMakerScore: "ra_1000", distributorScore: "bom" });
    // comprador sobrepõe a distribuidora para 0 manualmente
    comp.scoreEntries = [{ competitorId: uuid(2), criterionKey: "technical.reputation_distributor", score: 0 }];
    const resolved = applyAutoScores(comp);
    const dist = resolved.scoreEntries.find((e) => e.criterionKey === "technical.reputation_distributor");
    const fab = resolved.scoreEntries.find((e) => e.criterionKey === "technical.reputation_module_maker");
    expect(dist?.score).toBe(0); // override manual preservado
    expect(fab?.score).toBe(10); // este segue automático (RA1000)
  });
});
