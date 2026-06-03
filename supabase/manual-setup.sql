-- =====================================================================
-- Solar Buy-Side — Setup manual do banco (cole no SQL Editor do Supabase)
-- =====================================================================
-- Versão IDEMPOTENTE da migration 0001: pode ser rodada mais de uma vez
-- sem quebrar (usa "if not exists" / "drop ... if exists" onde aplicável).
-- Para a fonte de verdade versionada, ver: supabase/migrations/0001_initial_platform_schema.sql
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comparisons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'ready_for_review', 'completed')),
  max_competitors smallint not null default 6 check (max_competitors between 2 and 6),
  selected_finalist_ids uuid[] not null default '{}',
  recommended_finalist_ids uuid[] not null default '{}',
  summary jsonb not null default '{}'::jsonb,
  insights jsonb not null default '[]'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  position smallint not null check (position between 1 and 6),
  company_name text not null,
  seller_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, comparison_id),
  unique (comparison_id, position)
);

create table if not exists public.company_evaluations (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  competitor_id uuid not null,
  solar_since_year int,
  company_founded_year int,
  has_electrical_engineering_crea text check (has_electrical_engineering_crea in ('yes', 'no', 'unknown')),
  engineer_graduation_year int,
  installed_systems_range text check (
    installed_systems_range in ('lt_10', '10_49', '50_100', 'gt_100', 'gt_500', 'gt_1000', 'unknown')
  ),
  own_installation_team text check (
    own_installation_team in ('own', 'outsourced', 'unknown')
  ),
  installation_deadline_days numeric,
  project_execution_warranty_years numeric,
  has_maintenance_support text check (has_maintenance_support in ('yes', 'no', 'unknown')),
  support_deadline_days numeric,
  delivered_technical_docs text check (delivered_technical_docs in ('yes', 'no', 'unknown')),
  seller_trust_score numeric check (seller_trust_score between 0 and 10),
  reclame_aqui_score numeric check (reclame_aqui_score between 0 and 10),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competitor_id),
  foreign key (competitor_id, comparison_id)
    references public.competitors(id, comparison_id)
    on delete cascade
);

create table if not exists public.technical_evaluations (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  competitor_id uuid not null,
  system_power_kwp numeric,
  monthly_generation_kwh numeric,
  annual_generation_kwh numeric,
  module_brand text,
  module_model text,
  module_power_w numeric,
  module_weight_kg numeric,
  module_efficiency_pct numeric,
  module_lifetime_efficiency_pct numeric,
  module_defect_warranty_years numeric,
  module_efficiency_warranty_years numeric,
  module_count int,
  inverter_brand text,
  inverter_model text,
  inverter_power_kw numeric,
  inverter_defect_warranty_years numeric,
  inverter_count int,
  inverter_oversizing_ratio numeric,
  distributor_name text,
  distributor_score numeric check (distributor_score between 0 and 10),
  module_maker_name text,
  module_maker_score numeric check (module_maker_score between 0 and 10),
  inverter_maker_name text,
  inverter_maker_score numeric check (inverter_maker_score between 0 and 10),
  inverter_reliability text check (inverter_reliability in ('yes', 'no', 'unknown')),
  module_reliability text check (module_reliability in ('yes', 'no', 'unknown')),
  distributor_reliability text check (distributor_reliability in ('yes', 'no', 'unknown')),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competitor_id),
  foreign key (competitor_id, comparison_id)
    references public.competitors(id, comparison_id)
    on delete cascade
);

create table if not exists public.financial_evaluations (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  competitor_id uuid not null,
  monthly_bill_without_solar numeric,
  monthly_bill_with_solar numeric,
  monthly_savings_first_year numeric,
  annual_savings_first_year numeric,
  accumulated_savings_25_years numeric,
  total_investment numeric,
  payment_down numeric,
  payment_equipment_delivery numeric,
  payment_installation_final numeric,
  simple_payback_months numeric,
  annual_return_pct numeric,
  roi_multiplier numeric,
  energy_inflation_pct numeric,
  simultaneity_factor_pct numeric,
  viability_confidence text check (viability_confidence in ('high', 'medium', 'low', 'unknown')),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competitor_id),
  foreign key (competitor_id, comparison_id)
    references public.competitors(id, comparison_id)
    on delete cascade
);

