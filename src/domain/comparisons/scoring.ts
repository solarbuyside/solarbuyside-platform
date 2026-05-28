import { scoreDefinitions } from "./score-definitions";
import type {
  ComparisonInput,
  ComparisonInsight,
  ComparisonResult,
  CompetitorProposal,
  CompetitorResult,
  ScoreCategory,
  ScoreDefinition,
  ScoreEntry,
  ScoreSummary,
  ScoreSetting,
} from "./types";

const round2 = (value: number) => Math.round(value * 100) / 100;

const normalizeScore = (score: number | null | undefined) => {
  if (typeof score !== "number" || !Number.isFinite(score)) return 0;
  return Math.min(10, Math.max(0, score));
};

function settingFor(settings: ScoreSetting[], criterionKey: string) {
  return settings.find((setting) => setting.criterionKey === criterionKey);
}

function scoreFor(entries: ScoreEntry[], competitorId: string, criterionKey: string) {
  return entries.find(
    (entry) => entry.competitorId === competitorId && entry.criterionKey === criterionKey,
  );
}

function enabledDefinitions(
  category: ScoreCategory,
  settings: ScoreSetting[],
  definitions: ScoreDefinition[] = scoreDefinitions,
) {
  return definitions.filter((definition) => {
    if (definition.category !== category) return false;
    return settingFor(settings, definition.key)?.enabled ?? definition.defaultEnabled;
  });
}

export function summarizeCategoryScore(
  comparison: ComparisonInput,
  competitorId: string,
  category: ScoreCategory,
): ScoreSummary {
  const definitions = enabledDefinitions(category, comparison.scoreSettings);
  const points = definitions.reduce((total, definition) => {
    const entry = scoreFor(comparison.scoreEntries, competitorId, definition.key);
    const weight = settingFor(comparison.scoreSettings, definition.key)?.weight ?? 1;
    return total + normalizeScore(entry?.score) * weight;
  }, 0);
  const maxPoints = definitions.reduce((total, definition) => {
    const weight = settingFor(comparison.scoreSettings, definition.key)?.weight ?? 1;
    return total + definition.maxScore * weight;
  }, 0);

  return {
    points: round2(points),
    maxPoints: round2(maxPoints),
    grade10: maxPoints > 0 ? round2((points / maxPoints) * 10) : 0,
    enabledCriteria: definitions.length,
  };
}

function totalScore(companyScore: ScoreSummary, technicalScore: ScoreSummary): ScoreSummary {
  const points = companyScore.points + technicalScore.points;
  const maxPoints = companyScore.maxPoints + technicalScore.maxPoints;

  return {
    points: round2(points),
    maxPoints: round2(maxPoints),
    grade10: maxPoints > 0 ? round2((points / maxPoints) * 10) : 0,
    enabledCriteria: companyScore.enabledCriteria + technicalScore.enabledCriteria,
  };
}

function riskFlagsFor(competitor: CompetitorProposal) {
  const flags: string[] = [];
  const company = competitor.company;
  const technical = competitor.technical;
  const financial = competitor.financial;

  if (company.hasElectricalEngineeringCrea && company.hasElectricalEngineeringCrea !== "yes") {
    flags.push("CREA de engenharia eletrica ausente ou incerto");
  }

  if (
    typeof company.projectExecutionWarrantyYears === "number" &&
    company.projectExecutionWarrantyYears < 3
  ) {
    flags.push("Garantia de projeto/execucao abaixo de 3 anos");
  }

  if (typeof company.supportDeadlineDays === "number" && company.supportDeadlineDays > 7) {
    flags.push("Prazo de assistencia tecnica acima de 7 dias");
  }

  if (technical.inverterReliability && technical.inverterReliability !== "yes") {
    flags.push("Confiabilidade do inversor nao confirmada");
  }

  if (technical.moduleReliability && technical.moduleReliability !== "yes") {
    flags.push("Confiabilidade do modulo nao confirmada");
  }

  if (financial.viabilityConfidence && financial.viabilityConfidence !== "high") {
    flags.push("Viabilidade financeira declarada como media, baixa ou incerta");
  }

  return flags;
}

