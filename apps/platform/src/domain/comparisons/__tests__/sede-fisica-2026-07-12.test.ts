import { describe, expect, it } from "vitest";

import { autoScoreFor, applyAutoScores } from "../auto-scoring";
import { calculateComparisonResult } from "../scoring";
import { companyScoreDefinitions } from "../score-definitions";
import type { ComparisonInput } from "../types";

/**
 * Sede física da empresa (Francis 2026-07-11, peso definido em 2026-07-12): novo
 * 14º critério de EMPRESA. Só Sim/Não (Sim=10, Não=5), peso 8. Os 8 pontos foram
 * abertos reduzindo 1 de cada um de 8 critérios maiores, então o grupo Empresa
 * continua fechando 100. Equipe própria (10), Prazo de instalação (5) e Reclame
 * Aqui (3) — reverificados pelo Francis em 2026-06-12 — ficaram intactos.
 */

const weightOf = (key: string) => companyScoreDefinitions.find((d) => d.key === key)?.weight;

describe("Sede física — nota automática (Sim=10, Não=5, só SIM/NÃO)", () => {
  const s = (v: unknown) =>
    autoScoreFor("company.physical_headquarters", "company", {
      company: { hasPhysicalHeadquarters: v as never },
      technical: {},
      financial: {},
    });
  it("Sim → 10", () => expect(s("yes")).toBe(10));
  it("Não → 5", () => expect(s("no")).toBe(5));
  it("sem dado → null (fora do índice, não penaliza)", () => expect(s(undefined)).toBeNull());
});

describe("Sede física — peso 8 e grupo Empresa fecha 100", () => {
  it("peso da sede = 8", () => {
    expect(weightOf("company.physical_headquarters")).toBe(8);
  });

  it("Empresa tem 14 critérios somando 100", () => {
    expect(companyScoreDefinitions).toHaveLength(14);
    expect(companyScoreDefinitions.reduce((t, d) => t + d.weight, 0)).toBe(100);
  });

  it("rebalanceamento 2026-07-12: 8 critérios cederam 1 ponto; os reverificados ficaram", () => {
    const w = Object.fromEntries(companyScoreDefinitions.map((d) => [d.key, d.weight]));
    // reduzidos em 1 para abrir os 8 da sede
    expect(w["company.execution_warranty"]).toBe(14); // era 15
    expect(w["company.solar_since_year"]).toBe(9); // era 10
    expect(w["company.installed_systems"]).toBe(9); // era 10
    expect(w["company.maintenance_support"]).toBe(9); // era 10
    expect(w["company.crea_registration"]).toBe(8); // era 9
    expect(w["company.engineer_graduation_year"]).toBe(8); // era 9
    expect(w["company.support_deadline"]).toBe(4); // era 5
    expect(w["company.technical_docs_delivered"]).toBe(4); // era 5
    // intactos (reverificados pelo Francis em 2026-06-12)
    expect(w["company.own_installation_team"]).toBe(10);
    expect(w["company.installation_deadline"]).toBe(5);
    expect(w["company.reclame_aqui"]).toBe(3);
    expect(w["company.founded_year"]).toBe(4);
    expect(w["company.seller_trust"]).toBe(5);
  });
});

describe("Sede física — motor ponta-a-ponta (peso 8)", () => {
  const uuid = (n: number) =>
    `${String(n).repeat(8)}-${String(n).repeat(4)}-4${String(n).repeat(3)}-8${String(n).repeat(3)}-${String(n).repeat(12)}`.slice(0, 36);
  const build = (v: "yes" | "no"): ComparisonInput => ({
    id: uuid(1),
    title: "sede física",
    status: "draft",
    scoringMode: "auto",
    selectedFinalistIds: [],
    competitors: [
      { id: uuid(2), position: 1, companyName: "X", company: { hasPhysicalHeadquarters: v }, technical: {}, financial: {} },
    ],
    scoreEntries: [],
    scoreSettings: [],
  });

  it("Sim: único critério com dado → 80/80 pts → índice 100 (renormaliza sobre ele)", () => {
    const co = calculateComparisonResult(applyAutoScores(build("yes"))).competitors[0].companyScore;
    expect(co.enabledCriteria).toBe(1);
    expect(co.points).toBe(80); // (10/10)×8 → 10×8
    expect(co.maxPoints).toBe(80); // 10×8
    expect(co.index100).toBe(100);
  });

  it("Não: único critério com dado → 40/80 pts → nota 5/10 → índice 50", () => {
    const co = calculateComparisonResult(applyAutoScores(build("no"))).competitors[0].companyScore;
    expect(co.points).toBe(40); // 5×8
    expect(co.maxPoints).toBe(80); // 10×8
    expect(co.index100).toBe(50);
  });
});
