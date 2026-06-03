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

describe("auto-scoring — company", () => {
  it("scores years in the solar business by band", () => {
    expect(autoScoreFor("company.solar_since_year", "company", competitor({ solarSinceYear: year - 12 }))).toBe(10);
    expect(autoScoreFor("company.solar_since_year", "company", competitor({ solarSinceYear: year - 6 }))).toBe(7);
    expect(autoScoreFor("company.solar_since_year", "company", competitor({ solarSinceYear: year - 3 }))).toBe(4);
    expect(autoScoreFor("company.solar_since_year", "company", competitor({ solarSinceYear: year - 1 }))).toBe(1);
  });

  it("returns null when the field is missing", () => {
    expect(autoScoreFor("company.solar_since_year", "company", competitor({}))).toBeNull();
  });

  it("scores CREA as yes/no with unknown in the middle", () => {
    expect(autoScoreFor("company.crea_registration", "company", competitor({ hasElectricalEngineeringCrea: "yes" }))).toBe(10);
    expect(autoScoreFor("company.crea_registration", "company", competitor({ hasElectricalEngineeringCrea: "no" }))).toBe(1);
    expect(autoScoreFor("company.crea_registration", "company", competitor({ hasElectricalEngineeringCrea: "unknown" }))).toBeGreaterThan(1);
  });

  it("scores installation deadline by day thresholds", () => {
    expect(autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: 30 }))).toBe(10);
    expect(autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: 45 }))).toBe(7);
    expect(autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: 60 }))).toBe(4);
    expect(autoScoreFor("company.installation_deadline", "company", competitor({ installationDeadlineDays: 90 }))).toBe(1);
  });

  it("maps installed systems range", () => {
    expect(autoScoreFor("company.installed_systems", "company", competitor({ installedSystemsRange: "gt_100" }))).toBe(10);
    expect(autoScoreFor("company.installed_systems", "company", competitor({ installedSystemsRange: "lt_10" }))).toBe(1);
    expect(autoScoreFor("company.installed_systems", "company", competitor({ installedSystemsRange: "unknown" }))).toBeNull();
  });
});

describe("auto-scoring — technical", () => {
  it("scores module power by watts", () => {
    expect(autoScoreFor("technical.module_power_w", "technical", competitor({}, { modulePowerW: 600 }))).toBe(10);
    expect(autoScoreFor("technical.module_power_w", "technical", competitor({}, { modulePowerW: 500 }))).toBe(7);
    expect(autoScoreFor("technical.module_power_w", "technical", competitor({}, { modulePowerW: 400 }))).toBe(4);
    expect(autoScoreFor("technical.module_power_w", "technical", competitor({}, { modulePowerW: 300 }))).toBe(1);
  });

  it("scores inverter oversizing inside the ideal band", () => {
    expect(autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: 1.3 }))).toBe(10);
    expect(autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: 1.2 }))).toBe(7);
    expect(autoScoreFor("technical.inverter_oversizing", "technical", competitor({}, { inverterOversizingRatio: 1.6 }))).toBe(4);
  });

  it("leaves brand criteria manual (null)", () => {
    expect(autoScoreFor("technical.module_brand", "technical", competitor({}, { moduleBrand: "Tier 1" }))).toBeNull();
    expect(isManualCriterion("technical.module_brand")).toBe(true);
    expect(isManualCriterion("company.seller_trust")).toBe(true);
    expect(isManualCriterion("company.crea_registration")).toBe(false);
  });

  it("scores Reclame Aqui reputation from the typed note (slide 12)", () => {
    expect(autoScoreFor("technical.reputation_distributor", "technical", competitor({}, { distributorScore: 6.8 }))).toBe(6.8);
    expect(autoScoreFor("technical.reputation_module_maker", "technical", competitor({}, { moduleMakerScore: 9 }))).toBe(9);
    expect(autoScoreFor("technical.reputation_inverter_maker", "technical", competitor({}, { inverterMakerScore: 12 }))).toBe(10);
    expect(autoScoreFor("technical.reputation_distributor", "technical", competitor({}, {}))).toBeNull();
    // A reputação deixou de ser manual — a nota digitada já é a pontuação.
    expect(isManualCriterion("technical.reputation_distributor")).toBe(false);
  });
});

describe("auto-scoring — financial (viabilidade, rubric provisório slide 19)", () => {
  it("scores simple payback by month thresholds", () => {
    expect(autoScoreFor("financial.simple_payback", "financial", competitor({}, {}, { simplePaybackMonths: 40 }))).toBe(10);
    expect(autoScoreFor("financial.simple_payback", "financial", competitor({}, {}, { simplePaybackMonths: 72 }))).toBe(7);
    expect(autoScoreFor("financial.simple_payback", "financial", competitor({}, {}, { simplePaybackMonths: 96 }))).toBe(4);
    expect(autoScoreFor("financial.simple_payback", "financial", competitor({}, {}, { simplePaybackMonths: 120 }))).toBe(1);
  });

  it("scores annual return and ROI by band", () => {
    expect(autoScoreFor("financial.annual_return", "financial", competitor({}, {}, { annualReturnPct: 20 }))).toBe(10);
    expect(autoScoreFor("financial.annual_return", "financial", competitor({}, {}, { annualReturnPct: 5 }))).toBe(1);
    expect(autoScoreFor("financial.roi", "financial", competitor({}, {}, { roiMultiplier: 5 }))).toBe(10);
    expect(autoScoreFor("financial.roi", "financial", competitor({}, {}, { roiMultiplier: 2 }))).toBe(1);
  });

  it("scores viability confidence with unknown in the middle", () => {
    expect(autoScoreFor("financial.viability_confidence", "financial", competitor({}, {}, { viabilityConfidence: "high" }))).toBe(10);
    expect(autoScoreFor("financial.viability_confidence", "financial", competitor({}, {}, { viabilityConfidence: "medium" }))).toBe(6);
    expect(autoScoreFor("financial.viability_confidence", "financial", competitor({}, {}, { viabilityConfidence: "low" }))).toBe(3);
    expect(autoScoreFor("financial.viability_confidence", "financial", competitor({}, {}, { viabilityConfidence: "unknown" }))).toBe(5);
  });

  it("returns null when financial data is missing", () => {
    expect(autoScoreFor("financial.simple_payback", "financial", competitor({}, {}, {}))).toBeNull();
  });
});
