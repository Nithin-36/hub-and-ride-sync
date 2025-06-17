
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Clock, IndianRupee } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';
import LocationSearch from '@/components/LocationSearch';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

const BookRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null);
  const [pickupTime, setPickupTime] = useState('');
  const [estimatedDistance, setEstimatedDistance] = useState(15); // km
  const [estimatedPrice, setEstimatedPrice] = useState(120); // ₹8 per km
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDistance = (pickup: LocationData, destination: LocationData) => {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = (destination.lat - pickup.lat) * Math.PI / 180;
    const dLon = (destination.lng - pickup.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickup.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const handlePickupSelect = (location: LocationData) => {
    setPickupLocation(location);
    if (destinationLocation) {
      const distance = calculateDistance(location, destinationLocation);
      setEstimatedDistance(distance);
      setEstimatedPrice(distance * 8);
    }
  };

  const handleDestinationSelect = (location: LocationData) => {
    setDestinationLocation(location);
    if (pickupLocation) {
      const distance = calculateDistance(pickupLocation, location);
      setEstimatedDistance(distance);
      setEstimatedPrice(distance * 8);
    }
  };

  const handleBookRide = async () => {
    if (!user || !pickupLocation || !destinationLocation || !pickupTime) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pickupDateTime = new Date(pickupTime).toISOString();
      
      const { error } = await supabase
        .from('rides')
        .insert({
          passenger_id: user.id,
          pickup_location: {
            lat: pickupLocation.lat,
            lng: pickupLocation.lng,
            address: pickupLocation.address
          },
          destination_location: {
            lat: destinationLocation.lat,
            lng: destinationLocation.lng,
            address: destinationLocation.address
          },
          pickup_time: pickupDateTime,
          estimated_distance: estimatedDistance,
          estimated_price: estimatedPrice,
          status: 'pending'
        });

      if (error) throw error;

      // Navigate to ride tracking page
      navigate('/ride-tracking');
    } catch (error: any) {
      setError(error.message);
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

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Where are you going?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <LocationSearch
                  placeholder="Enter pickup location"
                  onLocationSelect={handlePickupSelect}
                  value={pickupLocation?.address || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <LocationSearch
                  placeholder="Where to?"
                  onLocationSelect={handleDestinationSelect}
                  value={destinationLocation?.address || ''}
                />
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

              {/* Price Estimate */}
              {pickupLocation && destinationLocation && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Estimated Fare</h3>
                        <p className="text-sm text-muted-foreground">
                          {estimatedDistance} km × ₹8/km
                        </p>
                      </div>
                      <div className="flex items-center text-2xl font-bold text-primary">
                        <IndianRupee className="h-6 w-6" />
                        {estimatedPrice}
                      </div>
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
                disabled={loading || !pickupLocation || !destinationLocation || !pickupTime}
              >
                {loading ? 'Booking Ride...' : 'Book Ride'}
              </Button>
            </CardContent>
          </Card>

          {/* Map Section */}
          <Card>
            <CardHeader>
              <CardTitle>Route Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleMap
                pickup={pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng } : undefined}
                destination={destinationLocation ? { lat: destinationLocation.lat, lng: destinationLocation.lng } : undefined}
                showDirections={!!(pickupLocation && destinationLocation)}
                height="400px"
                className="rounded-lg overflow-hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookRide;
