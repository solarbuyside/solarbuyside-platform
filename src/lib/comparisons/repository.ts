import { z } from "zod";

import { buildInitialDraftComparisonStructure } from "@/domain/comparisons/draft-structure";
import { comparisonWorkflowSummary } from "@/domain/comparisons/workflow";
import { createClient } from "@/lib/supabase/server";

export const createComparisonDraftSchema = z.object({
  title: z.string().trim().min(3).max(120),
  competitorNames: z
    .array(z.string().trim().min(1).max(120))
    .min(2)
    .max(6)
    .transform((names) => names.map((name) => name.trim()))
    .refine(
      (names) => new Set(names.map((name) => name.toLocaleLowerCase("pt-BR"))).size === names.length,
      "Competitor names must be unique.",
    ),
});

export type CreateComparisonDraftInput = z.input<typeof createComparisonDraftSchema>;

export type ComparisonSummary = {
  id: string;
  title: string;
  status: "draft" | "ready_for_review" | "completed";
  createdAt: string;
  updatedAt: string;
  competitorCount: number;
  competitors: Array<{
    id: string;
    name: string;
    position: number;
  }>;
};

type CompetitorRow = {
  id: string;
  company_name: string;
  position: number;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type ComparisonWithCompetitors = {
  id: string;
  title: string;
  status: "draft" | "ready_for_review" | "completed";
  created_at: string;
  updated_at: string;
  competitors: CompetitorRow[] | null;
};

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    throw new Error("Authentication required.");
  }

  return {
    supabase,
    userId: data.claims.sub,
  };
}

async function cleanupDraftAfterSeedFailure(supabase: SupabaseServerClient, comparisonId: string) {
  await supabase.from("comparisons").delete().eq("id", comparisonId);
}

function toSummary(row: ComparisonWithCompetitors): ComparisonSummary {
  const competitors = [...(row.competitors ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((competitor) => ({
      id: competitor.id,
      name: competitor.company_name,
      position: competitor.position,
    }));

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    competitorCount: competitors.length,
    competitors,
  };
}

export async function createComparisonDraft(input: CreateComparisonDraftInput) {
  const parsed = createComparisonDraftSchema.parse(input);
  const { supabase, userId } = await getAuthenticatedUserId();

  const { data: comparison, error: comparisonError } = await supabase
    .from("comparisons")
    .insert({
      owner_id: userId,
      title: parsed.title,
      status: "draft",
      max_competitors: 6,
    })
    .select("id")
    .single();

  if (comparisonError || !comparison) {
    throw new Error(comparisonError?.message ?? "Could not create comparison.");
  }

  const competitors = parsed.competitorNames.map((companyName, index) => ({
    comparison_id: comparison.id,
    position: index + 1,
    company_name: companyName,
  }));

  const { data: insertedCompetitors, error: competitorsError } = await supabase
    .from("competitors")
    .insert(competitors)
    .select("id,company_name,position");

  if (competitorsError || !insertedCompetitors) {
    await cleanupDraftAfterSeedFailure(supabase, comparison.id);
    throw new Error(competitorsError?.message ?? "Could not create competitors.");
  }

  const draftCompetitors = (insertedCompetitors as CompetitorRow[])
    .sort((a, b) => a.position - b.position)
    .map((competitor) => ({
      id: competitor.id,
      position: competitor.position,
      companyName: competitor.company_name,
    }));
  const initialStructure = buildInitialDraftComparisonStructure(comparison.id, draftCompetitors);

  const seedResults = await Promise.all([
    supabase.from("company_evaluations").insert(
      initialStructure.companyEvaluations.map((row) => ({
        comparison_id: row.comparisonId,
        competitor_id: row.competitorId,
      })),
    ),
    supabase.from("technical_evaluations").insert(
      initialStructure.technicalEvaluations.map((row) => ({
        comparison_id: row.comparisonId,
        competitor_id: row.competitorId,
      })),
    ),
    supabase.from("financial_evaluations").insert(
      initialStructure.financialEvaluations.map((row) => ({
        comparison_id: row.comparisonId,
        competitor_id: row.competitorId,
      })),
    ),
    supabase.from("comparison_score_settings").insert(
      initialStructure.scoreSettings.map((setting) => ({
        comparison_id: setting.comparisonId,
        criterion_key: setting.criterionKey,
        enabled: setting.enabled,
        weight: setting.weight,
      })),
    ),
    supabase.from("score_entries").insert(
      initialStructure.scoreEntries.map((entry) => ({
        comparison_id: entry.comparisonId,
        competitor_id: entry.competitorId,
        criterion_key: entry.criterionKey,
        category: entry.category,
        score: entry.score,
      })),
    ),
  ]);
  const seedError = seedResults.find((result) => result.error)?.error;

  if (seedError) {
    await cleanupDraftAfterSeedFailure(supabase, comparison.id);
    throw new Error(seedError.message);
  }

  await supabase.from("comparison_events").insert({
    comparison_id: comparison.id,
    actor_id: userId,
    event_type: "comparison.created",
    payload: {
      competitorCount: competitors.length,
      workflowVersion: initialStructure.workflowVersion,
      companyCriteriaCount: comparisonWorkflowSummary.companyCriteriaCount,
      technicalCriteriaCount: comparisonWorkflowSummary.technicalCriteriaCount,
      totalCriteriaCount: comparisonWorkflowSummary.totalCriteriaCount,
      financialAffectsScore: comparisonWorkflowSummary.financialAffectsScore,
    },
  });

  return comparison.id;
}

export async function listComparisonSummaries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comparisons")
    .select("id,title,status,created_at,updated_at,competitors(id,company_name,position)")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ComparisonWithCompetitors[]).map(toSummary);
}

export async function getComparisonSummary(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comparisons")
    .select("id,title,status,created_at,updated_at,competitors(id,company_name,position)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toSummary(data as ComparisonWithCompetitors);
}
