import { HeaderSkeleton, ListSkeleton } from "../_components/page-skeleton";

export default function HistoricoLoading() {
  return (
    <div className="space-y-5 md:space-y-8">
      <HeaderSkeleton />
      <ListSkeleton count={8} />
    </div>
  );
}
