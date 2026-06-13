import { describe, expect, it } from "vitest";

import { autoScoreFor, applyAutoScores } from "../auto-scoring";
import { scoreDefinitions } from "../score-definitions";
import { calculateComparisonResult, summarizeCategoryScore } from "../scoring";
import type { ComparisonInput, CompanyEvaluation, TechnicalEvaluation } from "../types";
import type { ReputationRating } from "../reputation";

/**
 * BATERIA DE VERIFICAÇÃO — doc "VERIFICAÇÃO DO SISTEMA DE ATRIBUIÇÃO DE PESO"
 * (Francis, 2026-06-12). Simula o usuário ponta-a-ponta: valor do formulário →
 * nota automática → valor PONDERADO exibido na célula → Índice de Confiabilidade.
 * Cada caso afirma o número EXATO que o Francis pediu ("deve ser"). Os console.log
 * imprimem tabelas legíveis para conferência manual.
 */

const WEIGHT = new Map(scoreDefinitions.map((d) => [d.key, d.weight] as const));
const round1 = (n: number) => Math.round(n * 10) / 10;
/** Valor ponderado exibido na célula no modo automático: (nota/10) × peso. */
const weightedCell = (nota: number | null, key: string): number | null =>
  nota == null ? null : round1((nota / 10) * (WEIGHT.get(key) ?? 0));

const co = (company: CompanyEvaluation = {}, technical: TechnicalEvaluation = {}) => ({
  company,
  technical,
  financial: {},
});

// --------------------------------------------------------------------------
// 1. REPUTAÇÃO (Reclame Aqui) — os 4 critérios, todas as categorias
// --------------------------------------------------------------------------

type RepCase = { rating: ReputationRating | "none"; rawDeveSer: number | null };
const REP_CASES: RepCase[] = [
  { rating: "ra_1000", rawDeveSer: 10 },
  { rating: "otimo", rawDeveSer: 8 },
  { rating: "bom", rawDeveSer: 6 },
  { rating: "regular", rawDeveSer: 4 },
  { rating: "ruim", rawDeveSer: 2 },
  { rating: "nao_recomendado", rawDeveSer: 0 },
  { rating: "suspensa", rawDeveSer: 0 },
  { rating: "em_analise", rawDeveSer: 0 },
  { rating: "sem_reputacao", rawDeveSer: null },
  { rating: "none", rawDeveSer: null },
];

const REP_CRITERIA = [
  { key: "company.reclame_aqui", peso: 3, set: (v: ReputationRating | undefined): [CompanyEvaluation, TechnicalEvaluation] => [{ reclameAquiScore: v ?? null }, {}], cat: "company" as const },
  { key: "technical.reputation_distributor", peso: 15, set: (v: ReputationRating | undefined): [CompanyEvaluation, TechnicalEvaluation] => [{}, { distributorScore: v ?? null }], cat: "technical" as const },
  { key: "technical.reputation_module_maker", peso: 10, set: (v: ReputationRating | undefined): [CompanyEvaluation, TechnicalEvaluation] => [{}, { moduleMakerScore: v ?? null }], cat: "technical" as const },
  { key: "technical.reputation_inverter_maker", peso: 5, set: (v: ReputationRating | undefined): [CompanyEvaluation, TechnicalEvaluation] => [{}, { inverterMakerScore: v ?? null }], cat: "technical" as const },
];

describe("Francis 2026-06-12 — Reputação (Reclame Aqui): nota crua e PONDERADA por critério", () => {
  for (const crit of REP_CRITERIA) {
    it(`${crit.key} (peso ${crit.peso})`, () => {
      const rows: string[] = [];
      for (const c of REP_CASES) {
        const v = c.rating === "none" ? undefined : c.rating;
        const [company, technical] = crit.set(v);
        const raw = autoScoreFor(crit.key, crit.cat, co(company, technical));
        const w = weightedCell(raw, crit.key);
        const wDeveSer = c.rawDeveSer == null ? null : round1((c.rawDeveSer / 10) * crit.peso);
        rows.push(
          `  ${String(c.rating).padEnd(16)} nota=${String(raw).padStart(4)}  ponderado=${String(w).padStart(5)}  (deve ser ${String(wDeveSer).padStart(5)})`,
        );
        expect(raw, `${crit.key} / ${c.rating} nota crua`).toBe(c.rawDeveSer);
        expect(w, `${crit.key} / ${c.rating} ponderado`).toBe(wDeveSer);
      }
      // eslint-disable-next-line no-console
      console.log(`\n[${crit.key}] peso ${crit.peso}\n${rows.join("\n")}`);
    });
  }
});

