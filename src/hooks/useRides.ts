import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Ride {
  id: string;
  passenger_id: string;
  driver_id?: string;
  pickup_location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  destination_location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  pickup_time: string;
  estimated_distance?: number;
  estimated_price?: number;
  actual_distance?: number;
  actual_price?: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  passenger_rating?: number;
  driver_rating?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  passenger_feedback?: string;
  driver_feedback?: string;
}

export const useRides = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRides = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRides(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveRide = () => {
    return rides.find(ride => 
      ride.status === 'confirmed' || 
      ride.status === 'in_progress'
    );
  };

  const updateRideStatus = async (rideId: string, status: Ride['status']) => {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'completed' && { completed_at: new Date().toISOString() })
        })
        .eq('id', rideId);

      if (error) {
        throw error;
      }

      // Update local state
      setRides(prev => prev.map(ride => 
        ride.id === rideId 
          ? { ...ride, status, updated_at: new Date().toISOString() }
          : ride
      ));

      return { success: true };
    } catch (err: any) {
      console.error('Error updating ride status:', err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchUserRides();
  }, [user]);

  return {
    rides,
    loading,
    error,
    fetchUserRides,
    getActiveRide,
    updateRideStatus
  };
};