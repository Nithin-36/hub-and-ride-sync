import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MapPin, Clock, Star, Phone, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useMatching, DriverOffer } from '@/hooks/useMatching';
import { format } from 'date-fns';

const FindRides = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { findMatchingDrivers, savePassengerRequest, bookDriver, loading } = useMatching();
  
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [matches, setMatches] = useState<DriverOffer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!pickup || !destination) {
      toast.error('Please fill pickup and destination fields');
      return;
    }

    if (!pickupTime) {
      toast.error('Please select pickup time');
      return;
    }

    setIsSearching(true);
    try {
      // Save passenger request first
      await savePassengerRequest(pickup, destination, pickupTime, passengerCount);
      toast.success('Your ride request has been saved!');

      // Find matching drivers
      const matchingDrivers = await findMatchingDrivers(pickup, destination, pickupTime);
      setMatches(matchingDrivers);
      setHasSearched(true);

      if (matchingDrivers.length === 0) {
        toast.info('No matching drivers found right now. Drivers will be notified of your request!');
      } else {
        toast.success(`Found ${matchingDrivers.length} matching driver(s)!`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Failed to search for rides. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookRide = async (driverOffer: DriverOffer) => {
    try {
      await bookDriver(driverOffer.id);
      toast.success(`Ride booked with ${driverOffer.driver_name}!`);
      navigate('/ride-confirmation', { 
        state: { 
          driverOffer,
          pickup,
          destination,
          pickupTime 
        } 
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error('Failed to book ride. Please try again.');
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
            <p className="text-muted-foreground mb-4">Please sign in to find and book rides.</p>
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
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Find Rides</h1>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search for Available Rides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input
                  id="pickup"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup city (e.g., Mumbai)"
                />
              </div>
              
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination city (e.g., Pune)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupTime">Pickup Date & Time</Label>
                <Input
                  id="pickupTime"
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <Label htmlFor="passengers">Number of Passengers</Label>
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  max="8"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <Button 
              onClick={handleSearch} 
              className="w-full"
              disabled={isSearching || loading}
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Find Matching Drivers'}
            </Button>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {matches.length > 0 
                ? `Found ${matches.length} Matching Driver${matches.length > 1 ? 's' : ''}` 
                : 'No Matching Drivers Found'
              }
            </h2>
            
            {matches.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-muted-foreground mb-4">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No drivers available right now</p>
                    <p className="text-sm">
                      Your request has been saved. Drivers will be notified when they offer rides on your route.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setHasSearched(false)}>
                    Search Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {matches.map((driver) => (
                  <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{driver.driver_name}</h3>
                          {driver.driver_phone && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {driver.driver_phone}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={`${getCompatibilityColor(driver.compatibility_score || 0)} text-white`}
                          >
                            {driver.compatibility_score?.toFixed(0)}% Match
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getCompatibilityLabel(driver.compatibility_score || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">From:</span>
                          <span className="ml-2">{driver.pickup_location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-red-500" />
                          <span className="font-medium">To:</span>
                          <span className="ml-2">{driver.destination_location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">Departure:</span>
                          <span className="ml-2">
                            {format(new Date(driver.pickup_time), 'MMM dd, yyyy - hh:mm a')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {driver.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm font-medium">{driver.rating}</span>
                            </div>
                          )}
                          {driver.distance_km && (
                            <div className="text-sm text-muted-foreground">
                              {driver.distance_km}km
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {driver.price && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">₹{driver.price}</p>
                              <p className="text-xs text-muted-foreground">Total Fare</p>
                            </div>
                          )}
                          <Button onClick={() => handleBookRide(driver)}>
                            Book Ride
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

export default FindRides;