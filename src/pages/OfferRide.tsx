import { useState } from 'react';
import { useAuth } from '@/context/MockAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, User, Phone, Shield, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import GoogleMap from '@/components/GoogleMap';
import { calculateCityDistance, calculateFare } from '@/utils/distanceCalculator';

interface MatchedPassenger {
  id: string;
  name: string;
  phone: string;
  pickup: string;
  destination: string;
  time: string;
  compatibility: number;
  distance?: number;
  fare?: number;
}

const OfferRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<MatchedPassenger[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchedPassenger | null>(null);
  const [otp, setOtp] = useState('');
  const [routeInfo, setRouteInfo] = useState<{distance: number; fare: number} | null>(null);
  const [showMap, setShowMap] = useState(false);

  const generateMockPassengers = (): MatchedPassenger[] => {
    const distance = routeInfo?.distance || calculateCityDistance(pickup, destination) || 50;
    const fare = routeInfo?.fare || calculateFare(distance);
    
    return [
      {
        id: '1',
        name: 'Veda Kumar',
        phone: '+91 98765 43210',
        pickup: pickup || 'Mumbai Central',
        destination: destination || 'Pune Station',
        time: '09:00 AM',
        compatibility: 95,
        distance,
        fare
      },
      {
        id: '2',
        name: 'Raj Patel',
        phone: '+91 87654 32109',
        pickup: pickup || 'Delhi Railway Station',
        destination: destination || 'Jaipur Bus Stand',
        time: '09:15 AM',
        compatibility: 87,
        distance,
        fare
      }
    ];
  };

  const handleOfferRide = async () => {
    if (!pickup || !destination || !time) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSearching(true);
    // Calculate route info if not already set
    if (!routeInfo && pickup && destination) {
      const distance = calculateCityDistance(pickup, destination);
      if (distance > 0) {
        const fare = calculateFare(distance);
        setRouteInfo({ distance, fare });
      }
    }
    
    // Simulate API call
    setTimeout(() => {
      const mockPassengers = generateMockPassengers();
      setMatches(mockPassengers);
      setIsSearching(false);
      toast.success(`Found ${mockPassengers.length} matching passengers!`);
    }, 2000);
  };

  const handleSelectPassenger = (passenger: MatchedPassenger) => {
    // Navigate to confirmation page with passenger details
    navigate("/ride-confirmation", {
      state: {
        passenger,
        routeInfo
      }
    });
  };

  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setSelectedMatch(null)} className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Ride Confirmed</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Ride Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Driver (You)</Label>
                  <p className="text-lg">{user?.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Passenger</Label>
                  <p className="text-lg">{selectedMatch.name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">Pickup: {selectedMatch.pickup}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Destination: {selectedMatch.destination}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Time: {selectedMatch.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Contact: {selectedMatch.phone}</span>
                </div>
                {selectedMatch.distance && selectedMatch.fare && (
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Distance: {selectedMatch.distance}km | Fare: ₹{selectedMatch.fare}</span>
                  </div>
                )}
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <Label className="text-sm font-medium">Verification OTP</Label>
                <p className="text-2xl font-bold text-primary">{otp}</p>
                <p className="text-sm text-muted-foreground">Share this OTP with the passenger to start the ride</p>
              </div>

              <Button className="w-full" onClick={() => toast.success('Ride started successfully!')}>
                Start Ride
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              
              <div>
                <Label htmlFor="time">Departure Time</Label>
                <Input
                  id="time"
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
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
                  Use Google Maps
                </Button>
                <Button 
                  onClick={handleOfferRide} 
                  className="w-full"
                  disabled={isSearching}
                >
                  {isSearching ? 'Finding Passengers...' : 'Find Passengers'}
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
                toast.success('Route selected! Ready to find passengers.');
              }}
            />
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Matching Passengers</h2>
            {matches.map((passenger) => (
              <Card key={passenger.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">{passenger.name}</h3>
                        <p className="text-sm text-muted-foreground">{passenger.phone}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {passenger.compatibility}% Match
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">From: {passenger.pickup}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-destructive" />
                      <span className="text-sm">To: {passenger.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Time: {passenger.time}</span>
                    </div>
                    {passenger.distance && passenger.fare && (
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {passenger.distance}km | ₹{passenger.fare} total
                        </span>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleSelectPassenger(passenger)}
                    className="w-full"
                  >
                    Select This Passenger
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferRide;