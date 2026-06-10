import { applyAutoScores } from "@/domain/comparisons/auto-scoring";
import { calculateComparisonResult } from "@/domain/comparisons/scoring";
import { listComparisonSummaries, loadComparisonInput } from "@/lib/comparisons/repository";

export type HomeRecent = {
  id: string;
  title: string;
  status: "draft" | "ready_for_review" | "completed";
  competitorCount: number;
  updatedAt: string;
};

export type HomeBestChoice = {
  id: string;
  title: string;
  leaderName: string;
  leaderGrade: number;
  investment: number | null;
};

export type HomeOverview = {
  firstName: string | null;
  totals: {
    total: number;
    drafts: number;
    completed: number;
  };
  recent: HomeRecent[];
  bestChoices: HomeBestChoice[];
};

/**
 * Lightweight home summary for the current user: recent evaluations to resume
 * and the leading supplier of the most advanced ones (best choices).
 */
export async function getHomeOverview(firstName: string | null): Promise<HomeOverview> {
  const summaries = await listComparisonSummaries().catch(() => []);

  const totals = {
    total: summaries.length,
    drafts: summaries.filter((s) => s.status === "draft").length,
    completed: summaries.filter((s) => s.status === "completed").length,
  };

  const recent: HomeRecent[] = summaries.slice(0, 4).map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    competitorCount: s.competitorCount,
    updatedAt: s.updatedAt,
  }));

  // Compute the leader for the 3 most recent comparisons (bounded work).
  const candidates = summaries.slice(0, 3);
  const bestChoices: HomeBestChoice[] = [];
  for (const summary of candidates) {
    const input = await loadComparisonInput(summary.id).catch(() => null);
    if (!input || input.competitors.length === 0) continue;
    const result = calculateComparisonResult(applyAutoScores(input));
    const leader = [...result.competitors].sort((a, b) => a.rank - b.rank)[0];
    if (!leader) continue;
    bestChoices.push({
      id: summary.id,
      title: summary.title,
      leaderName: leader.companyName,
      leaderGrade: leader.totalScore.grade10,
      investment: leader.investment,
    });
  }

  return { firstName, totals, recent, bestChoices };
}
