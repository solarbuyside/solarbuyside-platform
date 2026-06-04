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
  { id: "entrevista", label: "Preenchimento", hint: "Coletar dados das empresas de solar", icon: ClipboardList, segment: "preencher" },
  { id: "comparativo", label: "Comparativo", hint: "Pontuação lado a lado", icon: BarChart3, segment: "comparativo" },
  { id: "finalistas", label: "Finalistas", hint: "Decisão final entre os dois", icon: Trophy, segment: "finalistas" },
];

/**
 * Top navigation shared by the three phases of an evaluation.
 * - Mobile: stepper compacto (1·2·3 ligados por linha + nome da fase atual).
 * - Desktop (md+): cards lado a lado com ícone, título e dica.
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
  const activePhase = PHASES[currentIndex] ?? PHASES[0];

  return (
    <div className="space-y-4 md:space-y-5">
      <div>
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/avaliacoes" className="transition-colors hover:text-primary">
            Avaliações
          </Link>
          <span>/</span>
          <span className="truncate text-slate-600">{title}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
      </div>

      {/* MOBILE — stepper compacto */}
      <div className="md:hidden">
        <div className="flex items-center">
          {PHASES.map((phase, i) => {
            const isActive = phase.id === current;
            const isDone = i < currentIndex;
            return (
              <div key={phase.id} className="flex flex-1 items-center last:flex-none">
                <Link
                  href={`/avaliacoes/${comparisonId}/${phase.segment}`}
                  className="flex flex-col items-center gap-1"
                  aria-label={phase.label}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold transition-all",
                      isActive
                        ? "bg-primary text-white shadow-[0_2px_10px_rgba(249,115,22,0.4)]"
                        : isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500",
                    )}
                  >
                    {isDone ? <Check className="h-4.5 w-4.5" /> : i + 1}
                  </span>
                </Link>
                {i < PHASES.length - 1 && (
                  <span
                    className={cn(
                      "mx-1.5 h-0.5 flex-1 rounded-full",
                      i < currentIndex ? "bg-emerald-500" : "bg-slate-200",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <p className="text-base font-bold text-slate-900">{activePhase.label}</p>
          <span className="text-[11px] font-semibold text-slate-400">
            Etapa {currentIndex + 1} de {PHASES.length}
          </span>
        </div>
        <p className="text-xs text-slate-400">{activePhase.hint}</p>
      </div>

      {/* DESKTOP — cards */}
      <nav className="hidden gap-2 overflow-x-auto md:flex">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isActive = phase.id === current;
          const isDone = i < currentIndex;
          return (
            <Link
              key={phase.id}
              href={`/avaliacoes/${comparisonId}/${phase.segment}`}
              className={cn(
                "group flex min-w-[150px] flex-1 items-center gap-3 rounded-xl border px-4 py-3 transition-all",
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
