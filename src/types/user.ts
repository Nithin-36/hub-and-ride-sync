
import { Database } from '@/integrations/supabase/types';

// Extract types from Supabase database schema
export type UserRole = Database['public']['Enums']['user_role'];
export type VehicleType = Database['public']['Enums']['vehicle_type'];
export type RideStatus = Database['public']['Enums']['ride_status'];

// User Profile Types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Driver Profile Types
export type DriverProfile = Database['public']['Tables']['driver_profiles']['Row'];
export type DriverProfileInsert = Database['public']['Tables']['driver_profiles']['Insert'];
export type DriverProfileUpdate = Database['public']['Tables']['driver_profiles']['Update'];

// Extended Profile with Driver data (for joined queries)
export interface ExtendedProfile extends Profile {
  driver_profile?: DriverProfile;
}

// User authentication types
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

// Location types for rides
export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

// Ride related types
export type Ride = Database['public']['Tables']['rides']['Row'];
export type RideInsert = Database['public']['Tables']['rides']['Insert'];
export type RideUpdate = Database['public']['Tables']['rides']['Update'];

export type RideRequest = Database['public']['Tables']['ride_requests']['Row'];
export type RideRequestInsert = Database['public']['Tables']['ride_requests']['Insert'];
export type RideRequestUpdate = Database['public']['Tables']['ride_requests']['Update'];

export type RideLocation = Database['public']['Tables']['ride_locations']['Row'];
export type RideLocationInsert = Database['public']['Tables']['ride_locations']['Insert'];
export type RideLocationUpdate = Database['public']['Tables']['ride_locations']['Update'];

// Extended ride data with profile information
export interface ExtendedRide extends Ride {
  passenger?: Profile;
  driver?: Profile & { driver_profile?: DriverProfile };
}

// Driver availability and search filters
export interface DriverSearchFilters {
  vehicleType?: VehicleType;
  isAvailable?: boolean;
  isVerified?: boolean;
  minRating?: number;
  location?: LocationData;
  radius?: number; // in kilometers
}

// Ride booking data
export interface RideBookingData {
  pickupLocation: LocationData;
  destinationLocation: LocationData;
  pickupTime: string;
  maxPrice?: number;
}

// Rating and feedback types
export interface RideRating {
  rating: number;
  feedback?: string;
}

export interface DriverRating extends RideRating {
  driverId: string;
}

export interface PassengerRating extends RideRating {
  passengerId: string;
}
