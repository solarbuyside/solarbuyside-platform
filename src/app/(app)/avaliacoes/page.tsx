import Link from "next/link";
import { Plus, ArrowRight, FileSpreadsheet, Users, Clock } from "lucide-react";

import { listComparisonSummaries } from "@/lib/comparisons/repository";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS: Record<string, { label: string; variant: "secondary" | "orange" | "emerald" }> = {
  draft: { label: "Rascunho", variant: "orange" },
  ready_for_review: { label: "Em revisão", variant: "orange" },
  completed: { label: "Concluída", variant: "emerald" },
};

export default async function AvaliacoesPage() {
  const comparisons = await listComparisonSummaries().catch(() => []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Avaliações Solar</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie e crie novas comparações para seus fornecedores de energia solar.
          </p>
        </div>
        <Link
          href="/avaliacoes/nova"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground outline-none transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary/90 hover:shadow-[0_4px_15px_rgba(249,115,22,0.2)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nova Avaliação
        </Link>
      </div>

      {comparisons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-700">Nenhuma avaliação ainda</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Crie sua primeira comparação para começar a entrevistar fornecedores e decidir com critério.
          </p>
          <Link
            href="/avaliacoes/nova"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Criar primeira avaliação
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((c) => {
            const status = STATUS[c.status] ?? { label: c.status, variant: "secondary" as const };
            const updated = new Date(c.updatedAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            return (
              <Card key={c.id} hoverGlow className="flex flex-col border-slate-200 bg-white">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant={status.variant} className="text-[10px] uppercase">
                      {status.label}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <Clock className="h-3 w-3" />
                      {updated}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-slate-900">{c.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    {c.competitorCount} {c.competitorCount === 1 ? "fornecedor" : "fornecedores"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-xs text-slate-600">
                  {c.competitors.length > 0 ? (
                    <p className="line-clamp-2">
                      {c.competitors.map((comp) => comp.name).join(" · ")}
                    </p>
                  ) : (
                    <p className="text-slate-400">Sem fornecedores cadastrados.</p>
                  )}
                </CardContent>
                <CardFooter className="justify-between border-t border-slate-100 bg-slate-50/50 pt-4">
                  <Link
                    href={`/avaliacoes/${c.id}/preencher`}
                    className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
                  >
                    Continuar preenchimento
                  </Link>
                  <Link
                    href={`/avaliacoes/${c.id}/comparativo`}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Ver comparativo <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
