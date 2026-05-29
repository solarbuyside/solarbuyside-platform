import { scoreDefinitions } from "./score-definitions";
import type {
  CompanyEvaluation,
  ComparisonInput,
  CompetitorProposal,
  ScoreEntry,
  TechnicalEvaluation,
  TriStateAnswer,
} from "./types";

/**
 * Auto-scoring: converts interview data into a 0-10 score per criterion, using
 * the rubrics defined in `score-definitions.ts`. This is the executable form of
 * those text rubrics. The buyer can always override a suggested score manually.
 *
 * A criterion returns `null` when there is not enough data to score it yet
 * (e.g. the field was not filled during the interview), so the UI can show "—"
 * instead of a misleading 0.
 *
 * Subjective criteria (seller empathy) and the manual Reclame Aqui note are not
 * auto-scored — they come straight from the buyer's input.
 */

const currentYear = new Date().getFullYear();

/** Picks the score for the first matching threshold. `bands` is high→low. */
function band(
  value: number,
  bands: Array<{ min: number; score: number }>,
): number {
  for (const { min, score } of bands) {
    if (value >= min) return score;
  }
  return bands[bands.length - 1]?.score ?? 1;
}

function yesNoScore(answer: TriStateAnswer | null | undefined, yes = 10, other = 1) {
  if (!answer) return null;
  if (answer === "yes") return yes;
  if (answer === "unknown") return Math.round((yes + other) / 2);
  return other;
}

// --- Company criteria --------------------------------------------------------

function scoreCompany(key: string, c: CompanyEvaluation): number | null {
  switch (key) {
    case "company.solar_since_year": {
      if (c.solarSinceYear == null) return null;
      const years = currentYear - c.solarSinceYear;
      return band(years, [
        { min: 10, score: 10 },
        { min: 5, score: 7 },
        { min: 2, score: 4 },
        { min: 0, score: 1 },
      ]);
    }
    case "company.founded_year": {
      if (c.companyFoundedYear == null) return null;
      const years = currentYear - c.companyFoundedYear;
      return band(years, [
        { min: 15, score: 10 },
        { min: 8, score: 7 },
        { min: 3, score: 4 },
        { min: 0, score: 1 },
      ]);
    }
    case "company.crea_registration":
      return yesNoScore(c.hasElectricalEngineeringCrea);
    case "company.engineer_graduation_year": {
      if (c.engineerGraduationYear == null) return null;
      const years = currentYear - c.engineerGraduationYear;
      return band(years, [
        { min: 10, score: 10 },
        { min: 5, score: 7 },
        { min: 2, score: 4 },
        { min: 0, score: 1 },
      ]);
    }
    case "company.installed_systems": {
      if (!c.installedSystemsRange || c.installedSystemsRange === "unknown") return null;
      const map: Record<string, number> = {
        gt_100: 10,
        "50_100": 7,
        "10_49": 4,
        lt_10: 1,
      };
      return map[c.installedSystemsRange] ?? null;
    }
    case "company.own_installation_team": {
      if (!c.ownInstallationTeam || c.ownInstallationTeam === "unknown") return null;
      const map: Record<string, number> = {
        yes: 10,
        outsourced_known: 5,
        no: 1,
      };
      return map[c.ownInstallationTeam] ?? null;
    }
    case "company.installation_deadline": {
      if (c.installationDeadlineDays == null) return null;
      const d = c.installationDeadlineDays;
      if (d <= 30) return 10;
      if (d <= 45) return 7;
      if (d <= 60) return 4;
      return 1;
    }
    case "company.execution_warranty": {
      if (c.projectExecutionWarrantyYears == null) return null;
      const y = c.projectExecutionWarrantyYears;
      if (y >= 5) return 10;
      if (y >= 3) return 7;
      if (y >= 1) return 4;
      return 1;
    }
    case "company.maintenance_support":
      return yesNoScore(c.hasMaintenanceSupport);
    case "company.support_deadline": {
      if (c.supportDeadlineDays == null) return null;
      const d = c.supportDeadlineDays;
      if (d <= 3) return 10;
      if (d <= 7) return 7;
      if (d <= 15) return 4;
      return 1;
    }
    case "company.technical_docs_delivered":
      return yesNoScore(c.deliveredTechnicalDocs);
    case "company.seller_trust":
      // Subjective: use buyer's direct 0-10 input as-is.
      return c.sellerTrustScore ?? null;
    case "company.reclame_aqui":
      // Manual Reclame Aqui note (0-10) entered by the buyer.
      return c.reclameAquiScore ?? null;
    default:
      return null;
  }
}

// --- Technical criteria ------------------------------------------------------

