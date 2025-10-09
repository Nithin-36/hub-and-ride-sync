import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { calculateCityDistance } from '@/utils/distanceCalculator';

export interface DriverOffer {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_phone?: string;
  pickup_location: string;
  destination_location: string;
  pickup_time: string;
  distance_km?: number;
  price?: number;
  status: string;
  created_at: string;
  rating?: number;
  compatibility_score?: number;
}

export interface PassengerRequest {
  id: string;
  passenger_id: string;
  passenger_name: string;
  passenger_phone?: string;
  pickup_location: string;
  destination_location: string;
  pickup_time: string;
  passenger_count: number;
  price_range?: number;
  status: string;
  created_at: string;
  compatibility_score?: number;
}

export const useMatching = () => {
  const { user } = useAuth();
  const [driverOffers, setDriverOffers] = useState<DriverOffer[]>([]);
  const [passengerRequests, setPassengerRequests] = useState<PassengerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize location strings for accurate comparison
  const normalizeLocation = (location: string): string => {
    return location.toLowerCase().trim().replace(/[,.\s]+/g, ' ');
  };

  // Check if two locations are the same or very similar
  const isSameLocation = (loc1: string, loc2: string): boolean => {
    const norm1 = normalizeLocation(loc1);
    const norm2 = normalizeLocation(loc2);
    
    // Exact match
    if (norm1 === norm2) return true;
    
    // Check if one contains the other (for "City, State" vs "City" scenarios)
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
    
    return false;
  };

  // Calculate compatibility score between two locations and times
  const calculateCompatibilityScore = (
    pickup1: string, dest1: string, time1: string,
    pickup2: string, dest2: string, time2: string
  ): number => {
    let score = 0;

    // DESTINATION MATCHING (70% weight) - Most important for accurate matching
    if (isSameLocation(dest1, dest2)) {
      // Exact destination match - highest priority
      score += 70;
    } else {
      // Fallback to distance-based matching for destinations
      const destDistance = calculateCityDistance(dest1, dest2);
      if (destDistance <= 30) {
        score += 50; // Very close destinations
      } else if (destDistance <= 80) {
        score += 30; // Nearby destinations
      } else if (destDistance <= 150) {
        score += 15; // Moderately close
      }
    }

    // PICKUP MATCHING (20% weight) - Secondary priority
    if (isSameLocation(pickup1, pickup2)) {
      score += 20;
    } else {
      const pickupDistance = calculateCityDistance(pickup1, pickup2);
      if (pickupDistance <= 30) {
        score += 15;
      } else if (pickupDistance <= 80) {
        score += 10;
      } else if (pickupDistance <= 150) {
        score += 5;
      }
    }

    // TIME COMPATIBILITY (10% weight) - Least priority but still important
    const timeDiff = Math.abs(new Date(time1).getTime() - new Date(time2).getTime());
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff <= 1) {
      score += 10;
    } else if (hoursDiff <= 2) {
      score += 8;
    } else if (hoursDiff <= 4) {
      score += 5;
    } else if (hoursDiff <= 8) {
      score += 3;
    }

    return Math.min(score, 100);
  };

  // Find matching drivers for passenger request
  const findMatchingDrivers = async (
    passengerPickup: string,
    passengerDest: string,
    passengerTime: string
  ): Promise<DriverOffer[]> => {
    setLoading(true);
    setError(null);

    try {
      // Get all pending driver offerings
      const { data: rides, error: ridesError } = await supabase
        .from('rides')
        .select(`
          id,
          driver_id,
          pick_up,
          destination,
          pickup_time,
          distance_km,
          price,
          status,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (ridesError) throw ridesError;

      if (!rides || rides.length === 0) {
        return [];
      }

      // Get driver details
      const driverIds = rides.map(ride => ride.driver_id);
      const { data: users, error: usersError } = await supabase
        .from('app_users')
        .select('id, full_name, phone')
        .in('id', driverIds)
        .eq('role', 'driver');

      if (usersError) throw usersError;

      // Create enhanced driver offers with compatibility scores
      const driverOffers: DriverOffer[] = rides
        .map(ride => {
          const driverInfo = users?.find(u => u.id === ride.driver_id);
          if (!driverInfo) return null;

          const compatibilityScore = calculateCompatibilityScore(
            passengerPickup, passengerDest, passengerTime,
            ride.pick_up || '', ride.destination || '', ride.pickup_time
          );

          return {
            id: ride.id,
            driver_id: ride.driver_id,
            driver_name: driverInfo.full_name,
            driver_phone: driverInfo.phone || undefined,
            pickup_location: ride.pick_up || '',
            destination_location: ride.destination || '',
            pickup_time: ride.pickup_time,
            distance_km: ride.distance_km,
            price: ride.price,
            status: ride.status,
            created_at: ride.created_at,
            compatibility_score: compatibilityScore
          } as DriverOffer;
        })
        .filter((offer): offer is DriverOffer => offer !== null)
        .filter(offer => offer.compatibility_score! >= 40) // Min 40% compatibility for better matches
        .sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));

      setDriverOffers(driverOffers);
      return driverOffers;
    } catch (err: any) {
      setError(err.message);
      console.error('Error finding matching drivers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Find matching passengers for driver offer
  const findMatchingPassengers = async (
    driverPickup: string,
    driverDest: string,
    driverTime: string
  ): Promise<PassengerRequest[]> => {
    setLoading(true);
    setError(null);

    try {
      // Get all pending passenger requests
      const { data: requests, error: requestsError } = await supabase
        .from('passengers_details')
        .select(`
          id,
          passenger_id,
          pickup_location,
          destination_location,
          pickup_time,
          price,
          status,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requests || requests.length === 0) {
        return [];
      }

      // Get passenger details
      const passengerIds = requests.map(req => req.passenger_id);
      const { data: users, error: usersError } = await supabase
        .from('app_users')
        .select('id, full_name, phone')
        .in('id', passengerIds)
        .eq('role', 'passenger');

      if (usersError) throw usersError;

      // Create enhanced passenger requests with compatibility scores
      const passengerRequests: PassengerRequest[] = requests
        .map(request => {
          const passengerInfo = users?.find(u => u.id === request.passenger_id);
          if (!passengerInfo) return null;

          const pickupAddr = typeof request.pickup_location === 'object' 
            ? (request.pickup_location as any)?.address || ''
            : request.pickup_location || '';
          const destAddr = typeof request.destination_location === 'object'
            ? (request.destination_location as any)?.address || ''
            : request.destination_location || '';

          const compatibilityScore = calculateCompatibilityScore(
            driverPickup, driverDest, driverTime,
            pickupAddr, destAddr, request.pickup_time
          );

          return {
            id: request.id,
            passenger_id: request.passenger_id,
            passenger_name: passengerInfo.full_name,
            passenger_phone: passengerInfo.phone || undefined,
            pickup_location: pickupAddr,
            destination_location: destAddr,
            pickup_time: request.pickup_time,
            passenger_count: 1, // Default, can be enhanced
            price_range: request.price,
            status: request.status,
            created_at: request.created_at,
            compatibility_score: compatibilityScore
          } as PassengerRequest;
        })
        .filter((request): request is PassengerRequest => request !== null)
        .filter(request => request.compatibility_score! >= 40) // Min 40% compatibility for better matches
        .sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));

      setPassengerRequests(passengerRequests);
      return passengerRequests;
    } catch (err: any) {
      setError(err.message);
      console.error('Error finding matching passengers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Save passenger request
  const savePassengerRequest = async (
    pickup: string,
    destination: string,
    pickupTime: string,
    passengerCount: number = 1
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('passengers_details')
      .insert({
        passenger_id: user.id,
        pickup_location: { address: pickup },
        destination_location: { address: destination },
        pickup_time: pickupTime,
        status: 'pending'
      });

    if (error) {
      throw error;
    }
  };

  // Accept a ride request (for drivers)
  const acceptRideRequest = async (passengerRequestId: string, rideId: string) => {
    const { error } = await supabase
      .from('passengers_details')
      .update({ 
        driver_id: user?.id,
        status: 'confirmed' 
      })
      .eq('id', passengerRequestId);

    if (error) throw error;

    // Also update rides table
    await supabase
      .from('rides')
      .update({ status: 'confirmed' })
      .eq('id', rideId);
  };

  // Book a driver (for passengers)  
  const bookDriver = async (driverOfferId: string) => {
    const { error } = await supabase
      .from('rides')
      .update({ status: 'confirmed' })
      .eq('id', driverOfferId);

    if (error) throw error;
  };

  return {
    driverOffers,
    passengerRequests,
    loading,
    error,
    findMatchingDrivers,
    findMatchingPassengers,
    savePassengerRequest,
    acceptRideRequest,
    bookDriver,
    calculateCompatibilityScore
  };
};