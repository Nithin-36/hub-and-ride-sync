-- 1) Create rides table that replaces drivers_details responsibilities and relates to drivers
BEGIN;

-- Create rides table
CREATE TABLE IF NOT EXISTS public.rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL,
  pickup_location jsonb NOT NULL,
  destination_location jsonb NOT NULL,
  pickup_time timestamptz NOT NULL,
  distance_km numeric,
  price numeric,
  rating integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  destination text,
  status text NOT NULL DEFAULT 'pending',
  pick_up text,
  feedback text
);

-- Add FK from rides.driver_id -> drivers.userid
ALTER TABLE public.rides
  ADD CONSTRAINT rides_driver_id_fkey FOREIGN KEY (driver_id)
  REFERENCES public.drivers(userid) ON DELETE CASCADE;

-- Enable RLS and add policies for drivers managing own rides
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rides' AND policyname = 'Drivers can view their own rides'
  ) THEN
    CREATE POLICY "Drivers can view their own rides"
      ON public.rides
      FOR SELECT
      USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rides' AND policyname = 'Drivers can insert their own rides'
  ) THEN
    CREATE POLICY "Drivers can insert their own rides"
      ON public.rides
      FOR INSERT
      WITH CHECK (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rides' AND policyname = 'Drivers can update their own rides'
  ) THEN
    CREATE POLICY "Drivers can update their own rides"
      ON public.rides
      FOR UPDATE
      USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rides' AND policyname = 'Drivers can delete their own rides'
  ) THEN
    CREATE POLICY "Drivers can delete their own rides"
      ON public.rides
      FOR DELETE
      USING (auth.uid() = driver_id);
  END IF;
END $$;

-- Updated_at trigger for rides
DROP TRIGGER IF EXISTS update_rides_updated_at ON public.rides;
CREATE TRIGGER update_rides_updated_at
BEFORE UPDATE ON public.rides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Create rides_history to link rides with passenger trips
CREATE TABLE IF NOT EXISTS public.rides_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL,
  passenger_detail_id uuid NOT NULL,
  driver_id uuid NOT NULL,
  passenger_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rides_history_ride_fkey FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE,
  CONSTRAINT rides_history_passenger_detail_fkey FOREIGN KEY (passenger_detail_id) REFERENCES public.passengers_details(id) ON DELETE CASCADE,
  CONSTRAINT rides_history_driver_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(userid) ON DELETE CASCADE,
  CONSTRAINT rides_history_passenger_fkey FOREIGN KEY (passenger_id) REFERENCES public.passengers(userid) ON DELETE CASCADE,
  CONSTRAINT rides_history_passenger_detail_unique UNIQUE (passenger_detail_id)
);

-- Enable RLS and policies for rides_history
ALTER TABLE public.rides_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rides_history' AND policyname = 'Participants can view their rides history'
  ) THEN
    CREATE POLICY "Participants can view their rides history"
      ON public.rides_history
      FOR SELECT
      USING (auth.uid() = driver_id OR auth.uid() = passenger_id);
  END IF;
END $$;

-- Updated_at trigger for rides_history
DROP TRIGGER IF EXISTS update_rides_history_updated_at ON public.rides_history;
CREATE TRIGGER update_rides_history_updated_at
BEFORE UPDATE ON public.rides_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Trigger to automatically create/update rides_history from passengers_details when a ride is taken
CREATE OR REPLACE FUNCTION public.sync_rides_history_from_passenger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

DROP TRIGGER IF EXISTS passengers_details_sync_rides_history ON public.passengers_details;
CREATE TRIGGER passengers_details_sync_rides_history
AFTER INSERT OR UPDATE OF status ON public.passengers_details
FOR EACH ROW
EXECUTE FUNCTION public.sync_rides_history_from_passenger();

-- 4) Keep drivers_details populated for backward compatibility (sync from rides)
CREATE OR REPLACE FUNCTION public.sync_drivers_details_from_rides()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.drivers_details (
      id, driver_id, passenger_id, pickup_location, destination_location, pickup_time, distance_km, price, rating,
      created_at, updated_at, completed_at, destination, status, pick_up, feedback
    )
    VALUES (
      NEW.id, NEW.driver_id, NULL, NEW.pickup_location, NEW.destination_location, NEW.pickup_time, NEW.distance_km, NEW.price, NEW.rating,
      NEW.created_at, NEW.updated_at, NEW.completed_at, NEW.destination, NEW.status, NEW.pick_up, NEW.feedback
    )
    ON CONFLICT (id) DO NOTHING;
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
    WHERE dd.id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rides_sync_drivers_details ON public.rides;
CREATE TRIGGER rides_sync_drivers_details
AFTER INSERT OR UPDATE ON public.rides
FOR EACH ROW
EXECUTE FUNCTION public.sync_drivers_details_from_rides();

COMMIT;