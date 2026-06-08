-- Log dos eventos do webhook da Greenn (vendas), para métricas no /admin.
-- Cada postback (paid/refunded/chargedback/...) vira uma linha. Service role only.

create table if not exists public.greenn_events (
  id bigint generated always as identity primary key,
  order_id text,
  email text,
  status text,
  event text,
  raw jsonb,
  created_at timestamptz not null default now()
);
create index if not exists greenn_events_status_idx on public.greenn_events (status);
create index if not exists greenn_events_created_idx on public.greenn_events (created_at desc);

alter table public.greenn_events enable row level security;
