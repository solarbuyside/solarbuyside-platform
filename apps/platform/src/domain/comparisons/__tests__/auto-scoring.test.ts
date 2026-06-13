import { describe, expect, it } from "vitest";

import { autoScoreFor, isManualCriterion } from "../auto-scoring";
import type { CompanyEvaluation, FinancialEvaluation, TechnicalEvaluation } from "../types";

const year = new Date().getFullYear();

function competitor(
  company: CompanyEvaluation = {},
  technical: TechnicalEvaluation = {},
  financial: FinancialEvaluation = {},
) {
  return { company, technical, financial };
}

describe("auto-scoring — company (slide 6)", () => {
  it("atuação no ramo: 1 ponto por ano (2016 ou antes = 10)", () => {
    expect(autoScoreFor("company.solar_since_year", "company", competitor({ solarSinceYear: year - 12 }))).toBe(10);
    expect(autoScoreFor("company.solar_since_year", "company", competitor({ solarSinceYear: year - 6 }))).toBe(6);
    expect(autoScoreFor("company.solar_since_year", "company", competitor({ solarSinceYear: year - 3 }))).toBe(3);
    expect(autoScoreFor("company.solar_since_year", "company", competitor({ solarSinceYear: year }))).toBe(0);
  });

  it("retorna null quando não há dado", () => {
    expect(autoScoreFor("company.solar_since_year", "company", competitor({}))).toBeNull();
  });

  it("CREA: Sim=10, Não=0, Não sei=5", () => {
    expect(autoScoreFor("company.crea_registration", "company", competitor({ hasElectricalEngineeringCrea: "yes" }))).toBe(10);
    expect(autoScoreFor("company.crea_registration", "company", competitor({ hasElectricalEngineeringCrea: "no" }))).toBe(0);
    expect(autoScoreFor("company.crea_registration", "company", competitor({ hasElectricalEngineeringCrea: "unknown" }))).toBe(5);
  });

  it("prazo de instalação: escala exata do Francis 2026-06-12 (45 dias = ideal = 10)", () => {
    const s = (d: number) =>
      autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: d }));
    expect(s(45)).toBe(10);
    expect(s(50)).toBe(9);
    expect(s(60)).toBe(7);
    expect(s(80)).toBe(3);
    expect(s(40)).toBe(2);
    expect(s(35)).toBe(1);
    expect(s(30)).toBe(0);
    expect(s(22)).toBe(0); // <30 → clamp para 30 = 0
    expect(s(90)).toBe(3); // >80 → clamp para 80 = 3
    expect(s(47)).toBe(10); // snap p/ 45
    expect(s(48)).toBe(9); // snap p/ 50
  });

  it("garantia de execução: 2 pontos por ano (5+ = 10)", () => {
    expect(autoScoreFor("company.execution_warranty", "company", competitor({ projectExecutionWarrantyYears: 5 }))).toBe(10);
    expect(autoScoreFor("company.execution_warranty", "company", competitor({ projectExecutionWarrantyYears: 3 }))).toBe(6);
    expect(autoScoreFor("company.execution_warranty", "company", competitor({ projectExecutionWarrantyYears: 1 }))).toBe(2);
  });

  it("quantidade de SFV: 10-49=2 … +1000=10", () => {
    expect(autoScoreFor("company.installed_systems", "company", competitor({ installedSystemsRange: "gt_1000" }))).toBe(10);
    expect(autoScoreFor("company.installed_systems", "company", competitor({ installedSystemsRange: "gt_100" }))).toBe(6);
    expect(autoScoreFor("company.installed_systems", "company", competitor({ installedSystemsRange: "10_49" }))).toBe(2);
    expect(autoScoreFor("company.installed_systems", "company", competitor({ installedSystemsRange: "lt_10" }))).toBe(0);
    expect(autoScoreFor("company.installed_systems", "company", competitor({ installedSystemsRange: "unknown" }))).toBeNull();
  });

  it("equipe de instalação: própria=10, tenho dúvida=7, terceirizada=4 (Francis 2026-06-12)", () => {
    const s = (v: CompanyEvaluation["ownInstallationTeam"]) =>
      autoScoreFor("company.own_installation_team", "company", competitor({ ownInstallationTeam: v }));
    expect(s("own")).toBe(10);
    expect(s("unknown")).toBe(7);
    expect(s("outsourced")).toBe(4);
    expect(autoScoreFor("company.own_installation_team", "company", competitor({}))).toBeNull();
  });
});

