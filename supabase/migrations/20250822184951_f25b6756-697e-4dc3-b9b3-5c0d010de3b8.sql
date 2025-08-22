-- Fix security issues: Enable RLS and secure function

-- 1) Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers_details ENABLE ROW LEVEL SECURITY;

-- 2) Secure the update function
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3) Create basic RLS policies for the custom auth system
-- Users can only see/modify their own records
CREATE POLICY "Users can view own record" ON public.users
FOR SELECT USING (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Users can update own record" ON public.users
FOR UPDATE USING (id = current_setting('app.current_user_id', true)::uuid);

-- Passengers policies
CREATE POLICY "Passengers can view own record" ON public.passengers
FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Passengers can update own record" ON public.passengers
FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Drivers policies
CREATE POLICY "Drivers can view own record" ON public.drivers
FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY "Drivers can update own record" ON public.drivers
FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Passenger details policies
CREATE POLICY "Passengers can view own rides" ON public.passengers_details
FOR SELECT USING (passenger_id IN (SELECT id FROM public.passengers WHERE user_id = current_setting('app.current_user_id', true)::uuid));

CREATE POLICY "Passengers can create rides" ON public.passengers_details
FOR INSERT WITH CHECK (passenger_id IN (SELECT id FROM public.passengers WHERE user_id = current_setting('app.current_user_id', true)::uuid));

CREATE POLICY "Passengers can update own rides" ON public.passengers_details
FOR UPDATE USING (passenger_id IN (SELECT id FROM public.passengers WHERE user_id = current_setting('app.current_user_id', true)::uuid));

-- Driver details policies
CREATE POLICY "Drivers can view own rides" ON public.drivers_details
FOR SELECT USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = current_setting('app.current_user_id', true)::uuid));

CREATE POLICY "Drivers can create rides" ON public.drivers_details
FOR INSERT WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = current_setting('app.current_user_id', true)::uuid));

CREATE POLICY "Drivers can update own rides" ON public.drivers_details
FOR UPDATE USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = current_setting('app.current_user_id', true)::uuid));