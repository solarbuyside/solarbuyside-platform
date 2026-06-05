-- Reclame Aqui da EMPRESA (seção "Avaliação do vendedor e da empresa"):
-- deixa de ser nota numérica (0-10) e passa a ser uma CATEGORIA de reputação,
-- igual aos 3 campos técnicos (migration 0011). A conversão para nota 0-10 do
-- ranking é feita na camada de domínio (src/domain/comparisons/reputation.ts).
--
-- As notas numéricas anteriores não têm equivalência direta nas categorias,
-- então são descartadas (NULL) na conversão de tipo.

alter table public.company_evaluations
  drop constraint if exists company_evaluations_reclame_aqui_score_check;

alter table public.company_evaluations
  alter column reclame_aqui_score type text using null;

alter table public.company_evaluations
  add constraint company_evaluations_reclame_aqui_score_check
    check (reclame_aqui_score in ('ra_1000','otimo','bom','regular','ruim','nao_recomendado','suspensa','em_analise','sem_reputacao'));
