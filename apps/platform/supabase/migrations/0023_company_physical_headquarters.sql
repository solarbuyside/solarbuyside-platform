-- Sede física da empresa (Francis 2026-07-11): novo critério de avaliação de
-- EMPRESA. Apenas Sim/Não (sem "não sei"). Pontua Sim=10, Não=5, peso 8.
-- Os 8 pontos de peso foram abertos reduzindo 1 de cada um de 8 critérios
-- maiores, então o grupo Empresa continua fechando 100 (ver
-- src/domain/comparisons/score-definitions.ts). Coluna aditiva e nullable:
-- retrocompatível com avaliações já existentes.

alter table public.company_evaluations
  add column if not exists has_physical_headquarters text
    check (has_physical_headquarters in ('yes', 'no'));
