-- Pré-lançamento da live (Francis, 29/10/2026).
--
-- Nos ~15 dias antes da live de lançamento a LP para de vender e divulga a
-- live; depois da live, a página de vendas volta inteira. Em vez de uma cópia
-- da LP, um interruptor:
--
-- 1) landing_globals.modoPagina: 'vendas' (padrão) | 'prelancamento'. Editado
--    no card "Modo da página" do /admin/landing, com rascunho/publicar como o
--    resto. Esta migration cria a chave em 'vendas': NADA muda no ar.
--
-- 2) landing_sections 'lancamento': todos os textos do período (bloco da live,
--    formulário, botões da página), numa seção própria para não tocar nos
--    textos de vendas. Espelha os defaults de apps/landing/src/v4/LancamentoV4.tsx
--    e do manifesto (apps/platform/src/lib/landing/field-schema.ts).
--
-- Campos que nascem vazios (convidados 3 e 4, link do grupo, link da
-- transmissão) NÃO são semeados: vazio e ausente dão o mesmo resultado na
-- página, e o editor não grava campo vazio que não existia.
--
-- Idempotente: em re-run só preenche o que falta (não sobrescreve edições já
-- feitas no /admin) — mesmo padrão da 0022.
begin;

insert into public.landing_globals (key, value, value_draft)
values ('modoPagina', 'vendas', 'vendas')
on conflict (key) do nothing;

with seed as (
  select jsonb_build_object(
    'startsAt', '01/12/2026 20:00',
    'durationMin', '150',
    'dateLine', 'Terça-feira, <span class="cms-orange">1º de dezembro de 2026</span>, às <span class="cms-orange">20h</span> (horário de Brasília)',
    'kicker', 'Lançamento ao vivo · Solar Buy-Side',
    'title', 'Em poucos dias, o Solar Buy-Side<br/>será revelado ao vivo.',
    'ctaLabel', 'Garantir minha vaga na live',
    'hostsIntro', 'Com os criadores da solução e convidados que vivem a venda solar na prática:',
    'host1Name', 'Francis Poloni',
    'host1Role', 'Criador da solução',
    'host2Name', 'Ovídio Collesi',
    'host2Role', 'Criador da solução',
    'host3Role', 'Integrador · moderação',
    'host4Role', 'Vendedor solar · moderação',
    'modalTitle', 'Garanta sua vaga na live',
    'modalText', 'Deixe seus contatos para receber o link da transmissão e entrar no grupo exclusivo para integradores e vendedores do setor solar.',
    'modalCtaLabel', 'Quero participar da live',
    'modalFooter', 'Seus dados ficam só com a Solar Buy-Side',
    'modalSuccessTitle', 'Vaga garantida!',
    'modalSuccessText', 'Agora entre no grupo exclusivo do WhatsApp: é por lá que vão chegar o link da transmissão e os avisos da live.',
    'modalSuccessTextNoGroup', 'Recebemos seus dados. Anote na agenda e nos vemos na live!',
    'groupLabel', 'Entrar no grupo do WhatsApp',
    'liveKicker', 'Ao vivo agora',
    'liveTitle', 'A live de lançamento<br/>está no ar agora.',
    'liveCtaLabel', 'Assistir agora',
    'afterTitle', 'A live terminou.<br/>A oferta abre em instantes.',
    'afterText', 'Obrigado por estar com a gente. A página com a condição de lançamento volta ao ar em poucos minutos.',
    'offerTitle', 'Tudo o que você vai conhecer <span class="cms-orange">na live de lançamento</span>',
    'heroCta', 'Quero participar da live de lançamento',
    'headerCta', 'Garantir minha vaga',
    'floatingCta', 'Garantir minha vaga na live',
    'sectionCta', 'Quero participar da live de lançamento'
  ) as t
)
insert into public.landing_sections (section_id, name, texts, images, texts_draft, images_draft, updated_at)
select 'lancamento', 'Pré-lançamento (live)', t, '{}'::jsonb, t, '{}'::jsonb, now()
from seed
on conflict (section_id) do update set
  name = excluded.name,
  texts = excluded.texts || public.landing_sections.texts,
  texts_draft = excluded.texts_draft || coalesce(public.landing_sections.texts_draft, public.landing_sections.texts, '{}'::jsonb),
  updated_at = now();

commit;
