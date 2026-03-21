drop policy if exists provas_select_own on public.provas;
drop policy if exists provas_insert_own on public.provas;
drop policy if exists provas_update_own on public.provas;
drop policy if exists provas_delete_own on public.provas;
drop policy if exists duplas_select_from_owned_prova on public.duplas;
drop policy if exists duplas_insert_into_owned_prova on public.duplas;
drop policy if exists duplas_update_from_owned_prova on public.duplas;
drop policy if exists duplas_delete_from_owned_prova on public.duplas;

create policy provas_api_access
  on public.provas
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy duplas_api_access
  on public.duplas
  for all
  to anon, authenticated
  using (true)
  with check (true);
