import { describe, expect, it } from "vitest";

import { autoScoreFor } from "../auto-scoring";
import { formatAnswer } from "../comparison-rows";
import { oversizingRatio, oversizingRatioLabel, oversizingStoredValue } from "../oversizing";
import { technicalFormFields } from "../workflow";

/**
 * CORREÇÕES Francis 2026-06-30 (screenshots): label "Tenho dúvida" no
 * comparativo, sobrecarga exibida como razão, marcas grupo 10 com grafia real,
 * e prefixo "Reclame Aqui -" no fabricante de inversor.
 */

const mod = (b: string) =>
  autoScoreFor("technical.module_brand", "technical", { company: {}, technical: { moduleBrand: b }, financial: {} });
const inv = (b: string) =>
  autoScoreFor("technical.inverter_brand", "technical", { company: {}, technical: { inverterBrand: b }, financial: {} });

// --------------------------------------------------------------------------
// 1. MARCA MÓDULO — grafias reais que o Francis viu cair no fallback (5)
// --------------------------------------------------------------------------
describe("Correção — marca módulo: grafias reais entram no grupo 10", () => {
  it.each([
    ["zshine", 10], ["ZShine", 10], ["znshine", 10], ["ZNSHINE", 10],
    ["h-saee", 10], ["h-saae", 10], ["H-SAAE", 10],
    ["canadian", 10], ["Canadian", 10], ["Canadian Solar", 10],
    ["Jinko Solar", 10], ["LONGI", 10], ["phono", 10], ["AIKO", 10], ["TW Solar", 10],
  ])("%s → %i", (brand, deveSer) => {
    expect(mod(brand)).toBe(deveSer);
  });

  it("não cria falso-positivo (guarda startsWith): genéricos seguem no grupo certo", () => {
    expect(mod("Solar")).toBe(5); // 'solar' não é prefixo de 'canadiansolar'
    expect(mod("Risen")).toBe(5); // grupo 5 (listada como 'outras')
    expect(mod("Sunova")).toBe(5);
    expect(mod("Trina Solar")).toBe(8); // não virou 10 por engano
    expect(mod("DMEGC")).toBe(6);
    expect(mod("Marca Inexistente XYZ")).toBe(5);
  });

  it("inversor não é afetado: 'Canadian' (inversor) segue grupo 7", () => {
    expect(inv("Canadian")).toBe(7);
    expect(inv("Huawei")).toBe(9);
    expect(inv("Core Energy")).toBe(8);
  });
});

// --------------------------------------------------------------------------
// 2. LABEL DO COMPARATIVO — equipe unknown = "Tenho dúvida" (não "Não sei")
// --------------------------------------------------------------------------
describe("Correção — formatAnswer ciente do campo", () => {
  it("ownInstallationTeam: own/unknown/outsourced", () => {
    expect(formatAnswer("own", "choice", "ownInstallationTeam")).toBe("Equipe própria");
    expect(formatAnswer("unknown", "choice", "ownInstallationTeam")).toBe("Tenho dúvida");
    expect(formatAnswer("outsourced", "choice", "ownInstallationTeam")).toBe("Equipe terceirizada");
  });

  it("installedSystemsRange: unknown CONTINUA 'Não sei' (não pode virar 'Tenho dúvida')", () => {
    expect(formatAnswer("unknown", "choice", "installedSystemsRange")).toBe("Não sei");
    expect(formatAnswer("gt_1000", "choice", "installedSystemsRange")).toBe("+ de 1.000");
  });

  it("tri_state genérico (CREA etc.) sem prop: unknown = 'Não sei'", () => {
    expect(formatAnswer("unknown", "tri_state")).toBe("Não sei");
    expect(formatAnswer("yes", "tri_state")).toBe("Sim");
  });
});

// --------------------------------------------------------------------------
// 3. SOBRECARGA — exibe a RAZÃO (0,80), não a % (-20%)
// --------------------------------------------------------------------------
describe("Correção — sobrecarga calculada (razão kWp/kW)", () => {
  it("razão = kWp/kW", () => {
    expect(oversizingRatio(6.43, 8)).toBeCloseTo(0.80375, 5);
    expect(oversizingRatio(10.4, 8)).toBeCloseTo(1.3, 5);
    expect(oversizingRatio(null, 8)).toBeNull();
    expect(oversizingRatio(6.43, 0)).toBeNull();
  });

  it("label = razão 2 casas pt-BR (ex.: 6,43/8 → '0,80', NÃO '-20%')", () => {
    expect(oversizingRatioLabel(oversizingRatio(6.43, 8))).toBe("0,80");
    expect(oversizingRatioLabel(1.3)).toBe("1,30");
    expect(oversizingRatioLabel(1.285)).toBe("1,29");
    expect(oversizingRatioLabel(null)).toBe("—");
  });

  it("valor armazenado = razão 3 casas (pontuação intacta)", () => {
    expect(oversizingStoredValue(oversizingRatio(6.43, 8))).toBe(0.804);
    expect(oversizingStoredValue(null)).toBeNull();
  });
});

// --------------------------------------------------------------------------
// 4. LABEL "Reclame Aqui -" no fabricante de inversor
// --------------------------------------------------------------------------
describe("Correção — label fabricante de inversor", () => {
  it("inverterMakerName tem prefixo 'Reclame Aqui -'", () => {
    const f = technicalFormFields.find((x) => x.key === "technical.inverterMakerName");
    expect(f?.label).toBe("Reclame Aqui - fabricante de inversor de corrente (String, Microinversor ou Híbrido)");
  });

  it("oversizing perdeu o 'em %' do label", () => {
    const f = technicalFormFields.find((x) => x.key === "technical.inverterOversizingRatio");
    expect(f?.label).toBe("Sobrecarga calculada (kWp/kW)");
  });
});
