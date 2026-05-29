import { getCurrentUser } from "@/lib/auth/current-user";
import { listComparisonSummaries, listRecentEvents } from "@/lib/comparisons/repository";
import { AppShell, type SearchItem, type NotificationItem } from "./app-shell";

const EVENT_LABELS: Record<string, { title: string; description: string }> = {
  "comparison.created": {
    title: "Nova avaliação criada",
    description: "Uma comparação foi iniciada.",
  },
  "competitor.shared_response_submitted": {
    title: "Fornecedor respondeu",
    description: "Um fornecedor preencheu o formulário compartilhado.",
  },
};

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return `há ${days} d`;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  let searchItems: SearchItem[] = [];
  let notifications: NotificationItem[] = [];
  try {
    const [summaries, events] = await Promise.all([
      listComparisonSummaries(),
      listRecentEvents(8),
    ]);
    searchItems = summaries.map((s) => ({
      id: s.id,
      title: s.title,
      competitors: s.competitors.map((c) => c.name),
    }));
    notifications = events.map((e) => {
      const label = EVENT_LABELS[e.eventType] ?? {
        title: "Atividade",
        description: e.eventType,
      };
      return {
        id: e.id,
        title: label.title,
        description: label.description,
        at: relativeTime(e.createdAt),
      };
    });
  } catch {
    // ignore — header still renders without these
  }

  return (
    <AppShell
      user={{
        fullName: user?.fullName ?? null,
        email: user?.email ?? null,
        isAdmin: user?.isAdmin ?? false,
      }}
      searchItems={searchItems}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}
