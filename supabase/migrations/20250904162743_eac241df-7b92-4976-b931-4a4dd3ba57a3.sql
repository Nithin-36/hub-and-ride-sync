-- Ensure unique ride linkage for drivers_details
CREATE UNIQUE INDEX IF NOT EXISTS ux_drivers_details_ride_id ON public.drivers_details (ride_id);

-- Add FK from drivers_details.ride_id -> rides.id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE c.conname = 'drivers_details_ride_id_fkey'
      AND t.relname = 'drivers_details'
  ) THEN
    ALTER TABLE public.drivers_details
      ADD CONSTRAINT drivers_details_ride_id_fkey
      FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Recreate sync triggers on rides to mirror into drivers_details
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_drivers_details_after_rides_ins') THEN
    DROP TRIGGER trg_sync_drivers_details_after_rides_ins ON public.rides;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_drivers_details_after_rides_upd') THEN
    DROP TRIGGER trg_sync_drivers_details_after_rides_upd ON public.rides;
  END IF;
END $$;

CREATE TRIGGER trg_sync_drivers_details_after_rides_ins
AFTER INSERT ON public.rides
FOR EACH ROW
EXECUTE FUNCTION public.sync_drivers_details_from_rides();

CREATE TRIGGER trg_sync_drivers_details_after_rides_upd
AFTER UPDATE ON public.rides
FOR EACH ROW
EXECUTE FUNCTION public.sync_drivers_details_from_rides();