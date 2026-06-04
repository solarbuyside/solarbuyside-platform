import { Loader2 } from "lucide-react";

export default function ManualLoading() {
  return (
    <div className="flex h-[calc(100vh-10.5rem)] items-center justify-center md:h-[calc(100vh-9rem)]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm font-medium">Abrindo o manual…</p>
      </div>
    </div>
  );
}
