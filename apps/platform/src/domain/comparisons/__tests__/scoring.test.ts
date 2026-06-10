import { describe, expect, it } from "vitest";
import { calculateComparisonResult } from "../scoring";
import { sampleComparison } from "../sample-data";

const round2 = (v: number) => Math.round(v * 100) / 100;

describe("comparison scoring", () => {
  it("mantém a viabilidade financeira fora do total (informativa)", () => {
    const result = calculateComparisonResult(sampleComparison);
    for (const c of result.competitors) {
      expect(c.financialScore.enabledCriteria).toBe(0);
      // Total = Empresa + Tecnologia (financeiro não soma).
      expect(c.totalScore.points).toBe(round2(c.companyScore.points + c.technicalScore.points));
    }
  });

  it("expõe o índice 0–100 = nota ponderada × 10", () => {
    const result = calculateComparisonResult(sampleComparison);
    for (const c of result.competitors) {
      expect(c.companyScore.index100).toBe(round2(c.companyScore.grade10 * 10));
      expect(c.totalScore.index100).toBe(round2(c.totalScore.grade10 * 10));
      expect(c.companyScore.index100).toBeLessThanOrEqual(100);
    }
  });

  it("recomenda as duas propostas de maior pontuação ponderada", () => {
    const result = calculateComparisonResult({ ...sampleComparison, selectedFinalistIds: [] });
    expect(result.recommendedFinalistIds).toHaveLength(2);

    const byId = (id: string) => result.competitors.find((c) => c.competitorId === id)!;
    const recommended = result.recommendedFinalistIds.map(byId);
    const others = result.competitors.filter(
      (c) => !result.recommendedFinalistIds.includes(c.competitorId),
    );
    // Nenhum descartado pontua mais que um finalista recomendado.
    for (const r of recommended) {
      for (const o of others) {
        expect(r.totalScore.grade10).toBeGreaterThanOrEqual(o.totalScore.grade10);
      }
    }
    expect(result.selectedFinalistIds).toEqual(result.recommendedFinalistIds);
  });

  it("preserva os finalistas escolhidos pelo comprador quando são exatamente dois", () => {
    const result = calculateComparisonResult(sampleComparison);
    expect(result.selectedFinalistIds).toEqual(sampleComparison.selectedFinalistIds);
  });

  it("conta um critério ad-hoc só quando o comprador o liga", () => {
    const renova = "22222222-2222-4222-8222-222222222222";
    const base = calculateComparisonResult(sampleComparison).competitors.find(
      (c) => c.competitorId === renova,
    )!;
    // Liga uma linha informativa (technical.moduleCount) com peso 1 e nota 8.
    const withAdHoc = calculateComparisonResult({
      ...sampleComparison,
      scoreSettings: [{ criterionKey: "technical.moduleCount", enabled: true, weight: 1 }],
      scoreEntries: [
        ...sampleComparison.scoreEntries,
        { competitorId: renova, criterionKey: "technical.moduleCount", score: 8 },
      ],
    }).competitors.find((c) => c.competitorId === renova)!;

    expect(withAdHoc.technicalScore.enabledCriteria).toBe(base.technicalScore.enabledCriteria + 1);
    expect(withAdHoc.technicalScore.maxPoints).toBe(round2(base.technicalScore.maxPoints + 10));
    expect(withAdHoc.technicalScore.points).toBe(round2(base.technicalScore.points + 8));
  });
});
