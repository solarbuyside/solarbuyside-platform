import { ShieldCheck } from "lucide-react";

import { listContractReviews } from "@/lib/contracts/repository";
import { CuradoriaClient, type SavedReview } from "./curadoria-client";

export default async function CuradoriaPage() {
  const saved = await listContractReviews().catch(() => []);
  const initialReviews: SavedReview[] = saved.map((r) => ({
    id: r.id,
    title: r.title,
    verdict: r.verdict,
    score: r.score,
    approvedByUser: r.approvedByUser,
    createdAt: r.createdAt,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Curadoria de Contratos
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Curadoria de Contratos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cole o contrato do fornecedor e a plataforma aponta cláusulas e ausências de risco antes de você assinar.
        </p>
      </div>

      <CuradoriaClient initialReviews={initialReviews} />
    </div>
  );
}
