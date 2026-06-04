/**
 * Skeletons de carregamento exibidos instantaneamente pelo Next (loading.tsx)
 * enquanto a página server-rendered carrega. Dão feedback imediato ao navegar
 * entre abas — sem eles a navegação parece "travada" até a página chegar.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />;
}

/** Cabeçalho (título + subtítulo) comum às páginas. */
export function HeaderSkeleton() {
  return (
    <div className="space-y-2 border-b border-slate-200 pb-5">
      <Bar className="h-7 w-52" />
      <Bar className="h-4 w-72 max-w-full" />
    </div>
  );
}

/** Grade de cards (avaliações, listas). */
export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Bar className="h-4 w-20" />
          <Bar className="mt-3 h-5 w-3/4" />
          <Bar className="mt-2 h-3 w-1/2" />
          <Bar className="mt-5 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** Lista de linhas (histórico, atividades). */
export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Bar className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Bar className="h-4 w-1/2" />
            <Bar className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
