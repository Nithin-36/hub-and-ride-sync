
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRides } from '@/hooks/useRides';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, IndianRupee, Star } from 'lucide-react';

const RideHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { rides, loading, error } = useRides();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading ride history...</p>
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
          <h1 className="text-xl font-bold">Ride History</h1>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-destructive mb-4">Error loading ride history: {error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : rides.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-lg font-semibold mb-2">No rides yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by booking your first ride!
              </p>
              <Button onClick={() => navigate('/book-ride')}>
                Book a Ride
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {new Date(ride.pickup_time).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(ride.status)} text-white`}
                    >
                      {ride.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pickup</p>
                        <p className="font-medium">{ride.pickup_location.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Destination</p>
                        <p className="font-medium">{ride.destination_location.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(ride.pickup_time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {ride.passenger_rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{ride.passenger_rating}/5</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-lg font-bold">
                      <IndianRupee className="h-4 w-4" />
                      {ride.estimated_price || ride.actual_price || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideHistory;
