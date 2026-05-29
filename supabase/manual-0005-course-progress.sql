-- =====================================================================
-- Solar Buy-Side — Migration 0005: progresso do curso (cole e Run)
-- Idempotente. Marca quais licoes cada usuario concluiu.
-- =====================================================================

create table if not exists public.course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.course_progress enable row level security;

drop policy if exists "course_progress_owner_all" on public.course_progress;
create policy "course_progress_owner_all"
  on public.course_progress for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
