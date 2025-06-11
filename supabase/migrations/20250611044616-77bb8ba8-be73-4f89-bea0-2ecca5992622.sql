
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('driver', 'passenger');
CREATE TYPE ride_status AS ENUM ('pending', 'matched', 'in_progress', 'completed', 'cancelled');
CREATE TYPE vehicle_type AS ENUM ('sedan', 'suv', 'hatchback', 'motorcycle');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  rating DECIMAL(2,1) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create driver_profiles table for driver-specific information
CREATE TABLE public.driver_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  license_number TEXT NOT NULL UNIQUE,
  vehicle_type vehicle_type NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_color TEXT NOT NULL,
  vehicle_number TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rides table for ride requests and bookings
CREATE TABLE public.rides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  passenger_id UUID REFERENCES public.profiles(id) NOT NULL,
  driver_id UUID REFERENCES public.profiles(id),
  pickup_location JSONB NOT NULL, -- {lat, lng, address}
  destination_location JSONB NOT NULL, -- {lat, lng, address}
  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_distance DECIMAL(10,2), -- in kilometers
  estimated_price DECIMAL(10,2), -- in rupees
  actual_distance DECIMAL(10,2),
  actual_price DECIMAL(10,2),
  status ride_status DEFAULT 'pending',
  passenger_rating INTEGER CHECK (passenger_rating >= 1 AND passenger_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  passenger_feedback TEXT,
  driver_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create ride_locations table for real-time tracking
CREATE TABLE public.ride_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.profiles(id) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ride_requests table for matching algorithm
CREATE TABLE public.ride_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  passenger_id UUID REFERENCES public.profiles(id) NOT NULL,
  pickup_location JSONB NOT NULL,
  destination_location JSONB NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_price DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for driver_profiles
CREATE POLICY "Drivers can view their own driver profile" ON public.driver_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Drivers can update their own driver profile" ON public.driver_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Drivers can insert their own driver profile" ON public.driver_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view driver profiles for rides" ON public.driver_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rides 
      WHERE (passenger_id = auth.uid() OR driver_id = auth.uid()) 
      AND driver_id = public.driver_profiles.id
    )
  );

-- RLS Policies for rides
CREATE POLICY "Users can view their own rides" ON public.rides
  FOR SELECT USING (passenger_id = auth.uid() OR driver_id = auth.uid());

CREATE POLICY "Passengers can create rides" ON public.rides
  FOR INSERT WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Users can update their own rides" ON public.rides
  FOR UPDATE USING (passenger_id = auth.uid() OR driver_id = auth.uid());

-- RLS Policies for ride_locations
CREATE POLICY "Users can view locations for their rides" ON public.ride_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rides 
      WHERE rides.id = ride_locations.ride_id 
      AND (passenger_id = auth.uid() OR driver_id = auth.uid())
    )
  );

CREATE POLICY "Drivers can insert their location" ON public.ride_locations
  FOR INSERT WITH CHECK (driver_id = auth.uid());

-- RLS Policies for ride_requests
CREATE POLICY "Users can view active ride requests" ON public.ride_requests
  FOR SELECT USING (status = 'active' OR passenger_id = auth.uid());

CREATE POLICY "Passengers can create ride requests" ON public.ride_requests
  FOR INSERT WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Passengers can update their own ride requests" ON public.ride_requests
  FOR UPDATE USING (passenger_id = auth.uid());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'passenger')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate distance-based pricing
CREATE OR REPLACE FUNCTION public.calculate_ride_price(distance_km DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  -- Base rate: ₹8 per km
  RETURN distance_km * 8.0;
END;
$$ LANGUAGE plpgsql;

-- Function to update ride timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for real-time tracking
ALTER TABLE public.ride_locations REPLICA IDENTITY FULL;
ALTER TABLE public.rides REPLICA IDENTITY FULL;
ALTER TABLE public.ride_requests REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;