function scoreTechnical(key: string, t: TechnicalEvaluation): number | null {
  switch (key) {
    case "technical.system_power_kwp":
      // Proportional to need — without the target consumption we cannot judge;
      // leave for manual scoring.
      return null;
    case "technical.monthly_generation":
    case "technical.annual_generation":
      // Coverage of consumption requires the consumption baseline; manual.
      return null;
    case "technical.module_power_w": {
      if (t.modulePowerW == null) return null;
      const w = t.modulePowerW;
      if (w >= 550) return 10;
      if (w >= 450) return 7;
      if (w >= 350) return 4;
      return 1;
    }
    case "technical.module_weight_kg": {
      if (t.moduleWeightKg == null) return null;
      const kg = t.moduleWeightKg;
      if (kg <= 25) return 10;
      if (kg <= 30) return 7;
      if (kg <= 35) return 4;
      return 1;
    }
    case "technical.module_efficiency_pct": {
      if (t.moduleEfficiencyPct == null) return null;
      const e = t.moduleEfficiencyPct;
      if (e >= 22) return 10;
      if (e >= 20) return 7;
      if (e >= 18) return 4;
      return 1;
    }
    case "technical.module_lifetime_efficiency_pct": {
      if (t.moduleLifetimeEfficiencyPct == null) return null;
      const e = t.moduleLifetimeEfficiencyPct;
      if (e >= 85) return 10;
      if (e >= 80) return 7;
      if (e >= 75) return 4;
      return 1;
    }
    case "technical.module_defect_warranty": {
      if (t.moduleDefectWarrantyYears == null) return null;
      const y = t.moduleDefectWarrantyYears;
      if (y >= 12) return 10;
      if (y >= 8) return 7;
      if (y >= 5) return 4;
      return 1;
    }
    case "technical.module_efficiency_warranty": {
      if (t.moduleEfficiencyWarrantyYears == null) return null;
      const y = t.moduleEfficiencyWarrantyYears;
      if (y >= 30) return 10;
      if (y >= 25) return 7;
      return 4;
    }
    case "technical.inverter_defect_warranty": {
      if (t.inverterDefectWarrantyYears == null) return null;
      const y = t.inverterDefectWarrantyYears;
      if (y >= 10) return 10;
      if (y >= 7) return 7;
      if (y >= 5) return 4;
      return 1;
    }
    case "technical.inverter_oversizing": {
      if (t.inverterOversizingRatio == null) return null;
      const r = t.inverterOversizingRatio;
      if (r >= 1.25 && r <= 1.35) return 10;
      if ((r >= 1.15 && r < 1.25) || (r > 1.35 && r <= 1.45)) return 7;
      return 4;
    }
    case "technical.inverter_reliability":
      return yesNoScore(t.inverterReliability);
    case "technical.module_reliability":
      return yesNoScore(t.moduleReliability);
    case "technical.distributor_reliability":
      return yesNoScore(t.distributorReliability);
    // Brand/model and reputation criteria need a tier/reputation classification
    // that the interview does not capture as a number — keep manual.
    case "technical.module_brand":
    case "technical.module_model":
    case "technical.inverter_brand":
    case "technical.inverter_model":
    case "technical.inverter_power_kw":
    case "technical.reputation_distributor":
    case "technical.reputation_module_maker":
    case "technical.reputation_inverter_maker":
      return null;
    default:
      return null;
  }
}

export type AutoScore = {
  criterionKey: string;
  category: "company" | "technical";
  score: number | null;
  /** False when this criterion is left to manual judgement. */
  auto: boolean;
};

const MANUAL_KEYS = new Set<string>([
  "company.seller_trust",
  "company.reclame_aqui",
  "technical.system_power_kwp",
  "technical.monthly_generation",
  "technical.annual_generation",
  "technical.module_brand",
  "technical.module_model",
  "technical.inverter_brand",
  "technical.inverter_model",
  "technical.inverter_power_kw",
  "technical.reputation_distributor",
  "technical.reputation_module_maker",
  "technical.reputation_inverter_maker",
]);

/**
 * Returns the auto-suggested score for a single criterion, or null when the
 * data is missing / the criterion is manual.
 */
export function autoScoreFor(
  criterionKey: string,
  category: "company" | "technical",
  competitor: Pick<CompetitorProposal, "company" | "technical">,
): number | null {
  if (category === "company") return scoreCompany(criterionKey, competitor.company);
  return scoreTechnical(criterionKey, competitor.technical);
}

export function isManualCriterion(criterionKey: string): boolean {
  return MANUAL_KEYS.has(criterionKey);
}

/**
 * Returns a copy of the comparison where every score entry that has no manual
 * value falls back to the auto-suggested score. This is what the scoring engine
 * should consume so the ranking reflects auto-scores until the buyer overrides
 * them. Manual entries (a non-null score the buyer typed) are preserved.
 */
export function applyAutoScores(comparison: ComparisonInput): ComparisonInput {
  const manualByKey = new Map<string, ScoreEntry>();
  for (const entry of comparison.scoreEntries) {
    manualByKey.set(`${entry.competitorId}::${entry.criterionKey}`, entry);
  }

  const resolved: ScoreEntry[] = [];
  for (const competitor of comparison.competitors) {
    for (const def of scoreDefinitions) {
      const key = `${competitor.id}::${def.key}`;
      const manual = manualByKey.get(key);
      if (manual && manual.score != null) {
        resolved.push(manual);
        continue;
      }
      const auto = autoScoreFor(def.key, def.category, competitor);
      resolved.push({
        competitorId: competitor.id,
        criterionKey: def.key,
        score: auto,
      });
    }
  }

  return { ...comparison, scoreEntries: resolved };
}
