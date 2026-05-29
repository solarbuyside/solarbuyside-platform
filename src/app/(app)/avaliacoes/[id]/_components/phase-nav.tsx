import Link from "next/link";
import { ClipboardList, BarChart3, Trophy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "entrevista" | "comparativo" | "finalistas";

const PHASES: Array<{
  id: Phase;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  segment: string;
}> = [
  { id: "entrevista", label: "Entrevista", hint: "Coletar dados dos fornecedores", icon: ClipboardList, segment: "preencher" },
  { id: "comparativo", label: "Comparativo", hint: "Notas e ranking lado a lado", icon: BarChart3, segment: "comparativo" },
  { id: "finalistas", label: "Finalistas", hint: "Decisão final entre os dois", icon: Trophy, segment: "finalistas" },
];

/**
 * Top navigation shared by the three phases of an evaluation. Lets the buyer
 * move between Entrevista → Comparativo → Finalistas while keeping context.
 */
export function PhaseNav({
  comparisonId,
  current,
  title,
}: {
  comparisonId: string;
  current: Phase;
  title: string;
}) {
  const currentIndex = PHASES.findIndex((p) => p.id === current);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/avaliacoes" className="transition-colors hover:text-primary">
            Avaliações
          </Link>
          <span>/</span>
          <span className="text-slate-600">{title}</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      </div>

      <nav className="flex gap-2 overflow-x-auto">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isActive = phase.id === current;
          const isDone = i < currentIndex;
          return (
            <Link
              key={phase.id}
              href={`/avaliacoes/${comparisonId}/${phase.segment}`}
              className={cn(
                "group flex flex-1 min-w-[150px] items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                isActive
                  ? "border-primary/40 bg-primary/5 shadow-[0_2px_12px_rgba(249,115,22,0.08)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isDone
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-slate-100 text-slate-400",
                )}
              >
                {isDone ? <Check className="h-4.5 w-4.5" /> : <Icon className="h-4.5 w-4.5" />}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-bold",
                    isActive ? "text-slate-900" : "text-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] font-extrabold",
                      isActive ? "text-primary" : "text-slate-300",
                    )}
                  >
                    {i + 1}
                  </span>
                  {phase.label}
                </p>
                <p className="truncate text-[11px] text-slate-400">{phase.hint}</p>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