// --------------------------------------------------------------------------
// 2. PRAZO DE INSTALAÇÃO (peso 5) — tabela exata dias→nota
// --------------------------------------------------------------------------

describe("Francis 2026-06-12 — Prazo de instalação (dias→nota, peso 5)", () => {
  it("tabela exata + interpolação por snap + clamp", () => {
    const table: Array<[number, number]> = [
      [30, 0], [35, 1], [40, 2], [45, 10], [50, 9], [55, 8], [60, 7], [65, 6], [70, 5], [75, 4], [80, 3],
    ];
    const rows: string[] = [];
    for (const [dias, deveSer] of table) {
      const raw = autoScoreFor("company.installation_deadline", "company", co({ installationDeadlineDays: dias }));
      rows.push(`  ${String(dias).padStart(3)} dias → nota ${raw} (deve ser ${deveSer}) · ponderado ${weightedCell(raw, "company.installation_deadline")}`);
      expect(raw, `${dias} dias`).toBe(deveSer);
    }
    // fora da tabela / intermediários
    expect(autoScoreFor("company.installation_deadline", "company", co({ installationDeadlineDays: 22 }))).toBe(0); // <30 → 30
    expect(autoScoreFor("company.installation_deadline", "company", co({ installationDeadlineDays: 120 }))).toBe(3); // >80 → 80
    expect(autoScoreFor("company.installation_deadline", "company", co({ installationDeadlineDays: 47 }))).toBe(10); // snap 45
    expect(autoScoreFor("company.installation_deadline", "company", co({ installationDeadlineDays: 48 }))).toBe(9); // snap 50
    expect(autoScoreFor("company.installation_deadline", "company", co({}))).toBeNull(); // sem dado
    // eslint-disable-next-line no-console
    console.log(`\n[Prazo de instalação] peso 5\n${rows.join("\n")}\n  fora: 22→0, 120→3, 47→10(snap45), 48→9(snap50), vazio→null`);
  });
});

// --------------------------------------------------------------------------
// 3. EQUIPE DE INSTALAÇÃO (própria/dúvida/terceirizada)
// --------------------------------------------------------------------------

describe("Francis 2026-06-12 — Equipe de instalação", () => {
  it("própria=10, tenho dúvida=7, terceirizada=4", () => {
    expect(autoScoreFor("company.own_installation_team", "company", co({ ownInstallationTeam: "own" }))).toBe(10);
    expect(autoScoreFor("company.own_installation_team", "company", co({ ownInstallationTeam: "unknown" }))).toBe(7);
    expect(autoScoreFor("company.own_installation_team", "company", co({ ownInstallationTeam: "outsourced" }))).toBe(4);
    expect(autoScoreFor("company.own_installation_team", "company", co({}))).toBeNull();
  });
});

// --------------------------------------------------------------------------
// 4. GARANTIAS (módulo e inversor)
// --------------------------------------------------------------------------

describe("Francis 2026-06-12 — Garantias contra defeito", () => {
  it("módulo: 10 anos=4 (CRÍTICO), 12=7, 15=10; <10=1", () => {
    const m = (y: number) => autoScoreFor("technical.module_defect_warranty", "technical", co({}, { moduleDefectWarrantyYears: y }));
    expect(m(9)).toBe(1);
    expect(m(10)).toBe(4); // NÃO pode ser 7
    expect(m(11)).toBe(4);
    expect(m(12)).toBe(7);
    expect(m(14)).toBe(7);
    expect(m(15)).toBe(10);
    expect(m(20)).toBe(10);
  });

  it("inversor: <5=0, 5-7=5, 8-10=6, 11-14=8, 15-20=9", () => {
    const i = (y: number) => autoScoreFor("technical.inverter_defect_warranty", "technical", co({}, { inverterDefectWarrantyYears: y }));
    expect(i(4)).toBe(0);
    expect(i(5)).toBe(5);
    expect(i(7)).toBe(5);
    expect(i(8)).toBe(6);
    expect(i(10)).toBe(6);
    expect(i(11)).toBe(8);
    expect(i(14)).toBe(8);
    expect(i(15)).toBe(9);
    expect(i(20)).toBe(9);
    expect(i(30)).toBe(9);
  });
});

