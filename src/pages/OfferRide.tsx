import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';
import GoogleMap from '@/components/GoogleMap';
import { calculateCityDistance, calculateFare } from '@/utils/distanceCalculator';

const OfferRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{distance: number; fare: number} | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleSaveRide = async () => {
    if (!pickup || !destination) {
      toast.error('Please fill pickup and destination fields');
      return;
    }

    if (!user?.id) {
      toast.error('Please sign in to save your ride');
      return;
    }

    setIsSaving(true);
    
    try {
      // Calculate route info if not already set
      if (!routeInfo && pickup && destination) {
        const distance = calculateCityDistance(pickup, destination);
        if (distance > 0) {
          const fare = calculateFare(distance);
          setRouteInfo({ distance, fare });
        }
      }

      // Save ride details to drivers_details table
      const { error } = await supabase
        .from('drivers_details')
        .insert({
          driver_id: user.id,
          pick_up: pickup,
          destination: destination,
          pickup_location: { address: pickup },
          destination_location: { address: destination },
          pickup_time: new Date().toISOString(), // Current time as default
          distance_km: routeInfo?.distance || calculateCityDistance(pickup, destination),
          price: routeInfo?.fare || calculateFare(calculateCityDistance(pickup, destination) || 50),
          status: 'pending'
        });

      if (error) {
        console.error('Error saving ride:', error);
        toast.error('Failed to save ride. Please try again.');
      } else {
        toast.success('Ride saved successfully!');
        // Reset form
        setPickup('');
        setDestination('');
        setRouteInfo(null);
        setShowMap(false);
      }
    } catch (error) {
      console.error('Error saving ride:', error);
      toast.error('Failed to save ride. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Offer a Ride</h1>
        </div>

        {!showMap ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ride Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input
                  id="pickup"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter intercity pickup (e.g., Mumbai, Delhi)"
                />
              </div>
              
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter intercity destination (e.g., Pune, Jaipur)"
                />
              </div>

              {routeInfo && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estimated Route:</span>
                    <span className="text-primary font-bold">
                      {routeInfo.distance}km | ₹{routeInfo.fare}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on ₹4 per kilometer intercity rate
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowMap(true)}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Use Google Maps
                </Button>
                <Button 
                  onClick={handleSaveRide} 
                  className="w-full"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving Ride...' : 'Save Ride'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Route Planning</h2>
              <Button variant="outline" onClick={() => setShowMap(false)}>
                Back to Form
              </Button>
            </div>
            <GoogleMap 
              pickup={pickup}
              destination={destination}
              onRouteSelect={(route) => {
                setPickup(route.pickup);
                setDestination(route.destination);
                setRouteInfo({ distance: route.distance, fare: route.fare });
                setShowMap(false);
                toast.success('Route selected! Ready to save your ride.');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferRide;