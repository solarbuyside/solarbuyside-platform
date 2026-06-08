-- 2FA por e-mail no login (anti-compartilhamento de conta).
-- A cada login com senha, gera um código de 6 dígitos enviado por e-mail;
-- o acesso ao app só é liberado após verificar o código. Admins não passam
-- pelo 2FA. Tabela acessada só via service role (RLS on, sem policy pública).

create table if not exists public.login_2fa_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.login_2fa_codes enable row level security;
