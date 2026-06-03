import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { buildInitialDraftComparisonStructure } from "../draft-structure";
import { companyScoreDefinitions, technicalScoreDefinitions } from "../score-definitions";
import { companyEvaluationSchema } from "../types";
import {
  companyFormFields,
  comparisonWorkflow,
  comparisonWorkflowSummary,
  financialFormFields,
  technicalFormFields,
} from "../workflow";

const competitors = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    position: 1,
    companyName: "RENOVA",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    position: 2,
    companyName: "SOLI SOLAR",
  },
];

describe("comparison workflow", () => {
  it("tracks the spreadsheet creation process in order", () => {
    expect(comparisonWorkflow.map((step) => step.id)).toEqual([
      "company_form",
      "technical_form",
      "financial_form",
      "company_scoring",
      "technical_scoring",
      "final_decision",
    ]);
  });

  it("keeps field and scoring counts aligned with the source spreadsheet", () => {
    expect(companyFormFields).toHaveLength(13);
    // Slide 12: cada item do Reclame Aqui virou nome + nota (24 -> 27 campos).
    expect(technicalFormFields).toHaveLength(27);
    expect(financialFormFields).toHaveLength(15);

    expect(companyScoreDefinitions).toHaveLength(13);
    expect(technicalScoreDefinitions).toHaveLength(22);
    // Slide 19: 4 critérios de viabilidade passam a pontuar (rubric provisório).
    // Slide 12: os 3 critérios de reputação do Reclame Aqui passam a contar.
    expect(comparisonWorkflowSummary.enabledCompanyCriteriaCount).toBe(13);
    expect(comparisonWorkflowSummary.enabledTechnicalCriteriaCount).toBe(22);
    expect(comparisonWorkflowSummary.enabledFinancialCriteriaCount).toBe(4);
    expect(comparisonWorkflowSummary.totalCriteriaCount).toBe(39);
    expect(comparisonWorkflowSummary.financialAffectsScore).toBe(true);
  });

  it("scores Reclame Aqui reputation criteria from the buyer's typed note (slide 12)", () => {
    // Todos os critérios técnicos passam a estar habilitados por padrão.
    expect(technicalScoreDefinitions.filter((definition) => !definition.defaultEnabled)).toHaveLength(0);
  });

  // Guarda contra o bug do slide 5/6: app envia valor que o CHECK do banco
  // rejeita. Mantém os enums Zod alinhados com os CHECKs do manual-setup.sql.
  it("keeps company choice enums in sync with the database CHECK constraints", () => {
    const sql = readFileSync(
      resolve(__dirname, "../../../../supabase/manual-setup.sql"),
      "utf-8",
    );
    const shape = companyEvaluationSchema.shape;

    function checkValuesFor(column: string): string[] {
      const re = new RegExp(`${column} in \\(([^)]*)\\)`, "i");
      const match = sql.match(re);
      if (!match) throw new Error(`CHECK não encontrado para ${column}`);
      return match[1]
        .split(",")
        .map((s) => s.trim().replace(/^'|'$/g, ""))
        .sort();
    }

    function zodValues(field: "installedSystemsRange" | "ownInstallationTeam"): string[] {
      // Cada campo é z.enum(...).nullable().optional() — desembrulha até o enum.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let def: any = shape[field];
      while (def && def.def && def.def.innerType) def = def.def.innerType;
      return [...(def.def.entries ? Object.values(def.def.entries) : def.options)].sort() as string[];
    }

    expect(zodValues("installedSystemsRange")).toEqual(checkValuesFor("installed_systems_range"));
    expect(zodValues("ownInstallationTeam")).toEqual(checkValuesFor("own_installation_team"));
  });
});

describe("initial draft comparison structure", () => {
  it("creates empty rows for every form and scoring table when a draft is created", () => {
    const structure = buildInitialDraftComparisonStructure(
      "11111111-1111-4111-8111-111111111111",
      competitors,
    );

    expect(structure.companyEvaluations).toHaveLength(2);
    expect(structure.technicalEvaluations).toHaveLength(2);
    expect(structure.financialEvaluations).toHaveLength(2);
    expect(structure.scoreSettings).toHaveLength(comparisonWorkflowSummary.totalCriteriaCount);
    expect(structure.scoreEntries).toHaveLength(competitors.length * comparisonWorkflowSummary.totalCriteriaCount);
    expect(structure.scoreEntries.every((entry) => entry.score === null)).toBe(true);
  });
});
