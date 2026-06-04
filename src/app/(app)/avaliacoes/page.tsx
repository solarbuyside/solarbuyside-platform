import Link from "next/link";
import { Plus } from "lucide-react";

import { listComparisonSummaries } from "@/lib/comparisons/repository";
import { AvaliacoesList, type ComparisonListItem } from "./avaliacoes-list";

export default async function AvaliacoesPage() {
  const summaries = await listComparisonSummaries().catch(() => []);

  const items: ComparisonListItem[] = summaries.map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    competitorCount: s.competitorCount,
    competitors: s.competitors.map((c) => c.name),
    updatedAt: s.updatedAt,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Avaliações Solar</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie, busque e crie comparações para seus fornecedores de energia solar.
          </p>
        </div>
        <Link
          href="/avaliacoes/nova"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground outline-none transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary/90 hover:shadow-[0_4px_15px_rgba(249,115,22,0.2)] active:scale-[0.98] sm:w-auto sm:text-base sm:font-medium"
        >
          <Plus className="h-4 w-4" />
          Nova Avaliação
        </Link>
      </div>

      <AvaliacoesList items={items} />
    </div>
  );
}
