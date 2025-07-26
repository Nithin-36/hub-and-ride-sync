import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/MockAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Phone, Star, MapPin, Navigation } from 'lucide-react';


interface MockBooking {
  id: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupTime: string;
  estimatedPrice: number;
  status: string;
  createdAt: string;
}

const RideTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRide, setActiveRide] = useState<MockBooking | null>(null);
  const [progress, setProgress] = useState(25);
  const [loading, setLoading] = useState(true);
  
  // Driver position state - simulate movement
  const [driverETA, setDriverETA] = useState(8);
  const [driverDistance, setDriverDistance] = useState(2.3);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchActiveRide();
  }, [user, navigate]);

  // Simulate driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverETA(prev => Math.max(1, prev - 0.2));
      setDriverDistance(prev => Math.max(0.1, prev - 0.05));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchActiveRide = async () => {
    try {
      // Get bookings from localStorage
      const bookings: MockBooking[] = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      const latestBooking = bookings[bookings.length - 1];
      
      if (latestBooking) {
        setActiveRide(latestBooking);
        setProgress(25);
        
        // Simulate ride progression
        setTimeout(() => setProgress(50), 2000);
        setTimeout(() => setProgress(75), 4000);
      }
    } catch (error) {
      console.error('Error fetching active ride:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Looking for drivers...';
      case 'matched': return 'Driver found! They\'re on their way';
      case 'in_progress': return 'Ride in progress';
      case 'completed': return 'Ride completed!';
      default: return 'Processing...';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'matched': return 'bg-blue-500';
      case 'in_progress': return 'bg-green-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (!activeRide) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border p-4">
          <div className="container mx-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">No Active Ride</h1>
          </div>
        </header>
        <div className="container mx-auto p-6 text-center">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">No active rides</h3>
              <p className="text-muted-foreground mb-4">
                Book a ride to see tracking information here.
              </p>
              <Button onClick={() => navigate('/book-ride')}>
                Book a Ride
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Live Driver Tracking</h1>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Live Tracking Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Live Driver Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 space-y-4">
              {/* Driver Status */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Driver is on the way</span>
                </div>
                <p className="text-2xl font-bold text-primary">ETA: {Math.round(driverETA)} minutes</p>
                <p className="text-muted-foreground">{driverDistance.toFixed(1)} km away</p>
              </div>
              
              {/* Interactive Map Placeholder */}
              <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
                <MapPin className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <h3 className="font-semibold mb-2">Live Map View</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track your driver's location in real-time
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Driver Location</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Your Location</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(activeRide.status)} text-white text-lg px-4 py-2`}
              >
                {getStatusMessage(activeRide.status)}
              </Badge>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-medium">{activeRide.pickupAddress}</p>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-muted ml-1.5 h-6"></div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{activeRide.destinationAddress}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(activeRide.pickupTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-lg font-bold">
                  ₹{activeRide.estimatedPrice}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mock Driver Details */}
        {progress > 25 && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">N</span>
                  </div>
                  <div>
                    <p className="font-medium">Nithin</p>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RideTracking;