// --------------------------------------------------------------------------
// 5. SOBRECARGA DC/AC — escala completa
// --------------------------------------------------------------------------

describe("Francis 2026-06-12 — Sobrecarga DC/AC (pico 1,30-1,34=9)", () => {
  it("varre todas as faixas e os limites", () => {
    const s = (r: number) => autoScoreFor("technical.inverter_oversizing", "technical", co({}, { inverterOversizingRatio: r }));
    const bands: Array<[number, number]> = [
      [1.0, 0], [1.01, 1], [1.04, 1], [1.05, 2], [1.09, 2], [1.1, 3], [1.14, 3],
      [1.15, 4], [1.19, 4], [1.2, 5], [1.24, 5], [1.25, 8], [1.29, 8], [1.3, 9],
      [1.34, 9], [1.35, 8], [1.39, 8], [1.4, 5], [1.44, 5], [1.45, 4], [1.49, 4],
      [1.5, 3], [1.54, 3], [1.55, 2], [1.59, 2], [1.6, 0], [1.8, 0], [0.9, 0],
    ];
    const rows: string[] = [];
    for (const [r, deveSer] of bands) {
      const raw = s(r);
      rows.push(`  ${r.toFixed(2)} → ${raw} (deve ser ${deveSer})`);
      expect(raw, `ratio ${r}`).toBe(deveSer);
    }
    // eslint-disable-next-line no-console
    console.log(`\n[Sobrecarga DC/AC] peso 10\n${rows.join("\n")}`);
  });
});

// --------------------------------------------------------------------------
// 6. MARCAS (módulo e inversor) — nomes reais por grupo
// --------------------------------------------------------------------------

describe("Francis 2026-06-12 — Marcas por grupo (nomes reais)", () => {
  it("módulo: grupo 10/8/6/5", () => {
    const m = (b: string) => autoScoreFor("technical.module_brand", "technical", co({}, { moduleBrand: b }));
    expect(m("Jinko Solar")).toBe(10);
    expect(m("LONGI")).toBe(10);
    expect(m("Canadian Solar")).toBe(10);
    expect(m("TW Solar")).toBe(10); // consta em 5 e 10 → maior
    expect(m("Trina Solar")).toBe(8);
    expect(m("QCells")).toBe(8);
    expect(m("DMEGC")).toBe(6);
    expect(m("TCL Solar")).toBe(6);
    expect(m("Risen")).toBe(5); // grupo 5
    expect(m("Marca Inexistente XYZ")).toBe(5); // fallback
  });

  it("inversor: grupo 9/8/7/6 (Canadian→7, APSystems→8)", () => {
    const i = (b: string) => autoScoreFor("technical.inverter_brand", "technical", co({}, { inverterBrand: b }));
    expect(i("Huawei")).toBe(9);
    expect(i("Sungrow")).toBe(9);
    expect(i("Gridtech")).toBe(9);
    expect(i("Fronius")).toBe(8);
    expect(i("GoodWe")).toBe(8);
    expect(i("Voltmax")).toBe(8);
    expect(i("Core Energy")).toBe(8);
    expect(i("APSystems")).toBe(8); // está em 8 e 7 → maior
    expect(i("Deye")).toBe(8);
    expect(i("FoxESS")).toBe(7);
    expect(i("Canadian")).toBe(7); // movida do 8 para o 7
    expect(i("Ampere Electronics")).toBe(7);
    expect(i("Tsuness")).toBe(6);
    expect(i("Inverso Tecnologia")).toBe(6);
    expect(i("Marca Inexistente XYZ")).toBe(6); // fallback
  });
});

// --------------------------------------------------------------------------
// 7. ENGINE PONTA-A-PONTA — Índice de Confiabilidade (modo automático)
// --------------------------------------------------------------------------

const uuid = (n: number) => `${String(n).repeat(8)}-${String(n).repeat(4)}-4${String(n).repeat(3)}-8${String(n).repeat(3)}-${String(n).repeat(12)}`.slice(0, 36);

function buildComparison(technical: TechnicalEvaluation, company: CompanyEvaluation = {}): ComparisonInput {
  return {
    id: uuid(1),
    title: "verificação ponta-a-ponta",
    status: "draft",
    scoringMode: "auto",
    selectedFinalistIds: [],
    competitors: [{ id: uuid(2), position: 1, companyName: "TESTE", company, technical, financial: {} }],
    scoreEntries: [],
    scoreSettings: [],
  };
}

