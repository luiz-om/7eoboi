create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.provas (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  nome text not null check (char_length(trim(nome)) > 0),
  local text not null default '',
  data date not null default current_date,
  observacoes text not null default '',
  finalizada boolean not null default false,
  finalizada_em timestamptz,
  criada_em timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint provas_finalizacao_consistente_chk
    check ((not finalizada and finalizada_em is null) or finalizada)
);

create table if not exists public.duplas (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  prova_id text not null references public.provas(id) on delete cascade,
  ordem integer not null check (ordem > 0),
  cavaleiro1 text not null check (char_length(trim(cavaleiro1)) > 0),
  cavalo1 text not null check (char_length(trim(cavalo1)) > 0),
  cavaleiro2 text not null check (char_length(trim(cavaleiro2)) > 0),
  cavalo2 text not null check (char_length(trim(cavalo2)) > 0),
  bois text,
  tempo numeric(8, 3),
  criada_em timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint duplas_prova_ordem_unique unique (prova_id, ordem),
  constraint duplas_bois_valido_chk
    check (bois is null or bois = 'SAT' or bois ~ '^(10|[0-9])$'),
  constraint duplas_tempo_valido_chk
    check (tempo is null or tempo > 0),
  constraint duplas_resultado_consistente_chk
    check (
      (bois is null and tempo is null)
      or (bois = 'SAT' and tempo is not null)
      or (bois ~ '^(10|[0-9])$' and tempo is not null)
    )
);

create index if not exists provas_data_idx
  on public.provas (data desc, criada_em desc);

create index if not exists duplas_prova_ordem_idx
  on public.duplas (prova_id, ordem);

create index if not exists duplas_ranking_idx
  on public.duplas (prova_id, bois, tempo);

drop trigger if exists set_provas_updated_at on public.provas;
create trigger set_provas_updated_at
before update on public.provas
for each row
execute function private.set_updated_at();

drop trigger if exists set_duplas_updated_at on public.duplas;
create trigger set_duplas_updated_at
before update on public.duplas
for each row
execute function private.set_updated_at();

alter table public.provas enable row level security;
alter table public.duplas enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'provas'
      and policyname = 'provas_public_api'
  ) then
    create policy provas_public_api
      on public.provas
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'duplas'
      and policyname = 'duplas_public_api'
  ) then
    create policy duplas_public_api
      on public.duplas
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end
$$;
