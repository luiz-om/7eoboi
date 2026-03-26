-- Auditoria e garantia de segurança RLS
-- Executar no Supabase SQL Editor para verificar o estado atual das políticas

-- 1. Lista todas as políticas ativas nas tabelas provas e duplas
-- (execute esta query no painel do Supabase para verificar)
--
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('provas', 'duplas')
-- ORDER BY tablename, policyname;

-- 2. Remove QUALQUER política aberta remanescente que permita acesso anônimo
drop policy if exists provas_api_access on public.provas;
drop policy if exists provas_public_api on public.provas;
drop policy if exists duplas_api_access on public.duplas;
drop policy if exists duplas_public_api on public.duplas;

-- 3. Garante que RLS está habilitado
alter table public.provas enable row level security;
alter table public.duplas enable row level security;

-- 4. Recria políticas seguras (owner-based) com IF NOT EXISTS seguro via DO block

do $$
begin
  -- provas: select
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'provas' and policyname = 'provas_select_own'
  ) then
    create policy provas_select_own
      on public.provas for select to authenticated
      using ((select auth.uid()) = owner_id);
  end if;

  -- provas: insert
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'provas' and policyname = 'provas_insert_own'
  ) then
    create policy provas_insert_own
      on public.provas for insert to authenticated
      with check ((select auth.uid()) = owner_id);
  end if;

  -- provas: update
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'provas' and policyname = 'provas_update_own'
  ) then
    create policy provas_update_own
      on public.provas for update to authenticated
      using ((select auth.uid()) = owner_id)
      with check ((select auth.uid()) = owner_id);
  end if;

  -- provas: delete
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'provas' and policyname = 'provas_delete_own'
  ) then
    create policy provas_delete_own
      on public.provas for delete to authenticated
      using ((select auth.uid()) = owner_id);
  end if;

  -- duplas: select
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'duplas' and policyname = 'duplas_select_from_owned_prova'
  ) then
    create policy duplas_select_from_owned_prova
      on public.duplas for select to authenticated
      using (
        exists (
          select 1 from public.provas
          where provas.id = duplas.prova_id
            and provas.owner_id = (select auth.uid())
        )
      );
  end if;

  -- duplas: insert
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'duplas' and policyname = 'duplas_insert_into_owned_prova'
  ) then
    create policy duplas_insert_into_owned_prova
      on public.duplas for insert to authenticated
      with check (
        exists (
          select 1 from public.provas
          where provas.id = duplas.prova_id
            and provas.owner_id = (select auth.uid())
        )
      );
  end if;

  -- duplas: update
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'duplas' and policyname = 'duplas_update_from_owned_prova'
  ) then
    create policy duplas_update_from_owned_prova
      on public.duplas for update to authenticated
      using (
        exists (
          select 1 from public.provas
          where provas.id = duplas.prova_id
            and provas.owner_id = (select auth.uid())
        )
      )
      with check (
        exists (
          select 1 from public.provas
          where provas.id = duplas.prova_id
            and provas.owner_id = (select auth.uid())
        )
      );
  end if;

  -- duplas: delete
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'duplas' and policyname = 'duplas_delete_from_owned_prova'
  ) then
    create policy duplas_delete_from_owned_prova
      on public.duplas for delete to authenticated
      using (
        exists (
          select 1 from public.provas
          where provas.id = duplas.prova_id
            and provas.owner_id = (select auth.uid())
        )
      );
  end if;
end
$$;