describe("Francis 2026-06-12 — Índice de Confiabilidade ponta-a-ponta (motor real)", () => {
  it("só distribuidora=bom (w15) + fab. módulo=RA1000 (w10) → índice 76/100", () => {
    const comp = buildComparison({ distributorScore: "bom", moduleMakerScore: "ra_1000" });
    const result = calculateComparisonResult(applyAutoScores(comp));
    const tech = result.competitors[0].technicalScore;
    // distribuidora: 6×15=90 / 150 ; fab módulo: 10×10=100 / 100 → 190/250 = 7,6
    expect(tech.points).toBe(190);
    expect(tech.maxPoints).toBe(250);
    expect(tech.grade10).toBe(7.6);
    expect(tech.index100).toBe(76);
    expect(tech.enabledCriteria).toBe(2); // só os 2 com nota entram
    // eslint-disable-next-line no-console
    console.log(`\n[Engine] distribuidora=bom + fab.módulo=RA1000 → pts=${tech.points}/${tech.maxPoints}, nota ${tech.grade10}/10, Índice ${tech.index100}/100`);
  });

  it("SUSPENSA penaliza (entra como 0) e SEM REPUTAÇÃO é excluída — diferença gritante", () => {
    // Ambos com fab. módulo = RA1000 (nota 10, w10). Distribuidora varia.
    const comSuspensa = calculateComparisonResult(
      applyAutoScores(buildComparison({ distributorScore: "suspensa", moduleMakerScore: "ra_1000" })),
    ).competitors[0].technicalScore;
    const comSemRep = calculateComparisonResult(
      applyAutoScores(buildComparison({ distributorScore: "sem_reputacao", moduleMakerScore: "ra_1000" })),
    ).competitors[0].technicalScore;

    // suspensa: 0×15=0 (max +150) + 100 = 100/250 = 4,0 → 40
    expect(comSuspensa.index100).toBe(40);
    expect(comSuspensa.enabledCriteria).toBe(2);
    // sem reputação: distribuidora fora → só 100/100 = 10,0 → 100
    expect(comSemRep.index100).toBe(100);
    expect(comSemRep.enabledCriteria).toBe(1);
    // eslint-disable-next-line no-console
    console.log(`\n[Engine] suspensa → Índice ${comSuspensa.index100}/100 (penaliza) · sem reputação → ${comSemRep.index100}/100 (não penaliza)`);
  });

  it("modo MANUAL: Índice é a média simples das notas (sem peso)", () => {
    const manual: ComparisonInput = {
      ...buildComparison({}),
      scoringMode: "manual",
      scoreEntries: [
        { competitorId: uuid(2), criterionKey: "technical.annual_generation", score: 4 },
        { competitorId: uuid(2), criterionKey: "technical.module_brand", score: 8 },
      ],
    };
    const tech = calculateComparisonResult(applyAutoScores(manual)).competitors[0].technicalScore;
    expect(tech.grade10).toBe(6); // média simples de 4 e 8
    expect(tech.index100).toBe(60);
  });
});

// --------------------------------------------------------------------------
// 8. RESUMO IMPRESSO — tabela de reputação ponderada por critério (Francis)
// --------------------------------------------------------------------------

describe("Francis 2026-06-12 — resumo impresso", () => {
  it("imprime a matriz reputação × critério (ponderado)", () => {
    const header = "Categoria".padEnd(18) + "Empresa(3)  Distrib(15)  FabMód(10)  FabInv(5)";
    const lines = [header, "-".repeat(header.length)];
    for (const c of REP_CASES) {
      if (c.rating === "none") continue;
      const cells = REP_CRITERIA.map((crit) => {
        const v = c.rating as ReputationRating;
        const [company, technical] = crit.set(v);
        const raw = autoScoreFor(crit.key, crit.cat, co(company, technical));
        return String(weightedCell(raw, crit.key)).padStart(8);
      });
      lines.push(String(c.rating).padEnd(18) + cells.join("   "));
    }
    // eslint-disable-next-line no-console
    console.log(`\n=== REPUTAÇÃO PONDERADA (o que aparece na célula) ===\n${lines.join("\n")}`);
    expect(lines.length).toBeGreaterThan(5);
  });
});
