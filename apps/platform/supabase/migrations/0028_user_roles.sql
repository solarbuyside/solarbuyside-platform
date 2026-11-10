-- Papéis no banco: o Francis passa a cadastrar contas e trocar o papel de
-- qualquer usuário pelo /admin/usuarios.
--
-- Tabela SEPARADA de propósito: `profiles` tem a policy profiles_update_own
-- (o próprio usuário edita a sua linha). Se o papel morasse lá, qualquer
-- comprador poderia se promover a admin pela API pública. Aqui só existe
-- leitura da PRÓPRIA linha; não há policy de escrita, então só o servidor
-- (service key, depois de checar a permissão de quem pede) grava.
--
-- Sem linha = vale o padrão do código (mapa de staff em src/lib/env.ts).
-- Contas protegidas (env.ts, PROTECTED_ACCOUNTS) ignoram esta tabela.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'writer', 'user')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles for select
  using ((select auth.uid()) = user_id);
