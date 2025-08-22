-- Force drop all existing tables and recreate schema
DROP TABLE IF EXISTS public.drivers_details CASCADE;
DROP TABLE IF EXISTS public.passengers_details CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.passengers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop any remaining functions and types
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Recreate everything fresh
CREATE TYPE public.user_role AS ENUM ('passenger', 'driver');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Main users table (renamed to avoid conflicts)
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

-- Passengers table
CREATE TABLE public.passengers (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.app_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Drivers table
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

-- Passengers details (ride history for passengers)
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

-- Drivers details (ride history for drivers)
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

-- Indexes
CREATE INDEX idx_app_users_email ON public.app_users (email);
CREATE INDEX idx_drivers_details_driver ON public.drivers_details (driver_id, created_at DESC);
CREATE INDEX idx_passengers_details_passenger ON public.passengers_details (passenger_id, created_at DESC);

-- Triggers for updated_at
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

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers_details ENABLE ROW LEVEL SECURITY;

-- RLS policies (open for now, will secure with custom auth)
CREATE POLICY "Allow all for app_users" ON public.app_users FOR ALL USING (true);
CREATE POLICY "Allow all for passengers" ON public.passengers FOR ALL USING (true);
CREATE POLICY "Allow all for drivers" ON public.drivers FOR ALL USING (true);
CREATE POLICY "Allow all for passengers_details" ON public.passengers_details FOR ALL USING (true);
CREATE POLICY "Allow all for drivers_details" ON public.drivers_details FOR ALL USING (true);