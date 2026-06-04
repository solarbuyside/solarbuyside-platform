import { Loader2 } from "lucide-react";

export default function AvaliacaoLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm font-medium">Carregando avaliação…</p>
      </div>
    </div>
  );
}
