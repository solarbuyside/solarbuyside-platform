import { getCurrentUser } from "@/lib/auth/current-user";
import { listComparisonSummaries } from "@/lib/comparisons/repository";
import { AppShell, type SearchItem } from "./app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Search index: the user's own comparisons (title + competitor names).
  let searchItems: SearchItem[] = [];
  try {
    const summaries = await listComparisonSummaries();
    searchItems = summaries.map((s) => ({
      id: s.id,
      title: s.title,
      competitors: s.competitors.map((c) => c.name),
    }));
  } catch {
    searchItems = [];
  }

  return (
    <AppShell
      user={{
        fullName: user?.fullName ?? null,
        email: user?.email ?? null,
        isAdmin: user?.isAdmin ?? false,
      }}
      searchItems={searchItems}
    >
      {children}
    </AppShell>
  );
}
