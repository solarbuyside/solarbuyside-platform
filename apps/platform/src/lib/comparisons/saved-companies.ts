import {
  companyEvaluationSchema,
  technicalEvaluationSchema,
  type CompanyEvaluation,
  type TechnicalEvaluation,
} from "@/domain/comparisons/types";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type SavedCompany = {
  id: string;
  companyName: string;
  sellerName: string | null;
  company: CompanyEvaluation;
  technical: TechnicalEvaluation;
};

async function authedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) throw new Error("Authentication required.");
  return { supabase, userId: data.claims.sub };
}

/** Lists the buyer's saved companies (for reuse when creating evaluations). */
export async function listSavedCompanies(): Promise<SavedCompany[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_companies")
    .select("id,company_name,seller_name,company_payload,technical_payload")
    .order("company_name", { ascending: true });

  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id,
    companyName: row.company_name,
    sellerName: row.seller_name,
    company: companyEvaluationSchema.catch({}).parse(row.company_payload),
    technical: technicalEvaluationSchema.catch({}).parse(row.technical_payload),
  }));
}

/**
 * Saves (upserts by name) a company to the buyer's library, capturing its
 * current company + technical data so it can be reused in future comparisons.
 */
export async function saveCompanyToLibrary(input: {
  companyName: string;
  sellerName?: string | null;
  company: CompanyEvaluation;
  technical: TechnicalEvaluation;
}) {
  const { supabase, userId } = await authedUserId();
  const company = companyEvaluationSchema.parse(input.company);
  const technical = technicalEvaluationSchema.parse(input.technical);

  const { error } = await supabase.from("saved_companies").upsert(
    {
      owner_id: userId,
      company_name: input.companyName.trim(),
      seller_name: input.sellerName?.trim() || null,
      company_payload: company as unknown as Json,
      technical_payload: technical as unknown as Json,
    },
    { onConflict: "owner_id,company_name" },
  );

  if (error) throw new Error(error.message);
}
