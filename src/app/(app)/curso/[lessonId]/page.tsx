import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Lightbulb, CheckCircle2, Quote, BookOpen } from "lucide-react";

import { findLesson, type ContentBlock } from "@/domain/course/content";
import { getCompletedLessons } from "@/lib/course/progress";
import { CompleteButton } from "./complete-button";
import { LessonIllustration, type IllustrationKey } from "./illustration";

type LessonPageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const found = findLesson(lessonId);
  if (!found) notFound();

  const { module: mod, lesson, next } = found;
  const completed = await getCompletedLessons().catch(() => new Set<string>());
  const isDone = completed.has(lesson.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link href="/curso" className="transition-colors hover:text-primary">
          Curso
        </Link>
        <span>/</span>
        <span className="text-slate-600">{mod.title}</span>
      </div>

      <Link
        href="/curso"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao curso
      </Link>

      {/* Lesson header */}
      <div className="border-b border-slate-200 pb-5">
        {isDone && (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Concluída
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{lesson.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {lesson.minutes} min de leitura
        </p>
      </div>

      {/* Illustration hero */}
      <LessonIllustration kind={lesson.illustration as IllustrationKey} />

      {/* Content */}
      <article className="space-y-5">
        {lesson.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </article>

      {/* Complete + next */}
      <div className="border-t border-slate-200 pt-6">
        <CompleteButton
          lessonId={lesson.id}
          initialDone={isDone}
          nextHref={next ? `/curso/${next.id}` : null}
        />
      </div>
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "h":
      return <h2 className="pt-2 text-xl font-bold text-slate-900">{block.text}</h2>;
    case "p":
      return <p className="text-[15px] leading-relaxed text-slate-700">{block.text}</p>;
    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div className="flex gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
          <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-slate-700">{block.text}</p>
        </div>
      );
    case "example":
      return (
        <div className="rounded-xl border border-sky-200/70 bg-sky-50/70 p-4">
          <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700">
            <Quote className="h-3.5 w-3.5" />
            {block.title}
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{block.text}</p>
        </div>
      );
    case "term":
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-900">
            <BookOpen className="h-4 w-4 text-primary" />
            {block.term}
          </p>
          <p className="text-sm leading-relaxed text-slate-600">{block.text}</p>
        </div>
      );
    default:
      return null;
  }
}
