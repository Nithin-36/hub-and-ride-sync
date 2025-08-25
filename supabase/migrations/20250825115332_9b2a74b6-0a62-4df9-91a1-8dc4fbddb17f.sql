-- Add pick_up and destination columns to drivers_details table
alter table public.drivers_details 
  add column if not exists pick_up text,
  add column if not exists destination text;