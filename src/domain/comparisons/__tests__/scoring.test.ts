import { describe, expect, it } from "vitest";
import { calculateComparisonResult } from "../scoring";
import { sampleComparison } from "../sample-data";

describe("comparison scoring", () => {
  it("keeps financial viability out of the total score", () => {
    const result = calculateComparisonResult(sampleComparison);
    const soli = result.competitors.find((competitor) => competitor.companyName === "SOLI SOLAR");
    const tap = result.competitors.find((competitor) => competitor.companyName === "TAP SOLAR");

    expect(soli?.investment).toBe(16342);
    expect(tap?.investment).toBe(14500);
    expect(soli?.totalScore.points).toBe(264);
    expect(tap?.totalScore.points).toBe(212);
    expect(soli?.rank).toBe(1);
  });

  it("recommends the two highest scored proposals by default", () => {
    const result = calculateComparisonResult({
      ...sampleComparison,
      selectedFinalistIds: [],
    });

    expect(result.recommendedFinalistIds).toEqual([
      "33333333-3333-4333-8333-333333333333",
      "22222222-2222-4222-8222-222222222222",
    ]);
    expect(result.selectedFinalistIds).toEqual(result.recommendedFinalistIds);
  });

  it("preserves buyer-selected finalists when exactly two are selected", () => {
    const result = calculateComparisonResult(sampleComparison);

    expect(result.selectedFinalistIds).toEqual(sampleComparison.selectedFinalistIds);
  });

  it("counts an ad-hoc manual criterion only when the buyer enables it", () => {
    const renova = "22222222-2222-4222-8222-222222222222";
    const base = calculateComparisonResult(sampleComparison).competitors.find(
      (c) => c.competitorId === renova,
    )!;
    // Liga uma linha informativa (technical.moduleCount) e dá nota 8.
    const withAdHoc = calculateComparisonResult({
      ...sampleComparison,
      scoreSettings: [{ criterionKey: "technical.moduleCount", enabled: true, weight: 1 }],
      scoreEntries: [
        ...sampleComparison.scoreEntries,
        { competitorId: renova, criterionKey: "technical.moduleCount", score: 8 },
      ],
    }).competitors.find((c) => c.competitorId === renova)!;

    expect(withAdHoc.technicalScore.enabledCriteria).toBe(base.technicalScore.enabledCriteria + 1);
    expect(withAdHoc.technicalScore.maxPoints).toBe(base.technicalScore.maxPoints + 10);
    expect(withAdHoc.technicalScore.points).toBe(base.technicalScore.points + 8);
  });
});
