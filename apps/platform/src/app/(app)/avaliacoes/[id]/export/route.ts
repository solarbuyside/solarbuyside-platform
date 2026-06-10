import { NextResponse } from "next/server";

import { loadComparisonInput } from "@/lib/comparisons/repository";
import { buildComparisonWorkbook } from "@/lib/reports/comparison-xlsx";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const comparison = await loadComparisonInput(id).catch(() => null);
  if (!comparison) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  const buffer = await buildComparisonWorkbook(comparison);
  const safeTitle = comparison.title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "avaliacao";

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeTitle} - Solar Buy-Side.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
