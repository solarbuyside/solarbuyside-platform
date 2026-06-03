-- Slide 19: a Viabilidade Financeira passa a ser pontuada (1 a 10) e somar no
-- ranking, virando a 3ª categoria de pontuação além de 'company' e 'technical'.
-- Relaxa o CHECK da coluna score_entries.category para aceitar 'financial'.
--
-- NOTA DE NEGÓCIO: a planilha de referência trata a viabilidade como
-- "comparativo informativo (sem pontuação)". A pontuação foi adicionada por
-- decisão de produto; o rubric é provisório (ver score-definitions.ts) e
-- depende de validação antes de produção.

alter table public.score_entries
  drop constraint if exists score_entries_category_check;

alter table public.score_entries
  add constraint score_entries_category_check
  check (category in ('company', 'technical', 'financial'));
