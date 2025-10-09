-- Enable real-time updates for passengers_details table
ALTER TABLE public.passengers_details REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.passengers_details;