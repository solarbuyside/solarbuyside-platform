import { describe, expect, it } from "vitest";

import {
  companyComparisonRows,
  technicalComparisonRows,
  financialComparisonRows,
  formatAnswer,
} from "../comparison-rows";
import {
  companyScoreDefinitions,
  technicalScoreDefinitions,
} from "../score-definitions";

describe("comparison-rows — casamento pergunta×nota", () => {
  it("empresa: toda definição de score tem uma linha correspondente", () => {
    const keys = new Set(companyComparisonRows.filter((r) => r.scoreKey).map((r) => r.scoreKey));
    expect(keys.size).toBe(companyScoreDefinitions.length);
    for (const def of companyScoreDefinitions) expect(keys.has(def.key)).toBe(true);
  });

  it("técnico: toda definição de score tem uma linha correspondente", () => {
    const keys = new Set(technicalComparisonRows.filter((r) => r.scoreKey).map((r) => r.scoreKey));
    // Toda definição canônica está presente (além de linhas informativas que
    // viraram critérios sintéticos pontuáveis manualmente).
    for (const def of technicalScoreDefinitions) expect(keys.has(def.key)).toBe(true);
    expect(keys.size).toBeGreaterThanOrEqual(technicalScoreDefinitions.length);
  });

  it("não há scoreKey duplicado entre as linhas", () => {
    const all = [...companyComparisonRows, ...technicalComparisonRows]
      .filter((r) => r.scoreKey)
      .map((r) => r.scoreKey);
    expect(all.length).toBe(new Set(all).size);
  });

  it("campos informativos viram critérios sintéticos desligados por padrão", () => {
    const moduleCount = technicalComparisonRows.find((r) => r.prop === "moduleCount");
    expect(moduleCount?.scoreKey).toBe("technical.moduleCount");
    expect(moduleCount?.defaultEnabled).toBe(false);
  });

  it("financeiro é só informativo (sem scoreKey no tipo)", () => {
    expect(financialComparisonRows.length).toBeGreaterThan(0);
    expect(financialComparisonRows.every((r) => !("scoreKey" in r) || !r.scoreKey)).toBe(true);
  });
});

describe("formatAnswer", () => {
  it("formata tri-state, choice, moeda e percentual", () => {
    expect(formatAnswer("yes", "tri_state")).toBe("Sim");
    expect(formatAnswer("gt_100", "choice")).toBe("+ de 100");
    expect(formatAnswer(17690, "currency")).toContain("17");
    expect(formatAnswer(22.6, "percentage")).toBe("22.6%");
    expect(formatAnswer(null, "number")).toBe("—");
  });
});
