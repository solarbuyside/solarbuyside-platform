import Link from "next/link";
import {
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Trophy,
  Clock,
  Sparkles,
  Users,
  PencilLine,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getHomeOverview } from "@/lib/comparisons/home";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBRL } from "@/lib/utils";

const STATUS: Record<string, { label: string; variant: "orange" | "emerald" | "secondary" }> = {
  draft: { label: "Rascunho", variant: "orange" },
  ready_for_review: { label: "Em revisão", variant: "orange" },
  completed: { label: "Concluída", variant: "emerald" },
};

function firstNameFrom(fullName: string | null, email: string | null) {
  if (fullName?.trim()) return fullName.trim().split(/\s+/)[0];
  if (email) return email.split("@")[0];
  return null;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const firstName = firstNameFrom(user?.fullName ?? null, user?.email ?? null);
  const overview = await getHomeOverview(firstName);

  const greeting = overview.firstName ? `Olá, ${overview.firstName}!` : "Olá!";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero / invitation */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#020719] via-[#061233] to-[#0a1e4d] p-8 text-white md:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(120% 100% at 80% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(120% 100% at 80% 0%, black 30%, transparent 75%)",
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{greeting}</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-300">
            Que tal realizar um comparativo entre propostas hoje? Reúna os orçamentos, pontue empresa e
            tecnologia, e descubra com clareza a melhor escolha.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/avaliacoes/nova"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_20px_rgba(249,115,22,0.4)] active:scale-[0.98]"
            >
              <Plus className="h-4.5 w-4.5" />
              Novo comparativo
            </Link>
            {overview.totals.total > 0 && (
              <Link
                href="/avaliacoes"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
              >
                Ver minhas avaliações
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {overview.totals.total > 0 && (
            <div className="mt-7 flex flex-wrap gap-6 text-sm">
              <Stat label="Avaliações" value={overview.totals.total} />
              <Stat label="Rascunhos" value={overview.totals.drafts} />
              <Stat label="Concluídas" value={overview.totals.completed} />
            </div>
          )}
        </div>
      </section>

      {/* Empty state for brand-new users */}
      {overview.totals.total === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-800">Comece sua primeira comparação</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Cadastre os fornecedores que enviaram propostas e a plataforma te ajuda a comparar com
            critério — empresa, tecnologia e viabilidade financeira.
          </p>
          <Link
            href="/avaliacoes/nova"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Criar avaliação
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Continue where you left off */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <PencilLine className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Continue de onde parou
              </h2>
            </div>
            <div className="space-y-3">
              {overview.recent.map((r) => {
                const status = STATUS[r.status] ?? { label: r.status, variant: "secondary" as const };
                return (
                  <Link
                    key={r.id}
                    href={`/avaliacoes/${r.id}/preencher`}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(249,115,22,0.1)]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{r.title}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <Users className="h-3 w-3" />
                        {r.competitorCount} fornecedores
                        <span>·</span>
                        <Clock className="h-3 w-3" />
                        {new Date(r.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant={status.variant} className="shrink-0 text-[10px]">
                      {status.label}
                    </Badge>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Best choices */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Melhores escolhas
              </h2>
            </div>
            {overview.bestChoices.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                Preencha os dados de uma avaliação para ver a melhor escolha aqui.
              </div>
            ) : (
              <div className="space-y-3">
                {overview.bestChoices.map((b) => (
                  <Link
                    key={b.id}
                    href={`/avaliacoes/${b.id}/finalistas`}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(249,115,22,0.1)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-slate-400">{b.title}</p>
                      <p className="truncate text-sm font-bold text-slate-900">{b.leaderName}</p>
                      {b.investment != null && (
                        <p className="text-[11px] text-slate-500">{formatCurrencyBRL(b.investment)}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xl font-extrabold text-slate-900">{b.leaderGrade}</span>
                      <span className="text-xs font-bold text-slate-300">/10</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="ml-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  );
}
