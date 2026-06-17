-- Primeiro acesso: distingue quem JÁ criou a própria senha de quem ainda não.
-- Usuário provisionado pela Greenn nasce com senha aleatória (não-conhecida);
-- precisa criar a senha no 1º acesso antes de usar a plataforma.
--
-- password_set_at NULL  => ainda não criou senha (forçar /update-password).
-- password_set_at SET   => já criou (fluxo normal: login + 2FA).

alter table public.profiles
  add column if not exists password_set_at timestamptz;

-- Backfill: contas já existentes (que já têm senha/usaram) NÃO devem ser
-- forçadas a recriar. Marca como definida.
update public.profiles
  set password_set_at = now()
  where password_set_at is null;
