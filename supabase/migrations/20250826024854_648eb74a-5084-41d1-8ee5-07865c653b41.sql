-- Fix security warnings: Add search_path to functions for security
BEGIN;

-- 1. Fix sync_rides_history_from_passenger function
CREATE OR REPLACE FUNCTION public.sync_rides_history_from_passenger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 2. Fix sync_drivers_details_from_rides function  
CREATE OR REPLACE FUNCTION public.sync_drivers_details_from_rides()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 3. Fix update_updated_at_column function (if it exists and needs fixing)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMIT;