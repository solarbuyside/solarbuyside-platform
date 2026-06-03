import { z } from "zod";

import { buildInitialDraftComparisonStructure } from "@/domain/comparisons/draft-structure";
import { comparisonWorkflowSummary } from "@/domain/comparisons/workflow";
import { autoScoreFor } from "@/domain/comparisons/auto-scoring";
import { scoreDefinitions } from "@/domain/comparisons/score-definitions";
import {
  comparisonInputSchema,
  companyEvaluationSchema,
  technicalEvaluationSchema,
  type ComparisonInput,
  type ComparisonStatus,
  type CompanyEvaluation,
  type FinancialEvaluation,
  type ScoreCategory,
  type TechnicalEvaluation,
} from "@/domain/comparisons/types";
import { createClient } from "@/lib/supabase/server";
import {
  companyDomainToUpdate,
  companyRowToDomain,
  financialDomainToUpdate,
  financialRowToDomain,
  technicalDomainToUpdate,
  technicalRowToDomain,
} from "@/lib/comparisons/mappers";

export const createComparisonDraftSchema = z.object({
  title: z.string().trim().min(3).max(120),
  /** Optional: saved-company ids to pre-fill, aligned by competitor name. */
  savedCompanyIds: z.array(z.string().uuid()).max(6).optional(),
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

  // Pre-fill company/technical data from the saved-company library when chosen.
  if (parsed.savedCompanyIds && parsed.savedCompanyIds.length > 0) {
    const { data: saved } = await supabase
      .from("saved_companies")
      .select("company_name,company_payload,technical_payload")
      .in("id", parsed.savedCompanyIds);

    for (const lib of saved ?? []) {
      const match = draftCompetitors.find(
        (c) => c.companyName.toLocaleLowerCase("pt-BR") === lib.company_name.toLocaleLowerCase("pt-BR"),
      );
      if (!match) continue;
      const company = companyDomainToUpdate(
        companyEvaluationSchema.catch({}).parse(lib.company_payload),
      );
      const technical = technicalDomainToUpdate(
        technicalEvaluationSchema.catch({}).parse(lib.technical_payload),
      );
      await Promise.all([
        supabase
          .from("company_evaluations")
          .update(company)
          .eq("comparison_id", comparison.id)
          .eq("competitor_id", match.id),
        supabase
          .from("technical_evaluations")
          .update(technical)
          .eq("comparison_id", comparison.id)
          .eq("competitor_id", match.id),
      ]);
    }
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

export type RecentEvent = {
  id: string;
  eventType: string;
  comparisonId: string;
  createdAt: string;
};

/** Recent activity for the current user (drives the header notifications). */
export async function listRecentEvents(limit = 10): Promise<RecentEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comparison_events")
    .select("id,event_type,comparison_id,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id,
    eventType: row.event_type,
    comparisonId: row.comparison_id,
    createdAt: row.created_at,
  }));
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

// ---------------------------------------------------------------------------
// Full comparison load (assembles a domain ComparisonInput from the database)
// ---------------------------------------------------------------------------

type EvaluationRowBase = { competitor_id: string };

type ScoreEntryRow = {
  competitor_id: string;
  criterion_key: string;
  score: number | null;
  notes: string | null;
};

type ScoreSettingRow = {
  criterion_key: string;
  enabled: boolean;
  weight: number;
};

function indexBy<T extends EvaluationRowBase>(rows: T[] | null) {
  const map = new Map<string, T>();
  for (const row of rows ?? []) map.set(row.competitor_id, row);
  return map;
}

/**
 * Loads everything needed to run the pure scoring engine for one comparison.
 * Returns a validated `ComparisonInput` (camelCase) ready for
 * `calculateComparisonResult`. Returns null when the comparison is missing or
 * not visible to the current user (RLS).
 */
export async function loadComparisonInput(id: string): Promise<ComparisonInput | null> {
  const supabase = await createClient();

  // Diagnostic: confirm we have an authenticated session. Without it, RLS hides
  // the row and the page would 404 with no obvious cause.
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    console.error("[loadComparisonInput] no authenticated session for", id);
  }

  const { data: comparison, error: comparisonError } = await supabase
    .from("comparisons")
    .select("id,owner_id,title,status,selected_finalist_ids,summary,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (comparisonError) {
    console.error("[loadComparisonInput] comparison query error:", comparisonError.message);
    throw new Error(comparisonError.message);
  }
  if (!comparison) {
    console.error("[loadComparisonInput] no row for", id, "(RLS or not found)");
    return null;
  }

  const [
    competitorsResult,
    companyResult,
    technicalResult,
    financialResult,
    scoreEntriesResult,
    scoreSettingsResult,
  ] = await Promise.all([
    supabase
      .from("competitors")
      .select("id,position,company_name,seller_name,notes")
      .eq("comparison_id", id)
      .order("position", { ascending: true }),
    supabase.from("company_evaluations").select("*").eq("comparison_id", id),
    supabase.from("technical_evaluations").select("*").eq("comparison_id", id),
    supabase.from("financial_evaluations").select("*").eq("comparison_id", id),
    supabase
      .from("score_entries")
      .select("competitor_id,criterion_key,score,notes")
      .eq("comparison_id", id),
    supabase
      .from("comparison_score_settings")
      .select("criterion_key,enabled,weight")
      .eq("comparison_id", id),
  ]);

  const firstError =
    competitorsResult.error ??
    companyResult.error ??
    technicalResult.error ??
    financialResult.error ??
    scoreEntriesResult.error ??
    scoreSettingsResult.error;
  if (firstError) throw new Error(firstError.message);

  const companyByCompetitor = indexBy(companyResult.data);
  const technicalByCompetitor = indexBy(technicalResult.data);
  const financialByCompetitor = indexBy(financialResult.data);

  const competitors = (competitorsResult.data ?? []).map((competitor) => {
    const companyRow = companyByCompetitor.get(competitor.id);
    const technicalRow = technicalByCompetitor.get(competitor.id);
    const financialRow = financialByCompetitor.get(competitor.id);

    return {
      id: competitor.id,
      position: competitor.position,
      companyName: competitor.company_name,
      sellerName: competitor.seller_name,
      notes: competitor.notes,
      company: companyRow ? companyRowToDomain(companyRow) : {},
      technical: technicalRow ? technicalRowToDomain(technicalRow) : {},
      financial: financialRow ? financialRowToDomain(financialRow) : {},
    };
  });

  const scoreEntries = ((scoreEntriesResult.data as ScoreEntryRow[] | null) ?? []).map((entry) => ({
    competitorId: entry.competitor_id,
    criterionKey: entry.criterion_key,
    score: entry.score,
    notes: entry.notes,
  }));

  const scoreSettings = ((scoreSettingsResult.data as ScoreSettingRow[] | null) ?? []).map(
    (setting) => ({
      criterionKey: setting.criterion_key,
      enabled: setting.enabled,
      weight: setting.weight,
    }),
  );

  const summary = (comparison.summary ?? {}) as { scoringMode?: string };
  const scoringMode = summary.scoringMode === "manual" ? "manual" : "auto";

  const parsed = comparisonInputSchema.safeParse({
    id: comparison.id,
    ownerId: comparison.owner_id,
    title: comparison.title,
    status: comparison.status as ComparisonStatus,
    competitors,
    scoreEntries,
    scoreSettings,
    selectedFinalistIds: comparison.selected_finalist_ids ?? [],
    scoringMode,
    createdAt: comparison.created_at,
    updatedAt: comparison.updated_at,
  });

  if (!parsed.success) {
    console.error(
      "[loadComparisonInput] validation issues:",
      JSON.stringify(parsed.error.issues, null, 2),
    );
    throw parsed.error;
  }

  return parsed.data;
}

