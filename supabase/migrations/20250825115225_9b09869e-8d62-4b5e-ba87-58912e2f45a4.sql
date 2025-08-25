begin;
-- First, drop the dependent foreign key constraints
alter table public.passengers_details drop constraint if exists passengers_details_passenger_id_fkey;
alter table public.drivers_details drop constraint if exists drivers_details_passenger_id_fkey;
alter table public.passengers_details drop constraint if exists passengers_details_driver_id_fkey;
alter table public.drivers_details drop constraint if exists drivers_details_driver_id_fkey;

-- Passengers: add new columns and migrate data
alter table public.passengers
  add column if not exists userid uuid,
  add column if not exists name text,
  add column if not exists role text;

update public.passengers set userid = coalesce(userid, user_id);
update public.passengers set userid = extensions.uuid_generate_v4() where userid is null;

-- Drop old primary key and create new one
alter table public.passengers drop constraint if exists passengers_pkey;
alter table public.passengers add constraint passengers_pkey primary key (userid);

-- Drop old columns
alter table public.passengers
  drop column if exists id,
  drop column if exists user_id,
  drop column if exists created_at,
  drop column if exists updated_at;

-- Drivers: add new columns and migrate data
alter table public.drivers
  add column if not exists userid uuid,
  add column if not exists name text,
  add column if not exists role text;

update public.drivers set userid = coalesce(userid, user_id);
update public.drivers set userid = extensions.uuid_generate_v4() where userid is null;

-- Drop old primary key and create new one
alter table public.drivers drop constraint if exists drivers_pkey;
alter table public.drivers add constraint drivers_pkey primary key (userid);

-- Drop old columns
alter table public.drivers
  drop column if exists id,
  drop column if exists user_id,
  drop column if exists is_available,
  drop column if exists created_at,
  drop column if exists updated_at,
  drop column if exists vehicle_model,
  drop column if exists vehicle_number,
  drop column if exists license_number;

-- Recreate foreign key constraints with new structure
alter table public.passengers_details 
  add constraint passengers_details_passenger_id_fkey 
  foreign key (passenger_id) references public.passengers(userid);

alter table public.drivers_details 
  add constraint drivers_details_driver_id_fkey 
  foreign key (driver_id) references public.drivers(userid);

-- Update RLS policies for passengers
drop policy if exists "Allow all for passengers" on public.passengers;
drop policy if exists "Users can view their own passenger record" on public.passengers;
drop policy if exists "Users can insert their own passenger record" on public.passengers;
drop policy if exists "Users can update their own passenger record" on public.passengers;
drop policy if exists "Users can delete their own passenger record" on public.passengers;

create policy "Users can view their own passenger record"
on public.passengers for select to authenticated
using (auth.uid() = userid);

create policy "Users can insert their own passenger record"
on public.passengers for insert to authenticated
with check (auth.uid() = userid);

create policy "Users can update their own passenger record"
on public.passengers for update to authenticated
using (auth.uid() = userid);

create policy "Users can delete their own passenger record"
on public.passengers for delete to authenticated
using (auth.uid() = userid);

-- Update RLS policies for drivers
drop policy if exists "Allow all for drivers" on public.drivers;
drop policy if exists "Users can view their own driver record" on public.drivers;
drop policy if exists "Users can insert their own driver record" on public.drivers;
drop policy if exists "Users can update their own driver record" on public.drivers;
drop policy if exists "Users can delete their own driver record" on public.drivers;

create policy "Users can view their own driver record"
on public.drivers for select to authenticated
using (auth.uid() = userid);

create policy "Users can insert their own driver record"
on public.drivers for insert to authenticated
with check (auth.uid() = userid);

create policy "Users can update their own driver record"
on public.drivers for update to authenticated
using (auth.uid() = userid);

create policy "Users can delete their own driver record"
on public.drivers for delete to authenticated
using (auth.uid() = userid);

commit;