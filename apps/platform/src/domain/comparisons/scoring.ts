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

const DEFINITION_KEYS = new Set(scoreDefinitions.map((d) => d.key));
const CATEGORY_BY_PREFIX: Record<string, ScoreCategory> = {
  company: "company",
  technical: "technical",
  financial: "financial",
};

/**
 * Critérios AD-HOC: linhas informativas (sem definição canônica) que o comprador
 * ligou manualmente para pontuar. Entram no total como maxScore 10 cada. Ficam
 * fora por padrão (settings desligados), então não mudam o ranking até serem
 * ligados explicitamente.
 */
function enabledAdHoc(category: ScoreCategory, settings: ScoreSetting[]) {
  return settings.filter((s) => {
    if (!s.enabled) return false;
    if (DEFINITION_KEYS.has(s.criterionKey)) return false;
    return CATEGORY_BY_PREFIX[s.criterionKey.split(".")[0]] === category;
  });
}

export function summarizeCategoryScore(
  comparison: ComparisonInput,
  competitorId: string,
  category: ScoreCategory,
): ScoreSummary {
  const definitions = enabledDefinitions(category, comparison.scoreSettings);

  // Cada critério é ponderado pelo seu peso (%): nota ponderada = (nota/10)×peso.
  // O peso vem da definição (slide 11); um override em scoreSettings tem
  // precedência (permite ajuste fino futuro). Critérios SEM nota (null — ex.:
  // "sem reputação definida", ou dado não preenchido) ficam de fora do
  // numerador E do denominador: aparecem como "—" e não penalizam nem inflam o
  // índice, que renormaliza sobre os critérios efetivamente pontuados (slide 7).
  let points = 0;
  let maxPoints = 0;
  let scoredCriteria = 0;
  for (const definition of definitions) {
    const entry = scoreFor(comparison.scoreEntries, competitorId, definition.key);
    if (entry?.score == null) continue;
    // O peso (%) é o da DEFINIÇÃO (fonte de verdade, slide 11) — não o do
    // scoreSetting, que sempre traz 1 por padrão e anularia a ponderação. O
    // scoreSetting controla apenas o liga/desliga ("Avaliar?") do critério.
    const weight = definition.weight ?? 1;
    points += normalizeScore(entry.score) * weight;
    maxPoints += definition.maxScore * weight;
    scoredCriteria += 1;
  }

  // Critérios ad-hoc ligados manualmente pelo comprador (peso 1, maxScore 10).
  const adHoc = enabledAdHoc(category, comparison.scoreSettings);
  for (const setting of adHoc) {
    const entry = scoreFor(comparison.scoreEntries, competitorId, setting.criterionKey);
    if (entry?.score == null) continue;
    const weight = setting.weight ?? 1;
    points += normalizeScore(entry.score) * weight;
    maxPoints += 10 * weight;
    scoredCriteria += 1;
  }

  const grade10 = maxPoints > 0 ? round2((points / maxPoints) * 10) : 0;
  return {
    points: round2(points),
    maxPoints: round2(maxPoints),
    grade10,
    index100: round2(grade10 * 10),
    enabledCriteria: scoredCriteria,
  };
}

function totalScore(...summaries: ScoreSummary[]): ScoreSummary {
  const points = summaries.reduce((sum, s) => sum + s.points, 0);
  const maxPoints = summaries.reduce((sum, s) => sum + s.maxPoints, 0);
  const grade10 = maxPoints > 0 ? round2((points / maxPoints) * 10) : 0;

  return {
    points: round2(points),
    maxPoints: round2(maxPoints),
    grade10,
    index100: round2(grade10 * 10),
    enabledCriteria: summaries.reduce((sum, s) => sum + s.enabledCriteria, 0),
  };
}

function riskFlagsFor(competitor: CompetitorProposal) {
  const flags: string[] = [];
  const company = competitor.company;
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
    // Viabilidade financeira é INFORMATIVA (PPTX slides 4-5): não soma no ranking.
    const financialScore = summarizeCategoryScore(comparison, competitor.id, "financial");
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
      financialScore,
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
