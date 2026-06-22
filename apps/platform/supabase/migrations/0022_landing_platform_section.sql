-- Adiciona a seção "Plataforma" (componente PlatformV4 da LP v4, id `plataforma`)
-- ao CMS da landing. Antes a copy só existia hardcoded no v4 e não dava pra
-- editar pelo /admin (não havia linha em landing_sections nem entrada no
-- manifesto). Popula texts + texts_draft (publicado = rascunho) com a copy atual
-- do componente, para o editor mostrar os campos e a LP passar a ler do banco.
--
-- Idempotente: em re-run, só preenche chaves faltantes (não sobrescreve edições
-- já feitas no /admin) — mesmo padrão do 0020.
begin;

with seed as (
  select jsonb_build_object(
    'badge', 'Bônus Exclusivo',
    'title', 'No Buy-Side sua proposta comercial tem nota.',
    'titleHighlight', 'Teste suas propostas antes que o mercado as teste.',
    'lead', 'A Plataforma de Avaliação Solar Buy-Side revela as forças e fraquezas das suas ofertas, ajudando sua empresa a entregar propostas mais competitivas, confiáveis e persuasivas.',
    'bullet1', 'Compare propostas de fornecedores lado a lado',
    'bullet2', 'Pontuação por reputação, tecnologia e viabilidade',
    'bullet3', 'Índice de Confiabilidade de 0 a 100 para cada fornecedor',
    'accessNote', 'Acesso por 6 meses, liberado automaticamente após a compra.',
    'ctaButton', 'Quero o Manual + Plataforma'
  ) as t
)
insert into public.landing_sections (section_id, name, texts, images, texts_draft, images_draft, updated_at)
select 'plataforma', 'Plataforma', t, '{}'::jsonb, t, '{}'::jsonb, now()
from seed
on conflict (section_id) do update set
  name = excluded.name,
  texts = excluded.texts || public.landing_sections.texts,
  texts_draft = excluded.texts_draft || coalesce(public.landing_sections.texts_draft, public.landing_sections.texts, '{}'::jsonb),
  updated_at = now();

commit;
