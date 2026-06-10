import { createAdminClient } from "@/lib/supabase/admin";

export type AdminUserRow = {
  id: string;
  email: string | null;
  fullName: string | null;
  createdAt: string;
  comparisonCount: number;
  completedCount: number;
};

export type AdminComparisonRow = {
  id: string;
  title: string;
  status: string;
  ownerEmail: string | null;
  competitorCount: number;
  finalistCount: number;
  updatedAt: string;
};

export type AdminEventRow = {
  id: string;
  eventType: string;
  ownerEmail: string | null;
  comparisonTitle: string | null;
  createdAt: string;
};

export type UsagePoint = { date: string; comparisons: number; users: number };

export type AdminOverview = {
  totals: {
    users: number;
    comparisons: number;
    completed: number;
    competitors: number;
  };
  usage: UsagePoint[];
  users: AdminUserRow[];
  comparisons: AdminComparisonRow[];
  events: AdminEventRow[];
};

/**
 * Super-admin overview. Uses the service key (bypasses RLS) — only call from a
 * route already gated by `isAdmin`. Reads profiles, comparisons and competitor
 * counts to build a cross-tenant dashboard.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createAdminClient();

  const [profilesRes, comparisonsRes, competitorsRes, eventsRes] = await Promise.all([
    admin
      .from("profiles")
      .select("id,email,full_name,created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("comparisons")
      .select("id,owner_id,title,status,selected_finalist_ids,created_at,updated_at")
      .order("updated_at", { ascending: false }),
    admin.from("competitors").select("id,comparison_id"),
    admin
      .from("comparison_events")
      .select("id,event_type,comparison_id,actor_id,created_at")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const profiles = profilesRes.data ?? [];
  const comparisons = comparisonsRes.data ?? [];
  const competitors = competitorsRes.data ?? [];
  const events = eventsRes.data ?? [];

  const emailByOwner = new Map<string, string | null>();
  const nameByOwner = new Map<string, string | null>();
  for (const p of profiles) {
    emailByOwner.set(p.id, p.email);
    nameByOwner.set(p.id, p.full_name);
  }

  const competitorCountByComparison = new Map<string, number>();
  for (const c of competitors) {
    competitorCountByComparison.set(
      c.comparison_id,
      (competitorCountByComparison.get(c.comparison_id) ?? 0) + 1,
    );
  }

  const comparisonsByOwner = new Map<string, number>();
  const completedByOwner = new Map<string, number>();
  for (const c of comparisons) {
    comparisonsByOwner.set(c.owner_id, (comparisonsByOwner.get(c.owner_id) ?? 0) + 1);
    if (c.status === "completed") {
      completedByOwner.set(c.owner_id, (completedByOwner.get(c.owner_id) ?? 0) + 1);
    }
  }

  const users: AdminUserRow[] = profiles.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    createdAt: p.created_at,
    comparisonCount: comparisonsByOwner.get(p.id) ?? 0,
    completedCount: completedByOwner.get(p.id) ?? 0,
  }));

  const adminComparisons: AdminComparisonRow[] = comparisons.map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    ownerEmail: emailByOwner.get(c.owner_id) ?? null,
    competitorCount: competitorCountByComparison.get(c.id) ?? 0,
    finalistCount: (c.selected_finalist_ids ?? []).length,
    updatedAt: c.updated_at,
  }));

  // Usage over the last 14 days: comparisons created + users registered per day.
  const days = 14;
  const usage: UsagePoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const label = day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const comparisonsOnDay = comparisons.filter(
      (c) => (c.created_at ?? "").slice(0, 10) === key,
    ).length;
    const usersOnDay = profiles.filter((p) => (p.created_at ?? "").slice(0, 10) === key).length;
    usage.push({ date: label, comparisons: comparisonsOnDay, users: usersOnDay });
  }

  const titleByComparison = new Map<string, string>();
  for (const c of comparisons) titleByComparison.set(c.id, c.title);

  const adminEvents: AdminEventRow[] = events.map((e) => ({
    id: e.id,
    eventType: e.event_type,
    ownerEmail: e.actor_id ? emailByOwner.get(e.actor_id) ?? null : null,
    comparisonTitle: titleByComparison.get(e.comparison_id) ?? null,
    createdAt: e.created_at,
  }));

  return {
    totals: {
      users: profiles.length,
      comparisons: comparisons.length,
      completed: comparisons.filter((c) => c.status === "completed").length,
      competitors: competitors.length,
    },
    usage,
    users,
    comparisons: adminComparisons,
    events: adminEvents,
  };
}
