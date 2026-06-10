"use server";

import { revalidatePath } from "next/cache";

import { deleteComparison, renameComparison } from "@/lib/comparisons/repository";

export async function deleteComparisonAction(comparisonId: string) {
  await deleteComparison(comparisonId);
  revalidatePath("/avaliacoes");
  revalidatePath("/dashboard");
}

export async function renameComparisonAction(comparisonId: string, title: string) {
  await renameComparison(comparisonId, title);
  revalidatePath("/avaliacoes");
  revalidatePath("/dashboard");
}
