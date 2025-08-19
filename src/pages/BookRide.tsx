
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Clock, IndianRupee, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import { calculateFare } from '@/utils/distanceCalculator';

const BookRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [estimatedDistance] = useState(75); // km (example showing both pricing tiers)
  const estimatedPrice = calculateFare(estimatedDistance);
  const pricePerPassenger = Math.round(estimatedPrice / passengers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBookRide = async () => {
    if (!user || !pickupAddress || !destinationAddress || !pickupTime) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create ride request in Supabase
      const { data: rideRequest, error } = await supabase
        .from('ride_requests')
        .insert({
          passenger_id: user.id,
          pickup_location: {
            address: pickupAddress,
            coordinates: { lat: 0, lng: 0 } // Add real coordinates if needed
          },
          destination_location: {
            address: destinationAddress,
            coordinates: { lat: 0, lng: 0 } // Add real coordinates if needed
          },
          pickup_time: pickupTime,
          max_price: estimatedPrice,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create ride record
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .insert({
          passenger_id: user.id,
          pickup_location: {
            address: pickupAddress,
            coordinates: { lat: 0, lng: 0 }
          },
          destination_location: {
            address: destinationAddress,
            coordinates: { lat: 0, lng: 0 }
          },
          pickup_time: pickupTime,
          estimated_distance: estimatedDistance,
          estimated_price: estimatedPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (rideError) {
        throw rideError;
      }

      toast.success('Ride booked successfully!');
      navigate('/ride-tracking');
    } catch (error: any) {
      setError('Failed to book ride. Please try again.');
      toast.error('Failed to book ride. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Book a Ride</h1>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Where are you going?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="pickup"
                  placeholder="Enter pickup address"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="pl-10 min-h-[60px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="destination"
                  placeholder="Where to?"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="pl-10 min-h-[60px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Pickup Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers">Number of Passengers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  max="4"
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Maximum 4 passengers per ride</p>
            </div>

            {/* Price Estimate */}
            {pickupAddress && destinationAddress && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Total Fare</h3>
                        <p className="text-sm text-muted-foreground">
                          {estimatedDistance} km • {estimatedDistance <= 50 ? '₹4/km' : '₹4/km up to 50km, ₹9/km after'}
                        </p>
                      </div>
                      <div className="flex items-center text-2xl font-bold text-primary">
                        <IndianRupee className="h-6 w-6" />
                        {estimatedPrice}
                      </div>
                    </div>
                    
                    {passengers > 1 && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Per Passenger</h4>
                            <p className="text-sm text-muted-foreground">
                              Split among {passengers} passengers
                            </p>
                          </div>
                          <div className="flex items-center text-lg font-semibold text-green-600">
                            <IndianRupee className="h-5 w-5" />
                            {pricePerPassenger}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleBookRide} 
              className="w-full" 
              size="lg"
              disabled={loading || !pickupAddress || !destinationAddress || !pickupTime}
            >
              {loading ? 'Booking Ride...' : 'Book Ride'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookRide;
