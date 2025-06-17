
// types/supabase.ts
import type { Database } from '@/integrations/supabase/types';

/* ───────────────────── ENUMS ───────────────────── */

export type UserRole    = Database['public']['Enums']['user_role'];
export type VehicleType = Database['public']['Enums']['vehicle_type'];
export type RideStatus  = Database['public']['Enums']['ride_status'];

/* ──────────────── CORE TABLE ROW TYPES ───────────── */

export type Profile           = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert     = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate     = Database['public']['Tables']['profiles']['Update'];

export type DriverProfile         = Database['public']['Tables']['driver_profiles']['Row'];
export type DriverProfileInsert   = Database['public']['Tables']['driver_profiles']['Insert'];
export type DriverProfileUpdate   = Database['public']['Tables']['driver_profiles']['Update'];

export type Ride              = Database['public']['Tables']['rides']['Row'];
export type RideInsert        = Database['public']['Tables']['rides']['Insert'];
export type RideUpdate        = Database['public']['Tables']['rides']['Update'];

export type RideRequest       = Database['public']['Tables']['ride_requests']['Row'];
export type RideRequestInsert = Database['public']['Tables']['ride_requests']['Insert'];
export type RideRequestUpdate = Database['public']['Tables']['ride_requests']['Update'];

export type RideLocation         = Database['public']['Tables']['ride_locations']['Row'];
export type RideLocationInsert   = Database['public']['Tables']['ride_locations']['Insert'];
export type RideLocationUpdate   = Database['public']['Tables']['ride_locations']['Update'];

/* ─────────────── EXTENDED / JOINED TYPES ─────────── */

export interface ExtendedProfile extends Profile {
  /** Present if the user is a driver and the query joined `driver_profiles` */
  driver_profile?: DriverProfile | null;
}

export interface ExtendedRide extends Ride {
  passenger?: Profile | null;
  driver?: (Profile & { driver_profile?: DriverProfile | null }) | null;
}

/* ───────────────────── DTOs ──────────────────────── */

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

/** Geographic coordinate plus displayable address */
export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

/** Filters used when a passenger searches for drivers */
export interface DriverSearchFilters {
  vehicleType?: VehicleType;
  isAvailable?: boolean;
  isVerified?: boolean;
  minRating?: number;
  location?: LocationData;
  /** Search radius, kilometres */
  radius?: number;
}

/** Data required when a passenger books a ride */
export interface RideBookingData {
  pickupLocation: LocationData;
  destinationLocation: LocationData;
  /** ISO‑8601 date‑time string, e.g. `2025-06-17T14:00:00Z` */
  pickupTime: string;
  maxPrice?: number;
}

/* ─────────────── Ratings & Feedback ─────────────── */

export interface RideRating {
  /** 1 – 5 stars */
  rating: number;
  feedback?: string;
}

export interface DriverRating extends RideRating {
  driverId: string;
}

export interface PassengerRating extends RideRating {
  passengerId: string;
}
