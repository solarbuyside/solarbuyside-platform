-- Documentos legais editáveis (Termos/Privacidade/Antipirataria) da Landing e
-- da Plataforma. blocks = array de {type:'heading'|'p', text}. Leitura pública
-- (a landing lê com anon; a plataforma renderiza server-side). Escrita via /admin.

create table if not exists public.legal_docs (
  scope text not null,
  slug text not null,
  title text,
  subtitle text,
  blocks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (scope, slug)
);

alter table public.legal_docs enable row level security;

drop policy if exists legal_docs_public_read on public.legal_docs;
create policy legal_docs_public_read on public.legal_docs for select using (true);
