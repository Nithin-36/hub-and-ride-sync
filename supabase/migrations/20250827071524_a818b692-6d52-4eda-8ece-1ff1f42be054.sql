BEGIN;

-- 1) Add ride_id in drivers_details, drop strict FK to drivers, and relate to rides
ALTER TABLE public.drivers_details ADD COLUMN IF NOT EXISTS ride_id uuid;

-- Drop existing FK to drivers if present (causing 23503 errors)
ALTER TABLE public.drivers_details DROP CONSTRAINT IF EXISTS drivers_details_driver_id_fkey;

-- Unique index for one-to-one mapping with rides (NULLs allowed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'drivers_details_ride_id_key'
  ) THEN
    CREATE UNIQUE INDEX drivers_details_ride_id_key ON public.drivers_details(ride_id) WHERE ride_id IS NOT NULL;
  END IF;
END$$;

-- FK from drivers_details.ride_id -> rides.id (cascade when ride is removed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND table_name = 'drivers_details' AND constraint_name = 'drivers_details_ride_id_fkey'
  ) THEN
    ALTER TABLE public.drivers_details
      ADD CONSTRAINT drivers_details_ride_id_fkey
      FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 2) Recreate sync function to mirror rides -> drivers_details using ride_id upsert
CREATE OR REPLACE FUNCTION public.sync_drivers_details_from_rides()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.drivers_details (
      ride_id, driver_id, passenger_id, pickup_location, destination_location, pickup_time,
      distance_km, price, rating, created_at, updated_at, completed_at, destination, status, pick_up, feedback
    )
    VALUES (
      NEW.id, NEW.driver_id, NULL, NEW.pickup_location, NEW.destination_location, NEW.pickup_time,
      NEW.distance_km, NEW.price, NEW.rating, NEW.created_at, NEW.updated_at, NEW.completed_at, NEW.destination, NEW.status, NEW.pick_up, NEW.feedback
    )
    ON CONFLICT (ride_id) DO UPDATE SET
      driver_id = EXCLUDED.driver_id,
      pickup_location = EXCLUDED.pickup_location,
      destination_location = EXCLUDED.destination_location,
      pickup_time = EXCLUDED.pickup_time,
      distance_km = EXCLUDED.distance_km,
      price = EXCLUDED.price,
      rating = EXCLUDED.rating,
      updated_at = EXCLUDED.updated_at,
      completed_at = EXCLUDED.completed_at,
      destination = EXCLUDED.destination,
      status = EXCLUDED.status,
      pick_up = EXCLUDED.pick_up,
      feedback = EXCLUDED.feedback;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.drivers_details dd
    SET driver_id = NEW.driver_id,
        pickup_location = NEW.pickup_location,
        destination_location = NEW.destination_location,
        pickup_time = NEW.pickup_time,
        distance_km = NEW.distance_km,
        price = NEW.price,
        rating = NEW.rating,
        updated_at = NEW.updated_at,
        completed_at = NEW.completed_at,
        destination = NEW.destination,
        status = NEW.status,
        pick_up = NEW.pick_up,
        feedback = NEW.feedback
    WHERE dd.ride_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3) Attach trigger on rides to keep drivers_details in sync
DROP TRIGGER IF EXISTS trg_sync_drivers_details_from_rides ON public.rides;
CREATE TRIGGER trg_sync_drivers_details_from_rides
AFTER INSERT OR UPDATE ON public.rides
FOR EACH ROW
EXECUTE FUNCTION public.sync_drivers_details_from_rides();

-- 4) Ensure rides_history has FKs and unique index for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND table_name = 'rides_history' AND constraint_name = 'rides_history_ride_id_fkey'
  ) THEN
    ALTER TABLE public.rides_history
      ADD CONSTRAINT rides_history_ride_id_fkey
      FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND table_name = 'rides_history' AND constraint_name = 'rides_history_passenger_detail_id_fkey'
  ) THEN
    ALTER TABLE public.rides_history
      ADD CONSTRAINT rides_history_passenger_detail_id_fkey
      FOREIGN KEY (passenger_detail_id) REFERENCES public.passengers_details(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'rides_history_passenger_detail_id_key'
  ) THEN
    CREATE UNIQUE INDEX rides_history_passenger_detail_id_key ON public.rides_history(passenger_detail_id);
  END IF;
END$$;

-- 5) Ensure rides_history sync function is set (recreate for safety) and attach trigger
CREATE OR REPLACE FUNCTION public.sync_rides_history_from_passenger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ride_id uuid;
BEGIN
  -- Only proceed if a driver is associated
  IF NEW.driver_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- On insert or status change to an active/completed state, create or update rides_history
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    IF NEW.status IN ('confirmed','in_progress','completed') THEN
      SELECT r.id INTO v_ride_id
      FROM public.rides r
      WHERE r.driver_id = NEW.driver_id
        AND COALESCE(r.pick_up, '') = COALESCE(NEW.pickup_location->>'address', '')
        AND COALESCE(r.destination, '') = COALESCE(NEW.destination_location->>'address', '')
      ORDER BY r.created_at DESC
      LIMIT 1;

      IF v_ride_id IS NOT NULL THEN
        INSERT INTO public.rides_history (ride_id, passenger_detail_id, driver_id, passenger_id, status)
        VALUES (v_ride_id, NEW.id, NEW.driver_id, NEW.passenger_id, NEW.status)
        ON CONFLICT (passenger_detail_id) DO UPDATE SET
          ride_id = EXCLUDED.ride_id,
          driver_id = EXCLUDED.driver_id,
          passenger_id = EXCLUDED.passenger_id,
          status = EXCLUDED.status,
          updated_at = now();
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_rides_history_from_passenger ON public.passengers_details;
CREATE TRIGGER trg_sync_rides_history_from_passenger
AFTER INSERT OR UPDATE ON public.passengers_details
FOR EACH ROW
EXECUTE FUNCTION public.sync_rides_history_from_passenger();

COMMIT;