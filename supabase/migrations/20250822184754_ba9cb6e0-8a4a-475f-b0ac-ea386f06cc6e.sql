-- Drop old schema objects and create new requested schema
-- 1) Clean up existing objects
DO $$
BEGIN
  -- Drop functions if they exist
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_ride_price') THEN
    DROP FUNCTION IF EXISTS public.calculate_ride_price CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_user_exists') THEN
    DROP FUNCTION IF EXISTS public.check_user_exists CASCADE;
  END IF;

  -- Drop tables if they exist
  IF to_regclass('public.ride_locations') IS NOT NULL THEN
    DROP TABLE public.ride_locations CASCADE;
  END IF;
  IF to_regclass('public.ride_requests') IS NOT NULL THEN
    DROP TABLE public.ride_requests CASCADE;
  END IF;
  IF to_regclass('public.rides') IS NOT NULL THEN
    DROP TABLE public.rides CASCADE;
  END IF;
  IF to_regclass('public.driver_profiles') IS NOT NULL THEN
    DROP TABLE public.driver_profiles CASCADE;
  END IF;
  IF to_regclass('public.profiles') IS NOT NULL THEN
    DROP TABLE public.profiles CASCADE;
  END IF;

  -- Drop enums if they exist
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ride_status') THEN
    DROP TYPE public.ride_status CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    DROP TYPE public.user_role CASCADE;
  END IF;
END $$;

-- 2) Create new types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('passenger', 'driver');
  END IF;
END $$;

-- 3) Core utility function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) New tables
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role public.user_role NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.passengers (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  vehicle_model text NOT NULL,
  vehicle_number text NOT NULL,
  license_number text NOT NULL UNIQUE,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.passengers_details (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  passenger_id uuid NOT NULL REFERENCES public.passengers(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  pickup_location jsonb NOT NULL,
  destination_location jsonb NOT NULL,
  pickup_time timestamptz NOT NULL,
  distance_km numeric,
  price numeric,
  status text NOT NULL DEFAULT 'pending',
  rating integer,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.drivers_details (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  passenger_id uuid REFERENCES public.passengers(id) ON DELETE SET NULL,
  pickup_location jsonb NOT NULL,
  destination_location jsonb NOT NULL,
  pickup_time timestamptz NOT NULL,
  distance_km numeric,
  price numeric,
  status text NOT NULL DEFAULT 'pending',
  rating integer,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_drivers_details_driver ON public.drivers_details (driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_passengers_details_passenger ON public.passengers_details (passenger_id, created_at DESC);

-- 6) Triggers for updated_at
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_passengers_updated_at
BEFORE UPDATE ON public.passengers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_passengers_details_updated_at
BEFORE UPDATE ON public.passengers_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_drivers_details_updated_at
BEFORE UPDATE ON public.drivers_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();