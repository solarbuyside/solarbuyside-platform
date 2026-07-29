-- 0024: funil da LP (Fase 5 do handoff de 28/07).
--
-- Os eventos da landing (page_view, section_view, buy_click, …) iam para o
-- backend Express aposentado na Render, que gravava numa MySQL que ninguém lê
-- ("dado de graça parado"). A partir daqui a LP grava nesta tabela e o /admin
-- da plataforma lê o funil. O histórico anterior (~7,8 mil eventos até
-- 2026-07-28) segue na MySQL da Render, exportável se um dia fizer falta.
--
-- Sem tabela de sessões de propósito: first_seen/last_seen/pages_visited do
-- modelo antigo derivam de min/max(created_at) e count(*) por session_id.

create table if not exists public.landing_events (
  id bigint generated always as identity primary key,
  event_type text not null check (
    event_type in ('page_view', 'section_view', 'ebook_download', 'newsletter_subscribe', 'buy_click')
  ),
  session_id text not null,
  page_url text,
  section_name text,
  created_at timestamptz not null default now()
);

create index if not exists landing_events_created_idx
  on public.landing_events (created_at);
create index if not exists landing_events_session_idx
  on public.landing_events (session_id);

alter table public.landing_events enable row level security;

-- A LP grava direto com a anon key — mesmo modelo de confiança do endpoint
-- público antigo (/api/analytics/event, sem auth). Só INSERT, com limites de
-- tamanho para spam não virar custo de storage; ninguém lê com anon: o admin
-- lê via service role, que bypassa o RLS.
create policy landing_events_insert_anon on public.landing_events
  for insert to anon
  with check (
    char_length(session_id) between 1 and 64
    and (page_url is null or char_length(page_url) <= 300)
    and (section_name is null or char_length(section_name) <= 100)
  );