describe("auto-scoring — technical (slides 8/10)", () => {
  it("geração anual: (geração−consumo)/consumo, −5%=0, 0%=5, +5%=10", () => {
    const t = (consumo: number, geracao: number) =>
      autoScoreFor("technical.annual_generation", "technical", competitor({}, { annualConsumptionKwh: consumo, annualGenerationKwh: geracao }));
    expect(t(9000, 9000)).toBe(5); // 0%
    expect(t(9000, 9000 * 1.05)).toBe(10); // +5%
    expect(t(9000, 9000 * 0.95)).toBe(0); // −5%
    expect(t(9000, 8731)).toBe(2); // −2,99% → −3% → 2 (exemplo do slide 9)
  });

  it("geração anual sem consumo ou geração → null", () => {
    expect(autoScoreFor("technical.annual_generation", "technical", competitor({}, { annualGenerationKwh: 9000 }))).toBeNull();
  });

  it("marca do módulo: grupos 5/6/8/10 (não listada = 5)", () => {
    expect(autoScoreFor("technical.module_brand", "technical", competitor({}, { moduleBrand: "Jinko Solar" }))).toBe(10);
    expect(autoScoreFor("technical.module_brand", "technical", competitor({}, { moduleBrand: "TRINA SOLAR" }))).toBe(8);
    expect(autoScoreFor("technical.module_brand", "technical", competitor({}, { moduleBrand: "DMEGC" }))).toBe(6);
    expect(autoScoreFor("technical.module_brand", "technical", competitor({}, { moduleBrand: "Hanersun" }))).toBe(5);
    expect(autoScoreFor("technical.module_brand", "technical", competitor({}, { moduleBrand: "Marca Desconhecida" }))).toBe(5);
    expect(autoScoreFor("technical.module_brand", "technical", competitor({}, {}))).toBeNull();
  });

  it("marca do inversor: grupos 6/7/8/9 (lista Francis 2026-06-12; não listada = 6)", () => {
    const s = (b: string) => autoScoreFor("technical.inverter_brand", "technical", competitor({}, { inverterBrand: b }));
    expect(s("Huawei")).toBe(9);
    expect(s("Gridtech")).toBe(9); // novo no grupo 9
    expect(s("GoodWe")).toBe(8);
    expect(s("Voltmax")).toBe(8); // novo no grupo 8
    expect(s("Core Energy")).toBe(8); // novo no grupo 8
    expect(s("APSystems")).toBe(8); // consta em 8 e 7 → usa o maior (8)
    expect(s("FoxESS")).toBe(7);
    expect(s("Canadian")).toBe(7); // movida do grupo 8 para o 7
    expect(s("Ampere Electronics")).toBe(7); // novo no grupo 7
    expect(s("Tsuness")).toBe(6);
    expect(s("Inverso Tecnologia")).toBe(6); // novo no grupo 6
    expect(s("Xpto")).toBe(6); // não listada = 6
  });

  it("garantia do módulo (defeito/eficiência) e do inversor", () => {
    expect(autoScoreFor("technical.module_defect_warranty", "technical", competitor({}, { moduleDefectWarrantyYears: 15 }))).toBe(10);
    expect(autoScoreFor("technical.module_defect_warranty", "technical", competitor({}, { moduleDefectWarrantyYears: 12 }))).toBe(7);
    expect(autoScoreFor("technical.module_defect_warranty", "technical", competitor({}, { moduleDefectWarrantyYears: 10 }))).toBe(4);
    expect(autoScoreFor("technical.module_efficiency_warranty", "technical", competitor({}, { moduleEfficiencyWarrantyYears: 30 }))).toBe(10);
    expect(autoScoreFor("technical.module_efficiency_warranty", "technical", competitor({}, { moduleEfficiencyWarrantyYears: 25 }))).toBe(6);
    expect(autoScoreFor("technical.inverter_defect_warranty", "technical", competitor({}, { inverterDefectWarrantyYears: 15 }))).toBe(9);
    expect(autoScoreFor("technical.inverter_defect_warranty", "technical", competitor({}, { inverterDefectWarrantyYears: 12 }))).toBe(8);
    expect(autoScoreFor("technical.inverter_defect_warranty", "technical", competitor({}, { inverterDefectWarrantyYears: 9 }))).toBe(6);
    expect(autoScoreFor("technical.inverter_defect_warranty", "technical", competitor({}, { inverterDefectWarrantyYears: 6 }))).toBe(5);
    expect(autoScoreFor("technical.inverter_defect_warranty", "technical", competitor({}, { inverterDefectWarrantyYears: 4 }))).toBe(0);
  });

  it("sobrecarga: escala exata do Francis 2026-06-12 (pico 1,30–1,34 = 9)", () => {
    const s = (r: number) => autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: r }));
    expect(s(1.32)).toBe(9); // pico
    expect(s(1.27)).toBe(8);
    expect(s(1.37)).toBe(8); // simétrico do 1,25–1,29
    expect(s(1.22)).toBe(5);
    expect(s(1.42)).toBe(5); // simétrico do 1,20–1,24
    expect(s(1.03)).toBe(1);
    expect(s(1.57)).toBe(2);
    expect(s(1.0)).toBe(0); // ≤1,0
    expect(s(0.9)).toBe(0);
    expect(s(1.6)).toBe(0); // ≥1,60
  });

  it("reputação (Reclame Aqui): RA1000=10…Ruim=2; não rec./suspensa/em análise=0; sem reputação=null", () => {
    const d = (v: string) => autoScoreFor("technical.reputation_distributor", "technical", competitor({}, { distributorScore: v as never }));
    expect(autoScoreFor("technical.reputation_distributor", "technical", competitor({}, { distributorScore: "bom" }))).toBe(6);
    expect(autoScoreFor("technical.reputation_module_maker", "technical", competitor({}, { moduleMakerScore: "otimo" }))).toBe(8);
    expect(autoScoreFor("technical.reputation_inverter_maker", "technical", competitor({}, { inverterMakerScore: "ra_1000" }))).toBe(10);
    expect(d("ruim")).toBe(2);
    expect(d("regular")).toBe(4);
    expect(d("nao_recomendado")).toBe(0);
    expect(d("suspensa")).toBe(0); // Francis 2026-06-12: 0, não null
    expect(d("em_analise")).toBe(0); // idem
    expect(d("sem_reputacao")).toBeNull(); // único que não pontua
    expect(autoScoreFor("technical.reputation_distributor", "technical", competitor({}, {}))).toBeNull();
  });

  it("critérios técnicos informativos (slide '/') não pontuam", () => {
    expect(autoScoreFor("technical.module_power_w", "technical", competitor({}, { modulePowerW: 600 }))).toBeNull();
    expect(autoScoreFor("technical.system_power_kwp", "technical", competitor({}, { systemPowerKwp: 6 }))).toBeNull();
  });
});

describe("auto-scoring — manual / informativo", () => {
  it("confiança no vendedor é manual; marca e reputação são automáticas", () => {
    expect(isManualCriterion("company.seller_trust")).toBe(true);
    expect(isManualCriterion("technical.module_brand")).toBe(false);
    expect(isManualCriterion("technical.reputation_distributor")).toBe(false);
    expect(isManualCriterion("company.crea_registration")).toBe(false);
  });

  it("viabilidade financeira não é pontuada (informativa)", () => {
    expect(autoScoreFor("financial.simple_payback", "financial", competitor({}, {}, { simplePaybackMonths: 40 }))).toBeNull();
  });
});
