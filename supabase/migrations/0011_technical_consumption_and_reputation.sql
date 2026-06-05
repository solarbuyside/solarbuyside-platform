-- Slide 12 (revisão) + novo campo de consumo:
--
-- 1) Consumo anual a compensar (kWh/ano): novo campo informativo da proposta
--    técnica, antes do "Sistema solar fotovoltaico".
-- 2) Reputação (Reclame Aqui) da distribuidora e dos fabricantes de módulo e
--    inversor deixa de ser nota numérica (0-10) e passa a ser uma CATEGORIA
--    qualitativa (ra_1000, otimo, bom, regular, ruim, nao_recomendado,
--    suspensa, em_analise, sem_reputacao). A conversão para nota 0-10 do
--    ranking é feita na camada de domínio (src/domain/comparisons/reputation.ts).
--
-- As notas numéricas anteriores não têm equivalência direta nas categorias,
-- então são descartadas (definidas como NULL) na conversão de tipo.

alter table public.technical_evaluations
  add column if not exists annual_consumption_kwh numeric check (annual_consumption_kwh >= 0);

alter table public.technical_evaluations
  drop constraint if exists technical_evaluations_distributor_score_check,
  drop constraint if exists technical_evaluations_module_maker_score_check,
  drop constraint if exists technical_evaluations_inverter_maker_score_check;

alter table public.technical_evaluations
  alter column distributor_score type text using null,
  alter column module_maker_score type text using null,
  alter column inverter_maker_score type text using null;

alter table public.technical_evaluations
  add constraint technical_evaluations_distributor_score_check
    check (distributor_score in ('ra_1000','otimo','bom','regular','ruim','nao_recomendado','suspensa','em_analise','sem_reputacao')),
  add constraint technical_evaluations_module_maker_score_check
    check (module_maker_score in ('ra_1000','otimo','bom','regular','ruim','nao_recomendado','suspensa','em_analise','sem_reputacao')),
  add constraint technical_evaluations_inverter_maker_score_check
    check (inverter_maker_score in ('ra_1000','otimo','bom','regular','ruim','nao_recomendado','suspensa','em_analise','sem_reputacao'));
