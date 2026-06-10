create table if not exists public.contract_reviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  contract_text text not null,
  verdict text not null check (verdict in ('reproved', 'attention', 'approved')),
  score int not null default 0,
  findings jsonb not null default '[]'::jsonb,
  approved_by_user boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contract_reviews_owner_id_idx
  on public.contract_reviews (owner_id, created_at desc);

alter table public.contract_reviews enable row level security;

create policy "contract_reviews_owner_all"
  on public.contract_reviews for all
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create trigger contract_reviews_set_updated_at
  before update on public.contract_reviews
  for each row execute function public.set_updated_at();