// ---------------------------------------------------------------------------
// Step writes (one upsert per competitor evaluation / score)
// ---------------------------------------------------------------------------

async function ownedComparisonOrThrow(comparisonId: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("comparisons")
    .select("id")
    .eq("id", comparisonId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Comparison not found.");

  return { supabase, userId };
}

export async function saveCompanyEvaluation(
  comparisonId: string,
  competitorId: string,
  evaluation: CompanyEvaluation,
) {
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const { error } = await supabase
    .from("company_evaluations")
    .update(companyDomainToUpdate(evaluation))
    .eq("comparison_id", comparisonId)
    .eq("competitor_id", competitorId);

  if (error) throw new Error(error.message);
}

export async function saveTechnicalEvaluation(
  comparisonId: string,
  competitorId: string,
  evaluation: TechnicalEvaluation,
) {
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const { error } = await supabase
    .from("technical_evaluations")
    .update(technicalDomainToUpdate(evaluation))
    .eq("comparison_id", comparisonId)
    .eq("competitor_id", competitorId);

  if (error) throw new Error(error.message);
}

export async function saveFinancialEvaluation(
  comparisonId: string,
  competitorId: string,
  evaluation: FinancialEvaluation,
) {
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const { error } = await supabase
    .from("financial_evaluations")
    .update(financialDomainToUpdate(evaluation))
    .eq("comparison_id", comparisonId)
    .eq("competitor_id", competitorId);

  if (error) throw new Error(error.message);
}

export async function saveScoreEntry(
  comparisonId: string,
  competitorId: string,
  criterionKey: string,
  category: ScoreCategory,
  score: number | null,
) {
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const { error } = await supabase.from("score_entries").upsert(
    {
      comparison_id: comparisonId,
      competitor_id: competitorId,
      criterion_key: criterionKey,
      category,
      score,
    },
    { onConflict: "competitor_id,criterion_key" },
  );

  if (error) throw new Error(error.message);
}

export async function saveScoreSetting(
  comparisonId: string,
  criterionKey: string,
  enabled: boolean,
  weight: number,
) {
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const { error } = await supabase.from("comparison_score_settings").upsert(
    {
      comparison_id: comparisonId,
      criterion_key: criterionKey,
      enabled,
      weight,
    },
    { onConflict: "comparison_id,criterion_key" },
  );

  if (error) throw new Error(error.message);
}

export async function deleteComparison(comparisonId: string) {
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  // ON DELETE CASCADE removes competitors, evaluations, scores and events.
  const { error } = await supabase.from("comparisons").delete().eq("id", comparisonId);
  if (error) throw new Error(error.message);
}

export async function renameComparison(comparisonId: string, title: string) {
  const trimmed = title.trim();
  if (trimmed.length < 3) throw new Error("O título precisa de pelo menos 3 caracteres.");
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const { error } = await supabase
    .from("comparisons")
    .update({ title: trimmed })
    .eq("id", comparisonId);
  if (error) throw new Error(error.message);
}

export async function saveSelectedFinalists(comparisonId: string, finalistIds: string[]) {
  if (finalistIds.length > 2) {
    throw new Error("A buyer chooses at most two finalists.");
  }
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const { error } = await supabase
    .from("comparisons")
    .update({ selected_finalist_ids: finalistIds })
    .eq("id", comparisonId);

  if (error) throw new Error(error.message);
}

/** Persiste o modo de pontuação (auto/manual) dentro do summary jsonb. */
export async function saveScoringMode(comparisonId: string, mode: "auto" | "manual") {
  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const { data: row, error: readError } = await supabase
    .from("comparisons")
    .select("summary")
    .eq("id", comparisonId)
    .single();
  if (readError) throw new Error(readError.message);

  const summary = { ...((row?.summary as Record<string, unknown>) ?? {}), scoringMode: mode };
  const { error } = await supabase
    .from("comparisons")
    .update({ summary })
    .eq("id", comparisonId);
  if (error) throw new Error(error.message);
}

/**
 * Aplica as notas automáticas a TODOS os critérios pontuáveis (grava como
 * override), para o comprador partir das sugestões. Usado pelo botão
 * "Pontuar tudo automaticamente".
 */
export async function applyAutoScoresToAll(comparisonId: string) {
  const input = await loadComparisonInput(comparisonId);
  if (!input) throw new Error("Comparison not found.");

  const { supabase } = await ownedComparisonOrThrow(comparisonId);
  const rows: Array<{
    comparison_id: string;
    competitor_id: string;
    criterion_key: string;
    category: ScoreCategory;
    score: number | null;
  }> = [];

  for (const competitor of input.competitors) {
    for (const def of scoreDefinitions) {
      const score = autoScoreFor(def.key, def.category, competitor);
      if (score == null) continue; // mantém manuais/subjetivos vazios
      rows.push({
        comparison_id: comparisonId,
        competitor_id: competitor.id,
        criterion_key: def.key,
        category: def.category,
        score,
      });
    }
  }

  if (rows.length === 0) return;
  const { error } = await supabase
    .from("score_entries")
    .upsert(rows, { onConflict: "competitor_id,criterion_key" });
  if (error) throw new Error(error.message);
}
