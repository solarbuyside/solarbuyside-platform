-- =====================================================================
-- Solar Buy-Side — Migration 0004: biblioteca de empresas (cole e Run)
-- Idempotente. Empresas salvas pelo comprador para reaproveitar em novos
-- comparativos (nome + dados de empresa e tecnicos guardados em jsonb).
-- =====================================================================

create table if not exists public.saved_companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  seller_name text,
  notes text,
  company_payload jsonb not null default '{}'::jsonb,
  technical_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, company_name)
);

create index if not exists saved_companies_owner_id_idx
  on public.saved_companies (owner_id);

alter table public.saved_companies enable row level security;

drop policy if exists "saved_companies_owner_all" on public.saved_companies;
create policy "saved_companies_owner_all"
  on public.saved_companies for all
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop trigger if exists saved_companies_set_updated_at on public.saved_companies;
create trigger saved_companies_set_updated_at
  before update on public.saved_companies
  for each row execute function public.set_updated_at();