create table if not exists public.comparison_score_settings (
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  criterion_key text not null,
  enabled boolean not null default true,
  weight numeric not null default 1 check (weight > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (comparison_id, criterion_key)
);

create table if not exists public.score_entries (
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  competitor_id uuid not null,
  criterion_key text not null,
  category text not null check (category in ('company', 'technical', 'financial')),
  score numeric check (score between 0 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (competitor_id, criterion_key),
  foreign key (competitor_id, comparison_id)
    references public.competitors(id, comparison_id)
    on delete cascade
);

create table if not exists public.comparison_result_snapshots (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  result jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.comparison_exports (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  format text not null default 'xlsx' check (format in ('xlsx', 'pdf')),
  storage_path text,
  generated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.comparison_events (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null,
  category text not null default 'general',
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------

create index if not exists comparisons_owner_id_idx on public.comparisons(owner_id);
create index if not exists competitors_comparison_id_idx on public.competitors(comparison_id);
create index if not exists company_evaluations_comparison_id_idx on public.company_evaluations(comparison_id);
create index if not exists technical_evaluations_comparison_id_idx on public.technical_evaluations(comparison_id);
create index if not exists financial_evaluations_comparison_id_idx on public.financial_evaluations(comparison_id);
create index if not exists score_entries_comparison_id_idx on public.score_entries(comparison_id);
create index if not exists comparison_events_comparison_id_created_at_idx
  on public.comparison_events(comparison_id, created_at desc);

-- ---------------------------------------------------------------------
-- Função e triggers de updated_at
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists comparisons_set_updated_at on public.comparisons;
create trigger comparisons_set_updated_at
  before update on public.comparisons
  for each row execute function public.set_updated_at();

drop trigger if exists competitors_set_updated_at on public.competitors;
create trigger competitors_set_updated_at
  before update on public.competitors
  for each row execute function public.set_updated_at();

drop trigger if exists company_evaluations_set_updated_at on public.company_evaluations;
create trigger company_evaluations_set_updated_at
  before update on public.company_evaluations
  for each row execute function public.set_updated_at();

drop trigger if exists technical_evaluations_set_updated_at on public.technical_evaluations;
create trigger technical_evaluations_set_updated_at
  before update on public.technical_evaluations
  for each row execute function public.set_updated_at();

drop trigger if exists financial_evaluations_set_updated_at on public.financial_evaluations;
create trigger financial_evaluations_set_updated_at
  before update on public.financial_evaluations
  for each row execute function public.set_updated_at();

drop trigger if exists comparison_score_settings_set_updated_at on public.comparison_score_settings;
create trigger comparison_score_settings_set_updated_at
  before update on public.comparison_score_settings
  for each row execute function public.set_updated_at();

drop trigger if exists score_entries_set_updated_at on public.score_entries;
create trigger score_entries_set_updated_at
  before update on public.score_entries
  for each row execute function public.set_updated_at();

drop trigger if exists tips_set_updated_at on public.tips;
create trigger tips_set_updated_at
  before update on public.tips
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Criação automática de perfil ao registrar usuário
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.comparisons enable row level security;
alter table public.competitors enable row level security;
alter table public.company_evaluations enable row level security;
alter table public.technical_evaluations enable row level security;
alter table public.financial_evaluations enable row level security;
alter table public.comparison_score_settings enable row level security;
alter table public.score_entries enable row level security;
alter table public.comparison_result_snapshots enable row level security;
alter table public.comparison_exports enable row level security;
alter table public.comparison_events enable row level security;
alter table public.tips enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "comparisons_owner_all" on public.comparisons;
create policy "comparisons_owner_all"
  on public.comparisons for all
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "competitors_owner_all" on public.competitors;
create policy "competitors_owner_all"
  on public.competitors for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "company_evaluations_owner_all" on public.company_evaluations;
create policy "company_evaluations_owner_all"
  on public.company_evaluations for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "technical_evaluations_owner_all" on public.technical_evaluations;
create policy "technical_evaluations_owner_all"
  on public.technical_evaluations for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "financial_evaluations_owner_all" on public.financial_evaluations;
create policy "financial_evaluations_owner_all"
  on public.financial_evaluations for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "score_settings_owner_all" on public.comparison_score_settings;
create policy "score_settings_owner_all"
  on public.comparison_score_settings for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "score_entries_owner_all" on public.score_entries;
create policy "score_entries_owner_all"
  on public.score_entries for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "result_snapshots_owner_all" on public.comparison_result_snapshots;
create policy "result_snapshots_owner_all"
  on public.comparison_result_snapshots for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "exports_owner_all" on public.comparison_exports;
create policy "exports_owner_all"
  on public.comparison_exports for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "events_owner_all" on public.comparison_events;
create policy "events_owner_all"
  on public.comparison_events for all
  using (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.comparisons c
      where c.id = comparison_id and c.owner_id = (select auth.uid())
    )
  );

drop policy if exists "tips_select_published" on public.tips;
create policy "tips_select_published"
  on public.tips for select
  using (is_published = true);

-- ---------------------------------------------------------------------
-- Seed de dicas (idempotente via on conflict no slug)
-- ---------------------------------------------------------------------

insert into public.tips (slug, title, category, sort_order, body) values
  (
    'menor-preco-nao-e-decisao',
    'Menor preco nao e decisao',
    'risco',
    10,
    'Use o investimento como comparativo, mas preserve empresa e tecnologia como eixos de decisao. A planilha original deixa a viabilidade financeira fora da pontuacao porque as premissas podem ser manipuladas.'
  ),
  (
    'duas-finalistas',
    'Escolha exatamente duas finalistas',
    'processo',
    20,
    'A ultima rodada deve focar nas duas melhores propostas. O sistema recomenda pelo ranking, mas a decisao final pertence ao comprador.'
  ),
  (
    'riscos-ocultos',
    'Riscos ocultos merecem peso',
    'risco',
    30,
    'CREA incerto, assistencia lenta, garantias curtas ou fabricante pouco confiavel devem aparecer como pontos de atencao antes da negociacao final.'
  )
on conflict (slug) do nothing;
