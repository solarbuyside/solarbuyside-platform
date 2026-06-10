import { scoreDefinitions } from "./score-definitions";
import { comparisonWorkflowSummary } from "./workflow";
import type { ScoreCategory } from "./types";

export type DraftCompetitorSeed = {
  id: string;
  position: number;
  companyName: string;
};

export type InitialEvaluationRow = {
  comparisonId: string;
  competitorId: string;
};

export type InitialScoreSetting = {
  comparisonId: string;
  criterionKey: string;
  enabled: boolean;
  weight: number;
};

export type InitialScoreEntry = {
  comparisonId: string;
  competitorId: string;
  criterionKey: string;
  category: ScoreCategory;
  score: number | null;
};

export type InitialDraftComparisonStructure = {
  companyEvaluations: InitialEvaluationRow[];
  technicalEvaluations: InitialEvaluationRow[];
  financialEvaluations: InitialEvaluationRow[];
  scoreSettings: InitialScoreSetting[];
  scoreEntries: InitialScoreEntry[];
  workflowVersion: typeof comparisonWorkflowSummary.version;
};

export function buildInitialDraftComparisonStructure(
  comparisonId: string,
  competitors: readonly DraftCompetitorSeed[],
): InitialDraftComparisonStructure {
  const evaluationRows = competitors.map((competitor) => ({
    comparisonId,
    competitorId: competitor.id,
  }));

  return {
    companyEvaluations: evaluationRows,
    technicalEvaluations: evaluationRows,
    financialEvaluations: evaluationRows,
    scoreSettings: scoreDefinitions.map((definition) => ({
      comparisonId,
      criterionKey: definition.key,
      // Peso informativo no banco; o motor usa o peso da definição (slide 11).
      weight: definition.weight,
      enabled: definition.defaultEnabled,
    })),
    scoreEntries: competitors.flatMap((competitor) =>
      scoreDefinitions.map((definition) => ({
        comparisonId,
        competitorId: competitor.id,
        criterionKey: definition.key,
        category: definition.category,
        score: null,
      })),
    ),
    workflowVersion: comparisonWorkflowSummary.version,
  };
}
