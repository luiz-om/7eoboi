alter table public.provas
  add column if not exists tipo text not null default 'PADRAO',
  add column if not exists duplas_corte integer;

alter table public.provas
  drop constraint if exists provas_tipo_valido_chk;

alter table public.provas
  add constraint provas_tipo_valido_chk
    check (tipo in ('PADRAO', 'TIRA_BOI'));

alter table public.provas
  drop constraint if exists provas_duplas_corte_valido_chk;

alter table public.provas
  add constraint provas_duplas_corte_valido_chk
    check (duplas_corte is null or duplas_corte > 0);
