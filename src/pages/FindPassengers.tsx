import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MapPin, Clock, Phone, Search, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useMatching, PassengerRequest } from '@/hooks/useMatching';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface DriverRide {
  id: string;
  pick_up: string;
  destination: string;
  pickup_time: string;
  distance_km?: number;
  price?: number;
}

const FindPassengers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { findMatchingPassengers, acceptRideRequest, loading, calculateCompatibilityScore } = useMatching();
  
  const [driverRides, setDriverRides] = useState<DriverRide[]>([]);
  const [selectedRide, setSelectedRide] = useState<DriverRide | null>(null);
  const [passengerRequests, setPassengerRequests] = useState<PassengerRequest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [autoSearchEnabled, setAutoSearchEnabled] = useState(true);

  // Fetch driver's active rides
  useEffect(() => {
    const fetchDriverRides = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('rides')
          .select('id, pick_up, destination, pickup_time, distance_km, price')
          .eq('driver_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDriverRides(data || []);
        
        // Auto-search for first ride if enabled
        if (data && data.length > 0 && autoSearchEnabled && !selectedRide) {
          handleSearchPassengers(data[0]);
        }
      } catch (error: any) {
        console.error('Error fetching driver rides:', error);
        toast.error('Failed to load your rides');
      }
    };

    fetchDriverRides();
  }, [user?.id]);

  // Real-time subscription for new passenger requests
  useEffect(() => {
    if (!user?.id || !selectedRide) return;

    const channel = supabase
      .channel('passenger-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'passengers_details',
          filter: `status=eq.pending`
        },
        async (payload) => {
          // Check if this new request matches any of the driver's routes
          const newRequest = payload.new;
          const pickupAddr = typeof newRequest.pickup_location === 'object' 
            ? (newRequest.pickup_location as any)?.address || ''
            : newRequest.pickup_location || '';
          const destAddr = typeof newRequest.destination_location === 'object'
            ? (newRequest.destination_location as any)?.address || ''
            : newRequest.destination_location || '';

          // Check compatibility with current selected ride
          if (selectedRide) {
            const score = calculateCompatibilityScore(
              selectedRide.pick_up,
              selectedRide.destination,
              selectedRide.pickup_time,
              pickupAddr,
              destAddr,
              newRequest.pickup_time
            );

            if (score >= 40) {
              setNewRequestsCount(prev => prev + 1);
              toast.success('New passenger request matches your route!', {
                description: `${pickupAddr} → ${destAddr}`,
                action: {
                  label: 'View',
                  onClick: () => handleSearchPassengers(selectedRide)
                }
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedRide, calculateCompatibilityScore]);

  const handleSearchPassengers = async (ride: DriverRide) => {
    setSelectedRide(ride);
    setIsSearching(true);
    setNewRequestsCount(0); // Reset notification count
    
    try {
      const matchingPassengers = await findMatchingPassengers(
        ride.pick_up,
        ride.destination,
        ride.pickup_time
      );
      
      setPassengerRequests(matchingPassengers);
      
      if (matchingPassengers.length === 0) {
        toast.info('No matching passenger requests found for this route.');
      } else {
        toast.success(`Found ${matchingPassengers.length} matching passenger request(s)!`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Failed to search for passengers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcceptRequest = async (passengerRequest: PassengerRequest) => {
    if (!selectedRide) return;

    try {
      await acceptRideRequest(passengerRequest.id, selectedRide.id);
      toast.success(`Ride confirmed with ${passengerRequest.passenger_name}!`);
      navigate('/ride-confirmation', { 
        state: { 
          passengerRequest,
          driverRide: selectedRide
        } 
      });
    } catch (error: any) {
      console.error('Accept request error:', error);
      toast.error('Failed to accept ride request. Please try again.');
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Possible Match';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to find passengers.</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Find Passengers</h1>
          </div>
          {newRequestsCount > 0 && (
            <Badge variant="default" className="bg-green-500 text-white animate-pulse">
              <Bell className="h-4 w-4 mr-1" />
              {newRequestsCount} New Request{newRequestsCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Driver's Active Rides */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Your Active Rides
              </div>
              <Badge variant="outline" className="text-xs">
                Auto-matching enabled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driverRides.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No active rides found.</p>
                <Button onClick={() => navigate('/offer-ride')} variant="outline">
                  Offer a Ride
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {driverRides.map((ride) => (
                  <Card key={ride.id} className={`cursor-pointer transition-colors ${
                    selectedRide?.id === ride.id ? 'ring-2 ring-primary' : 'hover:bg-accent/50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-medium">From:</span>
                            <span className="ml-2">{ride.pick_up}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-red-500" />
                            <span className="font-medium">To:</span>
                            <span className="ml-2">{ride.destination}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="font-medium">Departure:</span>
                            <span className="ml-2">
                              {format(new Date(ride.pickup_time), 'MMM dd, yyyy - hh:mm a')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          {ride.price && (
                            <p className="text-lg font-bold text-primary">₹{ride.price}</p>
                          )}
                          <Button 
                            onClick={() => handleSearchPassengers(ride)}
                            disabled={isSearching && selectedRide?.id === ride.id}
                            size="sm"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            {isSearching && selectedRide?.id === ride.id ? 'Searching...' : 'Find Passengers'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matching Passenger Requests */}
        {selectedRide && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {passengerRequests.length > 0 
                ? `Found ${passengerRequests.length} Matching Passenger Request${passengerRequests.length > 1 ? 's' : ''}` 
                : 'Passenger Requests'
              }
            </h2>
            
            {passengerRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No passenger requests found</p>
                    <p className="text-sm">
                      Passengers will see your ride offer when they search for rides on this route.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {passengerRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{request.passenger_name}</h3>
                          {request.passenger_phone && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {request.passenger_phone}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={`${getCompatibilityColor(request.compatibility_score || 0)} text-white`}
                          >
                            {request.compatibility_score?.toFixed(0)}% Match
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getCompatibilityLabel(request.compatibility_score || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">From:</span>
                          <span className="ml-2">{request.pickup_location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-red-500" />
                          <span className="font-medium">To:</span>
                          <span className="ml-2">{request.destination_location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">Requested Time:</span>
                          <span className="ml-2">
                            {format(new Date(request.pickup_time), 'MMM dd, yyyy - hh:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium">Passengers:</span>
                          <span className="ml-2">{request.passenger_count}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Requested {format(new Date(request.created_at), 'MMM dd, hh:mm a')}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {request.price_range && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">₹{request.price_range}</p>
                              <p className="text-xs text-muted-foreground">Budget</p>
                            </div>
                          )}
                          <Button onClick={() => handleAcceptRequest(request)}>
                            Accept Request
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPassengers;