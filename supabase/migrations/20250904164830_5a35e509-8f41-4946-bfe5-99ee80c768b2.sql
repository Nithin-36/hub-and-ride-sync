-- Add FK from rides.driver_id to app_users.id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE c.conname = 'rides_driver_id_fkey'
      AND t.relname = 'rides'
  ) THEN
    ALTER TABLE public.rides
      ADD CONSTRAINT rides_driver_id_fkey
      FOREIGN KEY (driver_id) REFERENCES public.app_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Relax INSERT policy to allow app_users drivers to insert without a Supabase Auth session
-- Drop existing INSERT policy if present
DROP POLICY IF EXISTS "Drivers can insert their own rides" ON public.rides;

-- Create a permissive insert policy that allows either authenticated drivers
-- or records whose driver_id exists in app_users with role 'driver'
CREATE POLICY "Drivers can insert rides (auth or app_users check)"
ON public.rides
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = driver_id)
  OR EXISTS (
    SELECT 1 FROM public.app_users u
    WHERE u.id = driver_id AND u.role = 'driver'
  )
);
