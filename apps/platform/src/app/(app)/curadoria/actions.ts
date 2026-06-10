"use server";

import { revalidatePath } from "next/cache";

import { analyzeContract, type ContractAnalysis } from "@/domain/contracts/analyzer";
import { saveContractReview, deleteContractReview } from "@/lib/contracts/repository";

/** Analyzes the contract text on the server (rule-based, deterministic). */
export async function analyzeContractAction(text: string): Promise<ContractAnalysis> {
  return analyzeContract(text ?? "");
}

/** Re-analyzes (server-side, authoritative) and saves the review. */
export async function saveContractReviewAction(input: {
  title: string;
  contractText: string;
  approvedByUser: boolean;
}) {
  const analysis = analyzeContract(input.contractText ?? "");
  const id = await saveContractReview({
    title: input.title,
    contractText: input.contractText,
    analysis,
    approvedByUser: input.approvedByUser,
  });
  revalidatePath("/curadoria");
  return id;
}

export async function deleteContractReviewAction(id: string) {
  await deleteContractReview(id);
  revalidatePath("/curadoria");
}
