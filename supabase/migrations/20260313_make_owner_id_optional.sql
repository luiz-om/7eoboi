alter table public.provas
  alter column owner_id drop not null;

alter table public.provas
  alter column owner_id drop default;
