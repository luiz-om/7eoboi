alter function private.set_updated_at() set search_path = '';

alter table public.provas
  add column if not exists owner_id uuid references auth.users (id);

alter table public.provas
  alter column owner_id set default auth.uid();

update public.provas
set owner_id = auth.uid()
where owner_id is null;

alter table public.provas
  alter column owner_id set not null;

create index if not exists provas_owner_id_idx
  on public.provas (owner_id);

drop policy if exists provas_public_api on public.provas;
drop policy if exists duplas_public_api on public.duplas;

create policy provas_select_own
  on public.provas
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy provas_insert_own
  on public.provas
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy provas_update_own
  on public.provas
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy provas_delete_own
  on public.provas
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy duplas_select_from_owned_prova
  on public.duplas
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.provas
      where provas.id = duplas.prova_id
        and provas.owner_id = (select auth.uid())
    )
  );

create policy duplas_insert_into_owned_prova
  on public.duplas
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.provas
      where provas.id = duplas.prova_id
        and provas.owner_id = (select auth.uid())
    )
  );

create policy duplas_update_from_owned_prova
  on public.duplas
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.provas
      where provas.id = duplas.prova_id
        and provas.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.provas
      where provas.id = duplas.prova_id
        and provas.owner_id = (select auth.uid())
    )
  );

create policy duplas_delete_from_owned_prova
  on public.duplas
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.provas
      where provas.id = duplas.prova_id
        and provas.owner_id = (select auth.uid())
    )
  );
