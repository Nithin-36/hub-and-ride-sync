
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MapPin, Clock, Phone, Star } from 'lucide-react';

interface RideLocation {
  address: string;
  lat?: number;
  lng?: number;
}

interface ActiveRide {
  id: string;
  pickup_location: RideLocation;
  destination_location: RideLocation;
  pickup_time: string;
  estimated_price: number | null;
  status: string;
  driver_id?: string | null;
}

const RideTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [progress, setProgress] = useState(25);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchActiveRide();
    setupRealtimeSubscription();
  }, [user, navigate]);

  const fetchActiveRide = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('passenger_id', user?.id)
        .in('status', ['pending', 'matched', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        // Transform the data to match our interface
        const transformedRide = {
          ...data,
          pickup_location: typeof data.pickup_location === 'string' 
            ? JSON.parse(data.pickup_location) 
            : data.pickup_location,
          destination_location: typeof data.destination_location === 'string'
            ? JSON.parse(data.destination_location)
            : data.destination_location
        };
        
        setActiveRide(transformedRide);
        
        // Update progress based on status
        switch (data.status) {
          case 'pending': setProgress(25); break;
          case 'matched': setProgress(50); break;
          case 'in_progress': setProgress(75); break;
          case 'completed': setProgress(100); break;
        }
      }
    } catch (error) {
      console.error('Error fetching active ride:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('ride-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `passenger_id=eq.${user?.id}`
        },
        (payload) => {
          const transformedRide = {
            ...payload.new,
            pickup_location: typeof payload.new.pickup_location === 'string' 
              ? JSON.parse(payload.new.pickup_location) 
              : payload.new.pickup_location,
            destination_location: typeof payload.new.destination_location === 'string'
              ? JSON.parse(payload.new.destination_location)
              : payload.new.destination_location
          };
          
          setActiveRide(transformedRide as ActiveRide);
          
          // Update progress based on status
          switch (payload.new.status) {
            case 'pending': setProgress(25); break;
            case 'matched': setProgress(50); break;
            case 'in_progress': setProgress(75); break;
            case 'completed': 
              setProgress(100);
              setTimeout(() => navigate('/dashboard'), 2000);
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          <h1 className="text-xl font-bold">Track Ride</h1>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
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
                  <p className="font-medium">{activeRide.pickup_location.address}</p>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-muted ml-1.5 h-6"></div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{activeRide.destination_location.address}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(activeRide.pickup_time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-lg font-bold">
                  ₹{activeRide.estimated_price}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Details (when matched) */}
        {activeRide.status !== 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">D</span>
                  </div>
                  <div>
                    <p className="font-medium">Driver Name</p>
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

        {/* Real-time Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Live Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Real-time map tracking would appear here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Integration with maps API coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RideTracking;
