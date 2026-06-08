import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser, needsOnboarding, getAccessGate, getAccessExpiry } from "@/lib/auth/current-user";
import { listComparisonSummaries, listRecentEvents } from "@/lib/comparisons/repository";
import { loadManualChapters } from "@/lib/manual/manual-index";
import { verify2faToken, TWO_FA_COOKIE } from "@/lib/auth/two-factor";
import { AppShell, type SearchItem, type NotificationItem, type ManualChapterItem } from "./app-shell";
import { OnboardingModal } from "./onboarding-modal";
import { AccessBlocked } from "./_components/access-blocked";
import { ExpiryBanner } from "./_components/expiry-banner";

const EXPIRY_WARN_DAYS = 15;

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
  // Portão de acesso pago: barra contas expiradas/bloqueadas (admin e contas
  // sem validade passam direto).
  const gate = await getAccessGate();
  if (!gate.allowed) return <AccessBlocked reason={gate.reason as "expired" | "blocked"} />;

  const user = await getCurrentUser();
  // 2FA por e-mail: não-admin precisa ter verificado o código deste login.
  if (user && !user.isAdmin) {
    const cookieStore = await cookies();
    if (!verify2faToken(user.id, cookieStore.get(TWO_FA_COOKIE)?.value)) {
      redirect("/verificar");
    }
  }

  const showOnboarding = await needsOnboarding();
  const expiry = await getAccessExpiry();
  const showExpiryWarning = expiry !== null && expiry.daysLeft <= EXPIRY_WARN_DAYS;

  let searchItems: SearchItem[] = [];
  let notifications: NotificationItem[] = [];
  let manualChapters: ManualChapterItem[] = [];
  try {
    const [summaries, events, chapters] = await Promise.all([
      listComparisonSummaries(),
      listRecentEvents(8),
      loadManualChapters(),
    ]);
    manualChapters = chapters.map((c) => ({ title: c.title, page: c.page }));
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
      manualChapters={manualChapters}
      notifications={notifications}
    >
      {showExpiryWarning && expiry ? (
        <div className="mb-5">
          <ExpiryBanner daysLeft={expiry.daysLeft} />
        </div>
      ) : null}
      {children}
      <OnboardingModal autoOpen={showOnboarding} />
    </AppShell>
  );
}
