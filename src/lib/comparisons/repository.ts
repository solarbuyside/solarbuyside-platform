import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export const createComparisonDraftSchema = z.object({
  title: z.string().trim().min(3).max(120),
  competitorNames: z
    .array(z.string().trim().min(1).max(120))
    .min(2)
    .max(6)
    .transform((names) => names.map((name) => name.trim())),
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

  const { error: competitorsError } = await supabase.from("competitors").insert(competitors);

  if (competitorsError) {
    throw new Error(competitorsError.message);
  }

  await supabase.from("comparison_events").insert({
    comparison_id: comparison.id,
    actor_id: userId,
    event_type: "comparison.created",
    payload: {
      competitorCount: competitors.length,
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
