import { notFound } from "next/navigation";

import { loadComparisonInput } from "@/lib/comparisons/repository";
import { PhaseNav } from "../_components/phase-nav";
import { StepWizard } from "./step-wizard";

type PreencherPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PreencherPage({ params }: PreencherPageProps) {
  const { id } = await params;
  const comparison = await loadComparisonInput(id).catch((err) => {
    console.error("[preencher] loadComparisonInput failed for", id, err);
    return null;
  });

  if (!comparison) {
    notFound();
  }

  return (
    <div className="space-y-7">
      <PhaseNav comparisonId={id} current="entrevista" title={comparison.title} />
      <StepWizard comparison={comparison} />
    </div>
  );
}
