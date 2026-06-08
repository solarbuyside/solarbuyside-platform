-- Controle de acesso pago (épico GREENN + Brevo):
-- a conta nasce pela compra na Greenn (webhook) e o acesso vale 6 meses.
-- Reembolso/chargeback bloqueia o acesso.
--
-- access_expires_at NULL = acesso sem expiração (contas antigas/admin/manuais).
-- O enforcement só bloqueia quando access_expires_at não é nulo e já passou,
-- ou quando blocked_at está preenchido.

alter table public.profiles
  add column if not exists access_expires_at timestamptz,
  add column if not exists greenn_order_id text,
  add column if not exists blocked_at timestamptz,
  add column if not exists access_source text;

create index if not exists profiles_greenn_order_id_idx
  on public.profiles (greenn_order_id);
