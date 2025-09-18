-- Fix save failure for Offer Ride by correcting FK and enabling sync triggers
-- 1) Drop wrong FK (to drivers) if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_schema = 'public'
      AND tc.table_name = 'rides'
      AND tc.constraint_name = 'rides_driver_id_fkey'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Attempt to identify referenced table; if it already points to app_users this drop/recreate is harmless
    ALTER TABLE public.rides DROP CONSTRAINT rides_driver_id_fkey;
  END IF;
END
$$;

-- 2) Create FK from rides.driver_id to app_users.id
ALTER TABLE public.rides
  ADD CONSTRAINT rides_driver_id_fkey
  FOREIGN KEY (driver_id)
  REFERENCES public.app_users(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- 3) Add missing column used by edge function to avoid runtime errors
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS license_number text;

-- 4) Attach triggers to keep drivers_details in sync with rides (function already exists)
DO $$
BEGIN
  -- Insert trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'sync_rides_to_drivers_details_insert'
  ) THEN
    CREATE TRIGGER sync_rides_to_drivers_details_insert
    AFTER INSERT ON public.rides
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_drivers_details_from_rides();
  END IF;

  -- Update trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'sync_rides_to_drivers_details_update'
  ) THEN
    CREATE TRIGGER sync_rides_to_drivers_details_update
    AFTER UPDATE ON public.rides
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_drivers_details_from_rides();
  END IF;
END
$$;