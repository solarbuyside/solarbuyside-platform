-- Onboarding de primeiro acesso: marca quando o usuário concluiu (ou pulou) o
-- tour de boas-vindas. NULL = ainda não viu (mostra o onboarding).

alter table public.profiles
  add column if not exists onboarded_at timestamptz;
