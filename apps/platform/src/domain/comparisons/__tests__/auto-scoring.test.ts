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

  it("prazo de instalação: mais rápido, melhor (escala monotônica sinalizada)", () => {
    expect(autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: 30 }))).toBe(10);
    expect(autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: 45 }))).toBe(10);
    expect(autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: 60 }))).toBe(4);
    expect(autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: 90 }))).toBe(1);
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

  it("marca do inversor: grupos 6/7/8/9 (não listada = 6)", () => {
    expect(autoScoreFor("technical.inverter_brand", "technical", competitor({}, { inverterBrand: "Huawei" }))).toBe(9);
    expect(autoScoreFor("technical.inverter_brand", "technical", competitor({}, { inverterBrand: "GoodWe" }))).toBe(8);
    expect(autoScoreFor("technical.inverter_brand", "technical", competitor({}, { inverterBrand: "FoxESS" }))).toBe(7);
    expect(autoScoreFor("technical.inverter_brand", "technical", competitor({}, { inverterBrand: "Tsuness" }))).toBe(6);
    expect(autoScoreFor("technical.inverter_brand", "technical", competitor({}, { inverterBrand: "Xpto" }))).toBe(6);
  });

  it("garantia do módulo (defeito/eficiência) e do inversor", () => {
    expect(autoScoreFor("technical.module_defect_warranty", "technical", competitor({}, { moduleDefectWarrantyYears: 15 }))).toBe(10);
    expect(autoScoreFor("technical.module_defect_warranty", "technical", competitor({}, { moduleDefectWarrantyYears: 12 }))).toBe(7);
    expect(autoScoreFor("technical.module_defect_warranty", "technical", competitor({}, { moduleDefectWarrantyYears: 10 }))).toBe(4);
    expect(autoScoreFor("technical.module_efficiency_warranty", "technical", competitor({}, { moduleEfficiencyWarrantyYears: 30 }))).toBe(10);
    expect(autoScoreFor("technical.module_efficiency_warranty", "technical", competitor({}, { moduleEfficiencyWarrantyYears: 25 }))).toBe(6);
    expect(autoScoreFor("technical.inverter_defect_warranty", "technical", competitor({}, { inverterDefectWarrantyYears: 15 }))).toBe(10);
    expect(autoScoreFor("technical.inverter_defect_warranty", "technical", competitor({}, { inverterDefectWarrantyYears: 8 }))).toBe(4);
    expect(autoScoreFor("technical.inverter_defect_warranty", "technical", competitor({}, { inverterDefectWarrantyYears: 4 }))).toBe(0);
  });

  it("sobrecarga: faixa ideal 1,25–1,40 pontua alto; fora dela, menos", () => {
    expect(autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: 1.35 }))).toBe(10);
    expect(autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: 1.25 }))).toBe(8);
    expect(autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: 1.2 }))).toBe(5);
    expect(autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: 0.9 }))).toBe(0);
    expect(autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: 1.6 }))).toBe(0);
  });

  it("reputação (Reclame Aqui): escala 0/2/4/6/8/10; sem reputação = null", () => {
    expect(autoScoreFor("technical.reputation_distributor", "technical", competitor({}, { distributorScore: "bom" }))).toBe(6);
    expect(autoScoreFor("technical.reputation_module_maker", "technical", competitor({}, { moduleMakerScore: "otimo" }))).toBe(8);
    expect(autoScoreFor("technical.reputation_inverter_maker", "technical", competitor({}, { inverterMakerScore: "ra_1000" }))).toBe(10);
    expect(autoScoreFor("technical.reputation_distributor", "technical", competitor({}, { distributorScore: "nao_recomendado" }))).toBe(0);
    expect(autoScoreFor("technical.reputation_distributor", "technical", competitor({}, { distributorScore: "em_analise" }))).toBeNull();
    expect(autoScoreFor("technical.reputation_distributor", "technical", competitor({}, { distributorScore: "suspensa" }))).toBeNull();
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
