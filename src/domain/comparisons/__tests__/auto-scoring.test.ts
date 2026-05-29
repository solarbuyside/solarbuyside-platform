import { describe, expect, it } from "vitest";

import { autoScoreFor, isManualCriterion } from "../auto-scoring";
import type { CompanyEvaluation, TechnicalEvaluation } from "../types";

const year = new Date().getFullYear();

function competitor(
  company: CompanyEvaluation = {},
  technical: TechnicalEvaluation = {},
) {
  return { company, technical };
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

  it("leaves brand/reputation criteria manual (null)", () => {
    expect(autoScoreFor("technical.module_brand", "technical", competitor({}, { moduleBrand: "Tier 1" }))).toBeNull();
    expect(isManualCriterion("technical.module_brand")).toBe(true);
    expect(isManualCriterion("company.seller_trust")).toBe(true);
    expect(isManualCriterion("company.crea_registration")).toBe(false);
  });
});
