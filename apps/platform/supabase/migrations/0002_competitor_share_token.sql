-- Shareable supplier form: each competitor can have a secret token that lets a
-- vendor fill in the technical/financial data without logging in. Writes are
-- performed server-side with the service key after validating this token, so we
-- do NOT open a public RLS write policy here — the column + uniqueness is enough.

alter table public.competitors
  add column if not exists share_token text;

alter table public.competitors
  add column if not exists share_enabled boolean not null default false;

create unique index if not exists competitors_share_token_key
  on public.competitors (share_token)
  where share_token is not null;
