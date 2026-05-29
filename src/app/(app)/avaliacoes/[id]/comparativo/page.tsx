import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { loadComparisonInput } from "@/lib/comparisons/repository";
import { DashboardView } from "@/app/(app)/dashboard/dashboard-view";
import {
  updateScoreSettingAction,
  updateSelectedFinalistsAction,
} from "@/app/(app)/dashboard/[id]/actions";
import { PhaseNav } from "../_components/phase-nav";

type ComparativoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ComparativoPage({ params }: ComparativoPageProps) {
  const { id } = await params;
  const comparison = await loadComparisonInput(id).catch(() => null);

  if (!comparison) {
    notFound();
  }

  return (
    <div className="space-y-7">
      <PhaseNav comparisonId={id} current="comparativo" title={comparison.title} />

      <DashboardView
        initialComparison={comparison}
        embedded
        tableOnly
        persistence={{
          onScoreSettingChange: updateScoreSettingAction,
          onFinalistsChange: updateSelectedFinalistsAction,
        }}
      />

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <Link
          href={`/avaliacoes/${id}/finalistas`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.25)] active:scale-[0.98]"
        >
          Definir finalistas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
