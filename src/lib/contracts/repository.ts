import { analyzeContract, type ContractAnalysis, type Finding } from "@/domain/contracts/analyzer";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type SavedContractReview = {
  id: string;
  title: string;
  verdict: "reproved" | "attention" | "approved";
  score: number;
  findings: Finding[];
  approvedByUser: boolean;
  createdAt: string;
};

async function authedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) throw new Error("Authentication required.");
  return { supabase, userId: data.claims.sub };
}

/** Runs the rule-based analysis and persists the review. */
export async function saveContractReview(input: {
  title: string;
  contractText: string;
  analysis: ContractAnalysis;
  approvedByUser: boolean;
}) {
  const { supabase, userId } = await authedUserId();
  const { data, error } = await supabase
    .from("contract_reviews")
    .insert({
      owner_id: userId,
      title: input.title.trim() || "Contrato sem título",
      contract_text: input.contractText,
      verdict: input.analysis.verdict,
      score: input.analysis.score,
      findings: input.analysis.findings as unknown as Json,
      approved_by_user: input.approvedByUser,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Não foi possível salvar a curadoria.");
  return data.id;
}

export async function listContractReviews(): Promise<SavedContractReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contract_reviews")
    .select("id,title,verdict,score,findings,approved_by_user,created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    verdict: row.verdict,
    score: row.score,
    findings: (row.findings as unknown as Finding[]) ?? [],
    approvedByUser: row.approved_by_user,
    createdAt: row.created_at,
  }));
}

export async function deleteContractReview(id: string) {
  const { supabase } = await authedUserId();
  const { error } = await supabase.from("contract_reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Server-side re-analysis (don't trust client-sent verdict). */
export function runAnalysis(text: string) {
  return analyzeContract(text);
}
