import { CardsSkeleton } from "../_components/page-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 md:space-y-8">
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200/60 md:h-48" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="h-44 animate-pulse rounded-2xl bg-slate-200/50" />
        <div className="h-44 animate-pulse rounded-2xl bg-slate-200/50" />
      </div>
      <CardsSkeleton count={3} />
    </div>
  );
}
