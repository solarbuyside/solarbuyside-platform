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
import { loadManualIndex } from "@/lib/manual/manual-index";
import { flattenTocForSearch } from "@/lib/manual/manual-toc";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBRL } from "@/lib/utils";
import { ManualHomeCard } from "./manual-home-card";

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
  const [overview, manualIndex] = await Promise.all([getHomeOverview(firstName), loadManualIndex()]);
  const manualPages = manualIndex?.numPages ?? 0;
  // Capítulos (título + página) para o card resolver onde o usuário parou.
  // Fonte: índice curado (mesma fonte da busca e do leitor).
  const manualChapters = flattenTocForSearch();

  const greeting = overview.firstName ? `Olá, ${overview.firstName}!` : "Olá!";

  return (
    <div className="space-y-5 md:space-y-8 animate-in fade-in duration-300">
      {/* Hero / invitation */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#020719] via-[#061233] to-[#0a1e4d] p-6 text-white md:p-10">
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
          <h1 className="text-2xl font-bold tracking-tight md:text-4xl">{greeting}</h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-slate-300 md:mt-3 md:text-base">
            Aqui você tem tudo para comprar seu sistema solar com segurança: aprenda no{" "}
            <strong className="font-semibold text-white">Manual</strong> e compare propostas nas{" "}
            <strong className="font-semibold text-white">Avaliações</strong>.
          </p>

          {overview.totals.total > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm md:mt-7">
              <Stat label="Avaliações" value={overview.totals.total} />
              <Stat label="Rascunhos" value={overview.totals.drafts} />
              <Stat label="Concluídas" value={overview.totals.completed} />
            </div>
          )}
        </div>
      </section>

      {/* Dois caminhos principais: avaliar e ler o manual */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Caminho 1 — Avaliação */}
        <Link
          href="/avaliacoes/nova"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)]"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900">Avaliar propostas</h3>
              <p className="mt-0.5 text-[13px] leading-snug text-slate-500">
                Reúna os orçamentos, pontue empresa, tecnologia e viabilidade, e descubra a melhor escolha.
              </p>
            </div>
          </div>
          <div className="relative mt-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              <Plus className="h-4 w-4" /> Novo comparativo
            </span>
            {overview.totals.total > 0 && (
              <span className="ml-auto text-xs font-medium text-slate-400">
                {overview.totals.total} no total
              </span>
            )}
          </div>
        </Link>

        {/* Caminho 2 — Manual (com progresso de leitura) */}
        <ManualHomeCard numPages={manualPages} chapters={manualChapters} />
      </section>

      {/* Empty state for brand-new users */}
      {overview.totals.total === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center md:p-10">
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
