-- Origem do lead em `ebook_leads`.
--
-- A tabela nasceu servindo um formulário só (o teaser do Código do Vendedor
-- Consultivo). O modal de credenciamento Belenergy grava na MESMA base, a
-- pedido do Francis, mas é outro público e outra promessa: um baixa um PDF, o
-- outro vai se cadastrar como integrador para desbloquear os 15% OFF. Sem esta
-- coluna, o relatório diário que ele vai mandar para a Belenergy não teria como
-- separar quem é quem.
--
-- Default 'teaser' porque é o que as ~N linhas anteriores são, todas.

alter table public.ebook_leads
  add column if not exists origem text not null default 'teaser';

create index if not exists ebook_leads_origem_idx on public.ebook_leads (origem, created_at desc);
