import Link from "next/link";
import { GraduationCap, Clock, PlayCircle, Check } from "lucide-react";

import { COURSE, TOTAL_LESSONS } from "@/domain/course/content";
import { getCompletedLessons } from "@/lib/course/progress";
import { Badge } from "@/components/ui/badge";

const LEVEL_VARIANT: Record<string, "emerald" | "orange" | "secondary"> = {
  Iniciante: "emerald",
  Intermediário: "orange",
  Avançado: "secondary",
};

export default async function CursoPage() {
  const completed = await getCompletedLessons().catch(() => new Set<string>());
  const doneCount = completed.size;
  const pct = TOTAL_LESSONS > 0 ? Math.round((doneCount / TOTAL_LESSONS) * 100) : 0;
  const totalMinutes = COURSE.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.minutes, 0),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with overall progress */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#020719] via-[#061233] to-[#0a1e4d] p-8 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <GraduationCap className="h-3.5 w-3.5" />
              Aprendizado
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Curso Solar Buy-Side</h2>
            <p className="mt-1.5 max-w-xl text-sm text-slate-300">
              Aprenda a comprar energia solar com critério — da tecnologia à negociação final.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5">
                <PlayCircle className="h-3.5 w-3.5 text-primary" />
                {COURSE.length} módulos · {TOTAL_LESSONS} aulas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                ~{Math.round(totalMinutes / 60)}h de conteúdo
              </span>
            </div>
          </div>

          {/* Progress ring-ish */}
          <div className="shrink-0 rounded-xl bg-white/[0.06] p-5 text-center">
            <p className="text-4xl font-extrabold">{pct}%</p>
            <p className="mt-1 text-xs text-slate-300">
              {doneCount} de {TOTAL_LESSONS} aulas concluídas
            </p>
            <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {COURSE.map((mod, modIdx) => {
          const modDone = mod.lessons.filter((l) => completed.has(l.id)).length;
          const modComplete = modDone === mod.lessons.length;
          return (
            <section key={mod.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                      modComplete ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {modComplete ? <Check className="h-5 w-5" /> : modIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                    <p className="text-xs text-slate-500">{mod.description}</p>
                  </div>
                </div>
                <Badge variant={LEVEL_VARIANT[mod.level] ?? "secondary"} className="shrink-0 text-[10px]">
                  {mod.level}
                </Badge>
              </div>

              <div className="divide-y divide-slate-50">
                {mod.lessons.map((lesson) => {
                  const isDone = completed.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/curso/${lesson.id}`}
                      className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                          isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 text-slate-300 group-hover:border-primary/50 group-hover:text-primary"
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
                      </span>
                      <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {lesson.title}
                      </span>
                      <span className="text-[11px] text-slate-400">{lesson.minutes} min</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {pct === 100 && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Parabéns, curso concluído! 🎉</p>
            <p className="text-xs text-emerald-700">
              Você dominou os fundamentos para comprar energia solar com critério.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
