-- Leads da landing (newsletter + ebook), substituindo o MySQL do Render.
-- Escrita/leitura só via service role (functions serverless + /admin); RLS on
-- sem policy pública.

create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create unique index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (lower(email));

create table if not exists public.ebook_leads (
  id bigint generated always as identity primary key,
  nome text,
  sobrenome text,
  email text not null,
  celular text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists ebook_leads_email_idx on public.ebook_leads (lower(email));

alter table public.newsletter_subscribers enable row level security;
alter table public.ebook_leads enable row level security;
