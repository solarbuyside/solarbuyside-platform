-- Conteúdo editável da landing page (monorepo). Fonte da verdade do texto/
-- imagens da LP, substituindo o CMS antigo (MySQL/Render) e a precedência do
-- ContentData hardcoded. A landing lê com a anon key (leitura pública); a
-- escrita é feita pelo /admin da plataforma via service role (bypassa RLS).

create table if not exists public.landing_sections (
  section_id text primary key,
  name text,
  texts jsonb not null default '{}'::jsonb,
  images jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.landing_globals (
  key text primary key,
  value text
);

alter table public.landing_sections enable row level security;
alter table public.landing_globals enable row level security;

drop policy if exists "landing_sections_public_read" on public.landing_sections;
create policy "landing_sections_public_read"
  on public.landing_sections for select using (true);

drop policy if exists "landing_globals_public_read" on public.landing_globals;
create policy "landing_globals_public_read"
  on public.landing_globals for select using (true);
