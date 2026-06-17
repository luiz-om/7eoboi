alter table public.duplas
  alter column cavalo1 drop not null,
  alter column cavalo2 drop not null;

-- Remove legacy constraints that enforced non-empty cavalo names.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.duplas'::regclass
      AND contype = 'c'
      AND conname ~ 'cavalo1|cavalo2'
  LOOP
    EXECUTE format('ALTER TABLE public.duplas DROP CONSTRAINT IF EXISTS %I', c.conname);
  END LOOP;
END
$$;

update public.duplas
set cavalo1 = null
where cavalo1 = '';

update public.duplas
set cavalo2 = null
where cavalo2 = '';
