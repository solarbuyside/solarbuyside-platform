"use server";

import { submitSharedResponse } from "@/lib/comparisons/share";

export async function submitSharedResponseAction(
  token: string,
  technical: unknown,
  financial: unknown,
) {
  await submitSharedResponse(token, technical, financial);
}
