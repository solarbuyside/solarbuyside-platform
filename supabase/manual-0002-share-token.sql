-- =====================================================================
-- Solar Buy-Side — Migration 0002: token de compartilhamento (cole e Run)
-- Idempotente. Adiciona share_token/share_enabled em competitors.
-- =====================================================================

alter table public.competitors
  add column if not exists share_token text;

alter table public.competitors
  add column if not exists share_enabled boolean not null default false;

create unique index if not exists competitors_share_token_key
  on public.competitors (share_token)
  where share_token is not null;
