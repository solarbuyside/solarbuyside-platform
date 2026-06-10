-- Slide 12: separa cada item do Reclame Aqui em NOME (texto) + NOTA (0-10),
-- e a nota passa a pontuar na Pontuação Técnica (critérios reputation_*).
--
-- As colunas antigas (*_reputation, text) guardavam nome+nota juntos. Migramos
-- o conteúdo existente para a coluna de nome e criamos a coluna de nota.

alter table public.technical_evaluations
  rename column distributor_reputation to distributor_name;
alter table public.technical_evaluations
  rename column module_maker_reputation to module_maker_name;
alter table public.technical_evaluations
  rename column inverter_maker_reputation to inverter_maker_name;

alter table public.technical_evaluations
  add column distributor_score numeric check (distributor_score between 0 and 10),
  add column module_maker_score numeric check (module_maker_score between 0 and 10),
  add column inverter_maker_score numeric check (inverter_maker_score between 0 and 10);
