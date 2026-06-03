-- Slides 5 e 6: novos valores nas escolhas da empresa.
--   installed_systems_range: + 'gt_500' e 'gt_1000'.
--   own_installation_team: passa a ser 'own' | 'outsourced' | 'unknown'
--     (antes 'yes' | 'no' | 'outsourced_known' | 'unknown').
--
-- Sem esta migration o CHECK do schema inicial rejeita os valores novos
-- (erro ao salvar "Mais de 1.000" / "Equipe terceirizada").
--
-- As constraints originais são inline (nome gerado pelo Postgres). Removemos
-- pelo nome convencional e por varredura dinâmica, para ser robusto a ambientes
-- onde o nome gerado possa diferir.

-- Remove dinamicamente qualquer CHECK constraint dessas duas colunas.
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'company_evaluations'
      and con.contype = 'c'
      and (
        pg_get_constraintdef(con.oid) ilike '%installed_systems_range%'
        or pg_get_constraintdef(con.oid) ilike '%own_installation_team%'
      )
  loop
    execute format('alter table public.company_evaluations drop constraint %I', c.conname);
  end loop;
end $$;

-- Migra os dados antigos de own_installation_team antes de recriar o CHECK.
update public.company_evaluations
  set own_installation_team = case own_installation_team
    when 'yes' then 'own'
    when 'no' then 'outsourced'
    when 'outsourced_known' then 'outsourced'
    else own_installation_team
  end
  where own_installation_team in ('yes', 'no', 'outsourced_known');

-- Recria os CHECKs com os conjuntos atualizados.
alter table public.company_evaluations
  add constraint company_evaluations_installed_systems_range_check
  check (installed_systems_range in
    ('lt_10', '10_49', '50_100', 'gt_100', 'gt_500', 'gt_1000', 'unknown'));

alter table public.company_evaluations
  add constraint company_evaluations_own_installation_team_check
  check (own_installation_team in ('own', 'outsourced', 'unknown'));
