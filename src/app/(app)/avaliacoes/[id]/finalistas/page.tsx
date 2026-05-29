import { notFound } from "next/navigation";

import { loadComparisonInput } from "@/lib/comparisons/repository";
import { PhaseNav } from "../_components/phase-nav";
import { FinalistsView } from "./finalists-view";

type FinalistasPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FinalistasPage({ params }: FinalistasPageProps) {
  const { id } = await params;
  const comparison = await loadComparisonInput(id).catch(() => null);

  if (!comparison) {
    notFound();
  }

  return (
    <div className="space-y-7">
      <PhaseNav comparisonId={id} current="finalistas" title={comparison.title} />
      <FinalistsView comparison={comparison} />
    </div>
  );
}
