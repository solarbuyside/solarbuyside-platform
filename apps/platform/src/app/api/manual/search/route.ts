import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { searchManualFullText } from "@/lib/manual/manual-index";

export const runtime = "nodejs";

/**
 * Busca em texto completo no Manual (todas as 161 páginas).
 *
 * Complementa a busca instantânea por capítulo do header (que roda no cliente
 * sobre o índice curado). Aqui o termo é procurado no corpo de cada página e
 * retornamos página + trecho. O texto fica no servidor (cacheado), então só o
 * resultado trafega — sem enviar ~214KB de texto ao cliente em cada navegação.
 *
 * Protegida por login (o conteúdo do manual é de acesso pago).
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ pages: [] }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ pages: [] });

  const pages = await searchManualFullText(q, 8);
  return NextResponse.json({ pages });
}
