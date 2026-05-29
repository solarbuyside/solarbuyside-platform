import { companyScoreDefinitions, technicalScoreDefinitions } from "./score-definitions";
import type { ComparisonInput, ScoreDefinition, ScoreEntry } from "./types";

const ids = {
  comparison: "11111111-1111-4111-8111-111111111111",
  renova: "22222222-2222-4222-8222-222222222222",
  soli: "33333333-3333-4333-8333-333333333333",
  sge: "44444444-4444-4444-8444-444444444444",
  tap: "55555555-5555-4555-8555-555555555555",
  fotovolta: "66666666-6666-4666-8666-666666666666",
  self: "77777777-7777-4777-8777-777777777777",
};

function spreadScore(
  competitorId: string,
  definitions: readonly ScoreDefinition[],
  total: number,
): ScoreEntry[] {
  let remaining = total;

  return definitions
    .filter((definition) => definition.defaultEnabled)
    .map((definition) => {
      const score = Math.min(10, Math.max(0, remaining));
      remaining = Math.max(0, remaining - score);

      return {
        competitorId,
        criterionKey: definition.key,
        score,
      };
    });
}

export const sampleComparison: ComparisonInput = {
  id: ids.comparison,
  title: "Avaliacao de propostas Solar Buy-Side",
  status: "ready_for_review",
  scoringMode: "auto",
  selectedFinalistIds: [ids.renova, ids.soli],
  competitors: [
    {
      id: ids.renova,
      position: 1,
      companyName: "RENOVA",
      company: {
        solarSinceYear: 2021,
        companyFoundedYear: 2020,
        hasElectricalEngineeringCrea: "yes",
        engineerGraduationYear: 2004,
        installedSystemsRange: "gt_100",
        ownInstallationTeam: "no",
        installationDeadlineDays: 60,
        projectExecutionWarrantyYears: 3,
        hasMaintenanceSupport: "yes",
        supportDeadlineDays: 6,
        deliveredTechnicalDocs: "yes",
      },
      technical: {
        systemPowerKwp: 6.435,
        monthlyGenerationKwh: 727,
        annualGenerationKwh: 8732,
        moduleBrand: "HANERSUN",
        inverterBrand: "GOODWE",
        inverterReliability: "yes",
        moduleReliability: "unknown",
        distributorReliability: "yes",
      },
      financial: {
        monthlyBillWithoutSolar: 698.3,
        monthlyBillWithSolar: 141.14,
        monthlySavingsFirstYear: 557.16,
        annualSavingsFirstYear: 6685.92,
        accumulatedSavings25Years: 367455.61,
        totalInvestment: 17690,
        paymentDown: 9029.95,
        paymentEquipmentDelivery: 4330.02,
        paymentInstallationFinal: 4330.02,
        simplePaybackMonths: 31,
        annualReturnPct: 37.8,
        viabilityConfidence: "low",
      },
    },
    {
      id: ids.soli,
      position: 2,
      companyName: "SOLI SOLAR",
      company: {},
      technical: {},
      financial: { totalInvestment: 16342 },
    },
    {
      id: ids.sge,
      position: 3,
      companyName: "ENERGIA SGE",
      company: {},
      technical: {},
      financial: { totalInvestment: 15900 },
    },
    {
      id: ids.tap,
      position: 4,
      companyName: "TAP SOLAR",
      company: {},
      technical: {},
      financial: { totalInvestment: 14500 },
    },
    {
      id: ids.fotovolta,
      position: 5,
      companyName: "FOTOVOLTA EXPRESS",
      company: {},
      technical: {},
      financial: { totalInvestment: 17326.75 },
    },
    {
      id: ids.self,
      position: 6,
      companyName: "SELF SOLAR",
      company: {},
      technical: {},
      financial: { totalInvestment: 16500 },
    },
  ],
  scoreEntries: [
    ...spreadScore(ids.renova, companyScoreDefinitions, 81),
    ...spreadScore(ids.soli, companyScoreDefinitions, 92),
    ...spreadScore(ids.sge, companyScoreDefinitions, 26),
    ...spreadScore(ids.tap, companyScoreDefinitions, 46),
    ...spreadScore(ids.fotovolta, companyScoreDefinitions, 72),
    ...spreadScore(ids.self, companyScoreDefinitions, 41),
    ...spreadScore(ids.renova, technicalScoreDefinitions, 164),
    ...spreadScore(ids.soli, technicalScoreDefinitions, 172),
    ...spreadScore(ids.sge, technicalScoreDefinitions, 152),
    ...spreadScore(ids.tap, technicalScoreDefinitions, 166),
    ...spreadScore(ids.fotovolta, technicalScoreDefinitions, 137),
    ...spreadScore(ids.self, technicalScoreDefinitions, 161),
  ],
  scoreSettings: [],
};
