"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { toggleLessonAction } from "../actions";

export function CompleteButton({
  lessonId,
  initialDone,
  nextHref,
}: {
  lessonId: string;
  initialDone: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [done, setDone] = React.useState(initialDone);
  const [pending, setPending] = React.useState(false);

  async function toggle() {
    setPending(true);
    const next = !done;
    try {
      await toggleLessonAction(lessonId, next);
      setDone(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={toggle}
        disabled={pending}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-70",
          done
            ? "border border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.25)]",
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : done ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {done ? "Marcar como não concluída" : "Marcar como concluída"}
      </button>

      {done && nextHref && (
        <a
          href={nextHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all hover:border-primary/40 hover:text-primary active:scale-[0.98]"
        >
          Próxima aula →
        </a>
      )}
    </div>
  );
}
