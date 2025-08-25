begin;
-- Passengers: keep only userid, name, role
alter table public.passengers
  add column if not exists userid uuid,
  add column if not exists name text,
  add column if not exists role text;

update public.passengers set userid = coalesce(userid, user_id);
update public.passengers set userid = extensions.uuid_generate_v4() where userid is null;

-- Replace primary key with userid
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.passengers'::regclass AND contype = 'p'
  ) THEN
    EXECUTE 'alter table public.passengers drop constraint ' || (
      SELECT conname FROM pg_constraint
      WHERE conrelid = 'public.passengers'::regclass AND contype = 'p'
    );
  END IF;
END $$;

alter table public.passengers
  add constraint passengers_pkey primary key (userid);

-- Drop old/unused columns
alter table public.passengers
  drop column if exists id,
  drop column if exists user_id,
  drop column if exists created_at,
  drop column if exists updated_at;

-- RLS: restrict to own row
alter table public.passengers enable row level security;
DROP POLICY IF EXISTS "Allow all for passengers" ON public.passengers;
DROP POLICY IF EXISTS "Users can view their own passenger record" ON public.passengers;
DROP POLICY IF EXISTS "Users can insert their own passenger record" ON public.passengers;
DROP POLICY IF EXISTS "Users can update their own passenger record" ON public.passengers;
DROP POLICY IF EXISTS "Users can delete their own passenger record" ON public.passengers;

create policy "Users can view their own passenger record"
on public.passengers
for select
to authenticated
using (auth.uid() = userid);

create policy "Users can insert their own passenger record"
on public.passengers
for insert
to authenticated
with check (auth.uid() = userid);

create policy "Users can update their own passenger record"
on public.passengers
for update
to authenticated
using (auth.uid() = userid);

create policy "Users can delete their own passenger record"
on public.passengers
for delete
to authenticated
using (auth.uid() = userid);

-- Drivers: keep only userid, name, role
alter table public.drivers
  add column if not exists userid uuid,
  add column if not exists name text,
  add column if not exists role text;

update public.drivers set userid = coalesce(userid, user_id);
update public.drivers set userid = extensions.uuid_generate_v4() where userid is null;

-- Replace primary key with userid
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.drivers'::regclass AND contype = 'p'
  ) THEN
    EXECUTE 'alter table public.drivers drop constraint ' || (
      SELECT conname FROM pg_constraint
      WHERE conrelid = 'public.drivers'::regclass AND contype = 'p'
    );
  END IF;
END $$;

alter table public.drivers
  add constraint drivers_pkey primary key (userid);

-- Drop old/unused columns
alter table public.drivers
  drop column if exists id,
  drop column if exists user_id,
  drop column if exists is_available,
  drop column if exists created_at,
  drop column if exists updated_at,
  drop column if exists vehicle_model,
  drop column if exists vehicle_number,
  drop column if exists license_number;

-- RLS: restrict to own row
alter table public.drivers enable row level security;
DROP POLICY IF EXISTS "Allow all for drivers" ON public.drivers;
DROP POLICY IF EXISTS "Users can view their own driver record" ON public.drivers;
DROP POLICY IF EXISTS "Users can insert their own driver record" ON public.drivers;
DROP POLICY IF EXISTS "Users can update their own driver record" ON public.drivers;
DROP POLICY IF EXISTS "Users can delete their own driver record" ON public.drivers;

create policy "Users can view their own driver record"
on public.drivers
for select
to authenticated
using (auth.uid() = userid);

create policy "Users can insert their own driver record"
on public.drivers
for insert
to authenticated
with check (auth.uid() = userid);

create policy "Users can update their own driver record"
on public.drivers
for update
to authenticated
using (auth.uid() = userid);

create policy "Users can delete their own driver record"
on public.drivers
for delete
to authenticated
using (auth.uid() = userid);

commit;