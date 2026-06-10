import { notFound } from "next/navigation";

import { loadComparisonInput } from "@/lib/comparisons/repository";
import { PhaseNav } from "../_components/phase-nav";
import { ComparativoView } from "./comparativo-view";

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
      <ComparativoView comparison={comparison} />
    </div>
  );
}
