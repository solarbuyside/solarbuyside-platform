-- Upload de imagens da landing pelo /admin (pedido do Francis: "sistema de
-- carregamento individual de logotipo").
--
-- Até aqui, campo de imagem no admin era um input de texto onde se colava um
-- caminho: imagem nova exigia commitar o arquivo no repo e fazer deploy. Com
-- este bucket o cliente envia o arquivo direto pelo painel.
--
-- Leitura pública (a landing é um site público e serve as imagens direto do
-- Storage). Escrita só pelo service role, que roda no servidor da plataforma
-- atrás do gate de admin — por isso NÃO existe policy de insert/update/delete
-- para anon nem authenticated: o service role passa por cima da RLS.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'landing-images',
  'landing-images',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública dos objetos deste bucket (e só dele).
drop policy if exists "landing_images_public_read" on storage.objects;
create policy "landing_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'landing-images');
