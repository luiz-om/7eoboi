alter table public.duplas
  drop constraint if exists duplas_bois_valido_chk,
  drop constraint if exists duplas_resultado_consistente_chk;

alter table public.duplas
  add column if not exists status text not null default 'PENDENTE';

update public.duplas
set status = case
  when bois is null then 'PENDENTE'
  when bois = 'SAT' then 'SAT'
  else 'VALIDO'
end
where true;

alter table public.duplas
  alter column bois type integer
  using case
    when bois ~ '^(10|[0-9])$' then bois::integer
    else null
  end;

alter table public.duplas
  add constraint duplas_status_valido_chk
    check (status in ('PENDENTE', 'VALIDO', 'SAT')),
  add constraint duplas_resultado_consistente_chk
    check (
      (status = 'PENDENTE' and bois is null and tempo is null)
      or (status = 'SAT' and bois is null and tempo is not null)
      or (status = 'VALIDO' and bois between 0 and 10 and tempo is not null)
    );

drop index if exists public.duplas_ranking_idx;
create index if not exists duplas_ranking_idx
  on public.duplas (prova_id, status, bois desc, tempo asc);
