import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calculator } from 'lucide-react';
import { toast } from 'sonner';

// Declare global google object for TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  onRouteSelect?: (route: { pickup: string; destination: string; distance: number; duration: string; fare: number }) => void;
  pickup?: string;
  destination?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ onRouteSelect, pickup = '', destination = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  
  const [pickupLocation, setPickupLocation] = useState(pickup);
  const [destinationLocation, setDestinationLocation] = useState(destination);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<string>('');
  const [fare, setFare] = useState<number>(0);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if API key is available
  useEffect(() => {
    // For development, show input for API key
    const savedApiKey = localStorage.getItem('google_maps_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const initializeMap = async (key: string) => {
    if (!mapRef.current || !key) return;

    try {
      const loader = new Loader({
        apiKey: key,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 12.9716, lng: 77.5946 }, // Bangalore center
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      directionsService.current = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        draggable: false,
        map: mapInstance.current,
        panel: undefined
      });

      setIsLoaded(true);
      toast.success('Google Maps loaded successfully!');
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast.error('Failed to load Google Maps. Please check your API key.');
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('google_maps_api_key', apiKey);
      initializeMap(apiKey);
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const calculateRoute = async () => {
    if (!directionsService.current || !directionsRenderer.current || !pickupLocation || !destinationLocation) {
      toast.error('Please enter both pickup and destination locations');
      return;
    }

    try {
      const request: google.maps.DirectionsRequest = {
        origin: pickupLocation,
        destination: destinationLocation,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
      };

      const result = await directionsService.current.route(request);
      directionsRenderer.current.setDirections(result);

      const route = result.routes[0];
      const leg = route.legs[0];
      
      const distanceKm = leg.distance?.value ? Math.round(leg.distance.value / 1000) : 0;
      const durationText = leg.duration?.text || '';
      const calculatedFare = distanceKm * 4; // ₹4 per km

      setDistance(distanceKm);
      setDuration(durationText);
      setFare(calculatedFare);

      if (onRouteSelect) {
        onRouteSelect({
          pickup: pickupLocation,
          destination: destinationLocation,
          distance: distanceKm,
          duration: durationText,
          fare: calculatedFare
        });
      }

      toast.success(`Route calculated: ${distanceKm} km, ₹${calculatedFare}`);
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Failed to calculate route. Please check the locations.');
    }
  };

  // API Key input component
  if (!isLoaded) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Google Maps Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apikey">Google Maps API Key</Label>
            <Input
              id="apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Maps API key"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>
          <Button onClick={handleApiKeySubmit} className="w-full">
            Load Google Maps
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input
                id="pickup"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Enter pickup address"
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                placeholder="Enter destination address"
              />
            </div>
          </div>
          
          <Button onClick={calculateRoute} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Route & Fare
          </Button>

          {distance > 0 && (
            <div className="bg-primary/10 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium">Distance</p>
                  <p className="text-lg font-bold">{distance} km</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-lg font-bold">{duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Fare</p>
                  <p className="text-lg font-bold text-primary">₹{fare}</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Calculated at ₹4 per kilometer
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border shadow-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default GoogleMap;