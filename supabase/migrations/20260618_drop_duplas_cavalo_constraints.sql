alter table public.duplas
  alter column cavalo1 drop not null,
  alter column cavalo2 drop not null;

alter table public.duplas
drop constraint if exists duplas_cavalo1_check;

alter table public.duplas
drop constraint if exists duplas_cavalo2_check;

update public.duplas
set cavalo1 = ''
where cavalo1 is null;

update public.duplas
set cavalo2 = ''
where cavalo2 is null;
