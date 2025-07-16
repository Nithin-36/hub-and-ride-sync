
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Clock, IndianRupee, MapPin } from 'lucide-react';

const BookRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [estimatedDistance, setEstimatedDistance] = useState(15); // km
  const [estimatedPrice, setEstimatedPrice] = useState(120); // ₹8 per km
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
      const pickupDateTime = new Date(pickupTime).toISOString();
      
      const { error } = await supabase
        .from('rides')
        .insert({
          passenger_id: user.id,
          pickup_location: {
            address: pickupAddress
          },
          destination_location: {
            address: destinationAddress
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

            {/* Price Estimate */}
            {pickupAddress && destinationAddress && (
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
