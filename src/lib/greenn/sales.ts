import { createAdminClient } from "@/lib/supabase/admin";

/** Métricas de vendas a partir dos eventos do webhook da Greenn. Server-only. */

export type SaleEvent = {
  email: string | null;
  status: string | null;
  orderId: string | null;
  createdAt: string;
};

export type SalesOverview = {
  paid: number;
  refunded: number;
  chargedback: number;
  net: number;
  recent: SaleEvent[];
};

export async function getSalesOverview(): Promise<SalesOverview> {
  const admin = createAdminClient();
  const count = async (status: string) =>
    (await admin.from("greenn_events").select("*", { count: "exact", head: true }).eq("status", status))
      .count ?? 0;

  const [paid, refunded, chargedback, recent] = await Promise.all([
    count("paid"),
    count("refunded"),
    count("chargedback"),
    admin
      .from("greenn_events")
      .select("email,status,order_id,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    paid,
    refunded,
    chargedback,
    net: paid - refunded - chargedback,
    recent: (recent.data ?? []).map((r) => ({
      email: r.email,
      status: r.status,
      orderId: r.order_id,
      createdAt: r.created_at,
    })),
  };
}
