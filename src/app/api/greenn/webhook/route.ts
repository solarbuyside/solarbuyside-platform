import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { cleanEnv } from "@/lib/env";
import { provisionGreennAccess, revokeGreennAccess } from "@/lib/access/provisioning";

export const runtime = "nodejs";

/**
 * Webhook da Greenn (compra/reembolso).
 *
 * A Greenn não documenta como o token chega, então aceitamos em 3 lugares
 * (query ?token=, header, ou campo no corpo) e comparamos em tempo constante
 * com GREENN_WEBHOOK_TOKEN. O payload exato dos campos é logado cru na primeira
 * chamada real para confirmar/ajustar o mapeamento.
 *
 * Status (currentStatus): paid -> provisiona; refunded/chargedback -> bloqueia.
 */

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function pick(obj: unknown, paths: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const path of paths) {
    let cur: unknown = obj;
    for (const part of path.split(".")) {
      if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string" && cur.trim()) return cur.trim();
    if (typeof cur === "number") return String(cur);
  }
  return undefined;
}

async function readBody(req: NextRequest): Promise<Record<string, unknown>> {
  const ctype = req.headers.get("content-type") ?? "";
  try {
    if (ctype.includes("application/json")) return (await req.json()) as Record<string, unknown>;
    if (ctype.includes("form")) {
      const form = await req.formData();
      return Object.fromEntries(form.entries());
    }
    const text = await req.text();
    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const expected = cleanEnv(process.env.GREENN_WEBHOOK_TOKEN);
  if (!expected) {
    console.error("[greenn] GREENN_WEBHOOK_TOKEN não configurado");
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  }

  const body = await readBody(req);

  // Token: query, header ou corpo.
  const provided =
    req.nextUrl.searchParams.get("token") ??
    req.headers.get("x-greenn-token") ??
    req.headers.get("x-webhook-token") ??
    (req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null) ??
    (typeof body.token === "string" ? body.token : null) ??
    (typeof body.webhook_token === "string" ? body.webhook_token : null);

  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Log cru para mapear os campos na primeira chamada real.
  console.log("[greenn] webhook payload:", JSON.stringify(body));

  const status =
    pick(body, ["currentStatus", "sale.currentStatus", "sale.status", "status"]) ?? "";
  const email = pick(body, [
    "client.email",
    "customer.email",
    "buyer.email",
    "sale.client.email",
    "email",
  ]);
  const name = pick(body, ["client.name", "customer.name", "buyer.name", "sale.client.name", "name"]);
  const orderId = pick(body, ["sale.id", "saleId", "order_id", "id", "sale.code"]) ?? "";

  if (!email) {
    console.error("[greenn] webhook sem email — payload:", JSON.stringify(body));
    // 200 para não disparar retries; nada a fazer sem e-mail.
    return NextResponse.json({ ok: true, ignored: "no email" });
  }

  const normalized = status.toLowerCase();
  try {
    if (normalized === "paid") {
      const res = await provisionGreennAccess({ email, orderId, fullName: name ?? null });
      return NextResponse.json({ ok: res.ok, action: "provision", created: res.created, error: res.error });
    }
    if (normalized === "refunded" || normalized === "chargedback") {
      const res = await revokeGreennAccess({ orderId: orderId || undefined, email });
      return NextResponse.json({ ok: res.ok, action: "revoke", error: res.error });
    }
    // refused/waiting_payment/etc — sem ação.
    return NextResponse.json({ ok: true, ignored: normalized || "unknown status" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro inesperado";
    console.error("[greenn] webhook erro:", message);
    // 200 evita retry-storm; o erro fica no log para investigação.
    return NextResponse.json({ ok: false, error: message });
  }
}
