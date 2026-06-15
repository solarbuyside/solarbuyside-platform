-- Rascunho / Publicar para o conteúdo da landing.
-- O editor /admin passa a escrever nas colunas *_draft. A landing (anon) continua
-- lendo as colunas PUBLICADAS (texts/images/value). "Publicar" copia draft -> publicado.
-- Assim o cliente edita à vontade sem afetar a LP até clicar em Publicar.

alter table public.landing_sections
  add column if not exists texts_draft  jsonb,
  add column if not exists images_draft jsonb;

-- Inicializa o rascunho com o conteúdo publicado atual (estado limpo: draft == publicado).
update public.landing_sections
  set texts_draft  = coalesce(texts_draft, texts),
      images_draft = coalesce(images_draft, images)
  where texts_draft is null or images_draft is null;

alter table public.landing_globals
  add column if not exists value_draft text;

update public.landing_globals
  set value_draft = coalesce(value_draft, value)
  where value_draft is null;
