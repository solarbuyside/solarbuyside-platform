-- Promoção de lançamento de 48 horas (Francis, 03/11/2026).
--
-- Nas primeiras 48 horas depois da live, o card de preço da LP vira a oferta
-- de lançamento (25% OFF, contagem regressiva). Ao fim delas a página volta
-- sozinha ao R$ 797,00 e aos textos de vendas: a promoção liga e desliga pelo
-- relógio (startsAt + durationHours, horário de Brasília), sem ninguém
-- precisar publicar nada na hora.
--
-- Os textos moram numa seção própria (`promocao`), nunca por cima dos de
-- vendas (`pricing`). Espelha os defaults de apps/landing/src/v4/PromocaoV4.tsx
-- e do manifesto (apps/platform/src/lib/landing/field-schema.ts).
--
-- `checkoutUrl` NÃO é semeado: sem ele a promoção não aparece na página (a LP
-- não anuncia R$ 597,75 apontando para o checkout de R$ 797,00). Ele entra
-- pelo /admin quando o cupom da Greenn existir.
--
-- Idempotente: em re-run só preenche o que falta (não sobrescreve edições já
-- feitas no /admin), mesmo padrão da 0026.
begin;

with seed as (
  select jsonb_build_object(
    'startsAt', '01/12/2026 21:00',
    'durationHours', '48',
    'badge', 'Promoção de lançamento · Só 48 horas',
    'kicker', 'Seu acesso direto',
    'title', 'Método Solar Buy-Side Completo',
    'subtitle', 'Oferta especial da Buy-Side Soluções',
    'priceFromLabel', 'Valor real do método',
    'priceFrom', 'R$ 797,00',
    'priceToLabel', 'Hoje, por apenas',
    'priceTo', 'R$ 597,75',
    'priceNote', 'à vista no PIX · ou 12x de R$ 61,46',
    'savings', '25% OFF · Você economiza R$ 199,25',
    'timerKicker', 'O relógio está correndo',
    'timerNote', 'Quando chegar a zero, a condição sai do ar e o valor volta para R$ 797,00.',
    'ctaLabel', 'Quero o método completo com 25% OFF',
    'ctaNote', 'Aproveite já: quem decide hoje paga R$ 199,25 a menos.'
  ) as t
)
insert into public.landing_sections (section_id, name, texts, images, texts_draft, images_draft, updated_at)
select 'promocao', 'Promoção de lançamento', t, '{}'::jsonb, t, '{}'::jsonb, now()
from seed
on conflict (section_id) do update set
  name = excluded.name,
  texts = excluded.texts || public.landing_sections.texts,
  texts_draft = excluded.texts_draft || coalesce(public.landing_sections.texts_draft, public.landing_sections.texts, '{}'::jsonb),
  updated_at = now();

commit;
