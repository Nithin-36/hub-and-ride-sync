-- Drop existing tables and create new schema with non-conflicting names
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
CREATE TYPE public.user_role AS ENUM ('passenger', 'driver');

-- 3) Utility function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Main tables (using app_users to avoid conflict with auth.users)
CREATE TABLE public.app_users (
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
  user_id uuid NOT NULL UNIQUE REFERENCES public.app_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.app_users(id) ON DELETE CASCADE,
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

-- 5) Indexes for performance
CREATE INDEX idx_app_users_email ON public.app_users (email);
CREATE INDEX idx_drivers_details_driver_created ON public.drivers_details (driver_id, created_at DESC);
CREATE INDEX idx_passengers_details_passenger_created ON public.passengers_details (passenger_id, created_at DESC);

-- 6) Updated_at triggers
CREATE TRIGGER trg_app_users_updated_at
BEFORE UPDATE ON public.app_users
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

-- 7) Enable RLS on all tables
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers_details ENABLE ROW LEVEL SECURITY;

-- 8) RLS policies (basic ones for now - will be refined with custom auth)
CREATE POLICY "Users can view their own data" ON public.app_users FOR ALL USING (true);
CREATE POLICY "Passengers can manage their data" ON public.passengers FOR ALL USING (true);
CREATE POLICY "Drivers can manage their data" ON public.drivers FOR ALL USING (true);
CREATE POLICY "Passengers can manage their ride details" ON public.passengers_details FOR ALL USING (true);
CREATE POLICY "Drivers can manage their ride details" ON public.drivers_details FOR ALL USING (true);