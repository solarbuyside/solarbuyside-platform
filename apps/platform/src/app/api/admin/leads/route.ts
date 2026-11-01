import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { ORIGENS_LEAD, leadsParaCsv, listLeadsByOrigem } from "@/lib/landing/leads";

/**
 * Exporta em CSV todos os leads de uma origem (`?origem=live-lancamento`).
 * Só admin. Origem fora da lista fechada é recusada.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const origem = new URL(request.url).searchParams.get("origem") ?? "";
  if (!Object.hasOwn(ORIGENS_LEAD, origem)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 400 });
  }

  const leads = await listLeadsByOrigem(origem);
  const dia = new Date().toISOString().slice(0, 10);
  return new NextResponse(leadsParaCsv(leads), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${origem}-${dia}.csv"`,
      "cache-control": "no-store",
    },
  });
}
