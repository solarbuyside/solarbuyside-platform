import { randomBytes } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  technicalDomainToUpdate,
  financialDomainToUpdate,
  technicalRowToDomain,
  financialRowToDomain,
} from "@/lib/comparisons/mappers";
import {
  technicalEvaluationSchema,
  financialEvaluationSchema,
  type TechnicalEvaluation,
  type FinancialEvaluation,
} from "@/domain/comparisons/types";

function newToken() {
  return randomBytes(24).toString("base64url");
}

/**
 * Owner-only: ensures the competitor has a share token and returns it. Relies
 * on RLS (the authenticated owner can update their own competitors).
 */
export async function ensureShareToken(comparisonId: string, competitorId: string) {
  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("competitors")
    .select("share_token,share_enabled")
    .eq("id", competitorId)
    .eq("comparison_id", comparisonId)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (!existing) throw new Error("Competitor not found.");

  if (existing.share_token && existing.share_enabled) {
    return existing.share_token;
  }

  const token = existing.share_token ?? newToken();
  const { error: updateError } = await supabase
    .from("competitors")
    .update({ share_token: token, share_enabled: true })
    .eq("id", competitorId)
    .eq("comparison_id", comparisonId);

  if (updateError) throw new Error(updateError.message);
  return token;
}

export type PublicShareTarget = {
  comparisonId: string;
  competitorId: string;
  companyName: string;
  technical: TechnicalEvaluation;
  financial: FinancialEvaluation;
};

/**
 * Public (no auth): resolves a share token to the competitor it grants access
 * to, using the admin client. Returns null for invalid/disabled tokens.
 */
export async function resolveShareToken(token: string): Promise<PublicShareTarget | null> {
  if (!token || token.length < 10) return null;
  const admin = createAdminClient();

  const { data: competitor, error } = await admin
    .from("competitors")
    .select("id,comparison_id,company_name,share_enabled")
    .eq("share_token", token)
    .maybeSingle();

  if (error || !competitor || !competitor.share_enabled) return null;

  const [tech, fin] = await Promise.all([
    admin.from("technical_evaluations").select("*").eq("competitor_id", competitor.id).maybeSingle(),
    admin.from("financial_evaluations").select("*").eq("competitor_id", competitor.id).maybeSingle(),
  ]);

  return {
    comparisonId: competitor.comparison_id,
    competitorId: competitor.id,
    companyName: competitor.company_name,
    technical: tech.data ? technicalRowToDomain(tech.data) : {},
    financial: fin.data ? financialRowToDomain(fin.data) : {},
  };
}

/**
 * Public (no auth): a vendor saves their technical/financial data via a valid
 * token. Only these two sections are writable — never scores or company data.
 */
export async function submitSharedResponse(
  token: string,
  technical: unknown,
  financial: unknown,
) {
  const target = await resolveShareToken(token);
  if (!target) throw new Error("Link inválido ou expirado.");

  const parsedTechnical = technicalEvaluationSchema.parse(technical);
  const parsedFinancial = financialEvaluationSchema.parse(financial);

  const admin = createAdminClient();
  const [techResult, finResult] = await Promise.all([
    admin
      .from("technical_evaluations")
      .update(technicalDomainToUpdate(parsedTechnical))
      .eq("competitor_id", target.competitorId),
    admin
      .from("financial_evaluations")
      .update(financialDomainToUpdate(parsedFinancial))
      .eq("competitor_id", target.competitorId),
  ]);

  if (techResult.error) throw new Error(techResult.error.message);
  if (finResult.error) throw new Error(finResult.error.message);

  // Audit trail.
  await admin.from("comparison_events").insert({
    comparison_id: target.comparisonId,
    event_type: "competitor.shared_response_submitted",
    payload: { competitorId: target.competitorId },
  });
}
