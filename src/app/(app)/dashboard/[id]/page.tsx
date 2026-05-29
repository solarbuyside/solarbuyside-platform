import { notFound } from "next/navigation";

import { loadComparisonInput } from "@/lib/comparisons/repository";
import { DashboardView } from "../dashboard-view";
import { updateScoreSettingAction, updateSelectedFinalistsAction } from "./actions";

type DashboardByIdProps = {
  params: Promise<{ id: string }>;
};

export default async function DashboardByIdPage({ params }: DashboardByIdProps) {
  const { id } = await params;
  const comparison = await loadComparisonInput(id).catch(() => null);

  if (!comparison) {
    notFound();
  }

  return (
    <DashboardView
      initialComparison={comparison}
      persistence={{
        onScoreSettingChange: updateScoreSettingAction,
        onFinalistsChange: updateSelectedFinalistsAction,
      }}
    />
  );
}