function compareResults(a: CompetitorResult, b: CompetitorResult) {
  if (b.totalScore.grade10 !== a.totalScore.grade10) {
    return b.totalScore.grade10 - a.totalScore.grade10;
  }
  if (b.totalScore.points !== a.totalScore.points) {
    return b.totalScore.points - a.totalScore.points;
  }
  if (a.investment !== null && b.investment !== null && a.investment !== b.investment) {
    return a.investment - b.investment;
  }
  return a.position - b.position;
}

function buildInsights(results: CompetitorResult[], finalistIds: string[]) {
  const insights: ComparisonInsight[] = [];
  if (results.length === 0) return insights;

  const ranked = [...results].sort(compareResults);
  const best = ranked[0];
  const cheapest = results
    .filter((result) => result.investment !== null)
    .sort((a, b) => (a.investment ?? 0) - (b.investment ?? 0))[0];

  if (best) {
    insights.push({
      severity: "success",
      title: `${best.companyName} lidera na pontuacao tecnica e empresarial`,
      description: `Nota geral ${best.totalScore.grade10}/10 com ${best.totalScore.points} pontos em ${best.totalScore.enabledCriteria} criterios ativos.`,
    });
  }

  if (cheapest && best && cheapest.competitorId !== best.competitorId) {
    insights.push({
      severity: "warning",
      title: "Menor preco nao e a melhor pontuacao",
      description: `${cheapest.companyName} tem o menor investimento, mas ${best.companyName} aparece melhor no conjunto de empresa e tecnologia.`,
    });
  }

  const riskyFinalist = results.find(
    (result) => finalistIds.includes(result.competitorId) && result.riskFlags.length > 0,
  );

  if (riskyFinalist) {
    insights.push({
      severity: "warning",
      title: "Finalista com pontos de atencao",
      description: `${riskyFinalist.companyName}: ${riskyFinalist.riskFlags.slice(0, 2).join("; ")}.`,
    });
  }

  const efficient = results
    .filter((result) => result.pricePerPoint !== null)
    .sort((a, b) => (a.pricePerPoint ?? 0) - (b.pricePerPoint ?? 0))[0];

  if (efficient) {
    insights.push({
      severity: "info",
      title: "Melhor relacao preco/ponto",
      description: `${efficient.companyName} apresenta o menor custo por ponto entre as propostas com investimento informado.`,
    });
  }

  return insights;
}

export function calculateComparisonResult(comparison: ComparisonInput): ComparisonResult {
  const baseResults = comparison.competitors.map((competitor) => {
    const companyScore = summarizeCategoryScore(comparison, competitor.id, "company");
    const technicalScore = summarizeCategoryScore(comparison, competitor.id, "technical");
    const combinedScore = totalScore(companyScore, technicalScore);
    const investment = competitor.financial.totalInvestment ?? null;

    return {
      competitorId: competitor.id,
      companyName: competitor.companyName,
      position: competitor.position,
      rank: 0,
      investment,
      companyScore,
      technicalScore,
      totalScore: combinedScore,
      pricePerPoint:
        investment !== null && combinedScore.points > 0 ? round2(investment / combinedScore.points) : null,
      riskFlags: riskFlagsFor(competitor),
    } satisfies CompetitorResult;
  });

  const ranked = [...baseResults].sort(compareResults);
  const competitors = baseResults
    .map((result) => ({
      ...result,
      rank: ranked.findIndex((rankedResult) => rankedResult.competitorId === result.competitorId) + 1,
    }))
    .sort((a, b) => a.position - b.position);

  const recommendedFinalistIds = ranked.slice(0, 2).map((result) => result.competitorId);
  const selectedFinalistIds =
    comparison.selectedFinalistIds.length === 2 ? comparison.selectedFinalistIds : recommendedFinalistIds;

  return {
    comparisonId: comparison.id,
    generatedAt: new Date().toISOString(),
    competitors,
    recommendedFinalistIds,
    selectedFinalistIds,
    insights: buildInsights(competitors, selectedFinalistIds),
  };
}
