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

export type AdminOverview = {
  totals: {
    users: number;
    comparisons: number;
    completed: number;
    competitors: number;
  };
  users: AdminUserRow[];
  comparisons: AdminComparisonRow[];
};

/**
 * Super-admin overview. Uses the service key (bypasses RLS) — only call from a
 * route already gated by `isAdmin`. Reads profiles, comparisons and competitor
 * counts to build a cross-tenant dashboard.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createAdminClient();

  const [profilesRes, comparisonsRes, competitorsRes] = await Promise.all([
    admin
      .from("profiles")
      .select("id,email,full_name,created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("comparisons")
      .select("id,owner_id,title,status,selected_finalist_ids,updated_at")
      .order("updated_at", { ascending: false }),
    admin.from("competitors").select("id,comparison_id"),
  ]);

  const profiles = profilesRes.data ?? [];
  const comparisons = comparisonsRes.data ?? [];
  const competitors = competitorsRes.data ?? [];

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

  return {
    totals: {
      users: profiles.length,
      comparisons: comparisons.length,
      completed: comparisons.filter((c) => c.status === "completed").length,
      competitors: competitors.length,
    },
    users,
    comparisons: adminComparisons,
  };
}
