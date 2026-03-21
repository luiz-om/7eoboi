alter table public.provas
  alter column owner_id set default auth.uid();

drop policy if exists provas_api_access on public.provas;
drop policy if exists duplas_api_access on public.duplas;

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
