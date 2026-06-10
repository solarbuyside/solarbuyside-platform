import { HeaderSkeleton, CardsSkeleton } from "../_components/page-skeleton";

export default function AvaliacoesLoading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200/60 sm:max-w-xs" />
      <CardsSkeleton />
    </div>
  );
}
